/**
 * This loader is based on the linaria webpack loader. Just some minor changes to support virtual modules.
 * https://github.com/callstack/linaria/blob/462739a781e31d5a8266957c0a4800292f452441/packages/webpack5-loader/src/index.ts
 *
 * This file contains a Webpack loader for Linaria.
 * It uses the transform.ts function to generate class names from source code,
 * returns transformed code without template literals and attaches generated source maps
 */
import type {
  PluginOptions,
  Preprocessor,
  Result,
} from '@linaria/babel-preset';
import { transform } from '@linaria/babel-preset';
import crypto from 'crypto';
import path from 'path';
import type { RawLoaderDefinitionFunction } from 'webpack';

import VirtualModuleStore from '../VirtualModuleStore';

export const LINARIA_MODULE_EXTENSION = '.linaria.module';
export const LINARIA_GLOBAL_EXTENSION = '.linaria.global';

export const regexLinariaModuleCSS = /\.linaria\.module\.css$/;
export const regexLinariaGlobalCSS = /\.linaria\.global\.css$/;
export const regexLinariaCSS = /\.linaria\.(module|global)\.css$/;

export type LinariaLoaderOptions = {
  /**
   * Enable in-memory cache for transformed code.
   * This can increase performance gains when working with big files.
   * However, downside is that every file needs to be hashed and
   * stored in memory.
   *
   * @default true
   */
  enableInMemoryCache?: boolean;
  moduleStore: VirtualModuleStore;
  preprocessor?: Preprocessor;
  sourceMap?: boolean;
} & Partial<PluginOptions>;

type LoaderType = RawLoaderDefinitionFunction<LinariaLoaderOptions>;

function convertSourceMap(
  value: Parameters<LoaderType>[1],
  filename: string,
): Parameters<typeof transform>[1]['inputSourceMap'] {
  if (typeof value === 'string' || !value) {
    return undefined;
  }

  return {
    ...value,
    file: value.file ?? filename,
    mappings: value.mappings ?? '',
    names: value.names ?? [],
    sources: value.sources ?? [],
    version: value.version ?? 3,
  };
}

/**
 * In-Memory cache for the transformed code.
 */
const cache = new Map<
  string,
  {
    code: string;
    hash: string;
    sourceMap: string | undefined | any;
  }
>();

const transformLoader: LoaderType = function (content, inputSourceMap) {
  const {
    sourceMap = undefined,
    preprocessor = undefined,
    moduleStore,
    enableInMemoryCache = true,
    ...rest
  } = this.getOptions() || {};

  let contentHash;
  if (enableInMemoryCache) {
    // create md5 hash of the file content
    contentHash = crypto.createHash('md5').update(content).digest('hex');

    // Check if we have a cached version of the transformed code
    // so we don't have to re-run the transform if the file hasn't changed
    const cacheEntry = cache.get(this.resourcePath);
    if (cacheEntry?.hash === contentHash) {
      this.callback(null, cacheEntry?.code, cacheEntry?.sourceMap);
      return;
    }
  }

  // tell Webpack this loader is async
  this.async();

  const asyncResolve = (token: string, importer: string): Promise<string> => {
    const context = path.isAbsolute(importer)
      ? path.dirname(importer)
      : path.join(process.cwd(), path.dirname(importer));
    return new Promise((resolve, reject) => {
      this.resolve(context, token, (err, result) => {
        if (err) {
          console.error(err);
          reject(err);
        } else if (result) {
          this.addDependency(result);
          resolve(result);
        } else {
          reject(new Error(`Cannot resolve ${token}`));
        }
      });
    });
  };

  transform(
    content.toString(),
    {
      filename: this.resourcePath,
      inputSourceMap: convertSourceMap(inputSourceMap, this.resourcePath),
      pluginOptions: rest,
      preprocessor,
    },
    asyncResolve,
  ).then(
    async (result: Result) => {
      if (result.cssText) {
        let { cssText } = result;

        if (sourceMap) {
          cssText += `/*# sourceMappingURL=data:application/json;base64,${Buffer.from(
            result.cssSourceMapText || '',
          ).toString('base64')}*/`;
        }

        await Promise.all(
          result.dependencies?.map((dep) =>
            asyncResolve(dep, this.resourcePath),
          ) ?? [],
        );

        try {
          const filename = path.basename(
            this.resourcePath,
            path.extname(this.resourcePath),
          );
          const fileDir = path.dirname(this.resourcePath);
          const isGlobalStyle = filename.endsWith(LINARIA_GLOBAL_EXTENSION);

          const cssModuleName = `${filename}${
            isGlobalStyle ? '' : LINARIA_MODULE_EXTENSION
          }.css`;

          const fullPathToModule = path.join(fileDir, cssModuleName);

          await Promise.all([
            moduleStore.addModule(fullPathToModule, cssText),
            moduleStore.addModuleDependencies(
              fullPathToModule,
              this.getDependencies(),
            ),
          ]);

          const code = `${result.code}\n\nrequire("./${cssModuleName}");`;

          if (enableInMemoryCache) {
            cache.set(this.resourcePath, {
              code,
              hash: contentHash,
              sourceMap: result.sourceMap,
            });
          }

          this.callback(null, code, result.sourceMap || undefined);
        } catch (err) {
          this.callback(err as Error);
        }

        return;
      }

      if (enableInMemoryCache) {
        cache.set(this.resourcePath, {
          code: result.code,
          hash: contentHash,
          sourceMap: result.sourceMap,
        });
      }

      this.callback(null, result.code, result.sourceMap || undefined);
    },
    (err: Error) => this.callback(err),
  );
};

export default transformLoader;
