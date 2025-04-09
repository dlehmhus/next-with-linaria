/**
 * This loader is based on the linaria webpack loader. Just some minor changes to support virtual modules.
 * https://github.com/callstack/linaria/blob/462739a781e31d5a8266957c0a4800292f452441/packages/webpack5-loader/src/index.ts
 *
 * This file contains a Webpack loader for Linaria.
 * It uses the transform.ts function to generate class names from source code,
 * returns transformed code without template literals and attaches generated source maps
 */

import type { PluginOptions, Preprocessor, Result } from '@wyw-in-js/transform';
import { transform, TransformCacheCollection } from '@wyw-in-js/transform';
import path from 'path';
import type { RawLoaderDefinitionFunction } from 'webpack';

import ModuleStore from '../module-store';
import { logger } from '../utils/logger';

export const LINARIA_MODULE_EXTENSION = '.linaria.module';
export const LINARIA_GLOBAL_EXTENSION = '.linaria.global';
export const LINARIA_CSS_ALIAS = '@linaria-css';

export const regexLinariaModuleCSS = /\.linaria\.module\.css$/;
export const regexLinariaGlobalCSS = /\.linaria\.global\.css$/;
export const regexLinariaCSS = /\.linaria\.(module|global)\.css$/;

// Pattern to quickly check if file potentially contains Linaria syntax
const LINARIA_SYNTAX_PATTERN = /(styled[.(]|css`)/;

export type LinariaLoaderOptions = {
  /**
   * Enables a quick syntax check to skip transform for files that don't contain Linaria code.
   * This can significantly improve performance for large projects.
   * @default false
   */
  fastCheck?: boolean;
  moduleStore: ModuleStore;
  preprocessor?: Preprocessor;
  sourceMap?: boolean;
} & Partial<PluginOptions>;

type LoaderType = RawLoaderDefinitionFunction<LinariaLoaderOptions>;

const cache = new TransformCacheCollection();

// Track if we've shown the fastCheck message already
let fastCheckMessageShown = false;

function convertSourceMap(
  value: Parameters<LoaderType>[1],
  filename: string,
): Parameters<typeof transform>[0]['options']['inputSourceMap'] {
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

const transformLoader: LoaderType = function (content, inputSourceMap) {
  // tell Webpack this loader is async
  this.async();

  const {
    sourceMap = undefined,
    preprocessor = undefined,
    moduleStore,
    fastCheck = true,
    ...rest
  } = this.getOptions() || {};

  // Show the fastCheck message once per build
  if (fastCheck && !fastCheckMessageShown) {
    logger.info(
      'Linaria fastCheck optimization enabled - skipping transform for files without Linaria syntax',
    );
    logger.info(
      'If you experience styling issues, try disabling fastCheck in your webpack config',
    );
    fastCheckMessageShown = true;
  }

  const contentStr = content.toString();

  // Skip transform for files without Linaria syntax if fastCheck is enabled
  if (fastCheck && !LINARIA_SYNTAX_PATTERN.test(contentStr)) {
    this.callback(null, contentStr, inputSourceMap);
    return;
  }

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

  const transformServices = {
    options: {
      filename: this.resourcePath,
      inputSourceMap: convertSourceMap(inputSourceMap, this.resourcePath),
      root: process.cwd(),
      preprocessor,
      pluginOptions: rest,
    },
    cache,
  };

  transform(transformServices, contentStr, asyncResolve).then(
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
          const pathFromProjectRoot = path.relative(
            process.cwd(),
            this.resourcePath,
          );

          const sanitizedPath = pathFromProjectRoot.replace(
            /[^a-zA-Z0-9]/g,
            '_',
          );

          const filename = path.basename(
            this.resourcePath,
            path.extname(this.resourcePath),
          );

          const isGlobalStyle = filename.endsWith(LINARIA_GLOBAL_EXTENSION);

          const cssModuleName = `${LINARIA_CSS_ALIAS}/${sanitizedPath}${
            isGlobalStyle ? LINARIA_GLOBAL_EXTENSION : LINARIA_MODULE_EXTENSION
          }.css`;

          moduleStore.addModule(cssModuleName, cssText);
          moduleStore.addModuleDependencies(
            cssModuleName,
            this.getDependencies(),
          );

          this.callback(
            null,
            `${result.code}\n\nrequire("${cssModuleName}");`,
            result.sourceMap ?? undefined,
          );
        } catch (err) {
          this.callback(err as Error);
        }

        return;
      }

      this.callback(null, result.code, result.sourceMap ?? undefined);
    },
    (err: Error) => this.callback(err),
  );
};

export default transformLoader;
