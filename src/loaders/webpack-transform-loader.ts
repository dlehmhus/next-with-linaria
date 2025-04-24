/**
 * This was inspired by  https://github.com/callstack/linaria/blob/462739a781e31d5a8266957c0a4800292f452441/packages/webpack5-loader/src/index.ts
 */

import zlib from 'node:zlib';

import type { PluginOptions, Preprocessor, Result } from '@wyw-in-js/transform';
import { transform, TransformCacheCollection } from '@wyw-in-js/transform';
import { PartialServices } from '@wyw-in-js/transform/types/transform/helpers/withDefaultServices';
import path from 'path';
import type { RawLoaderDefinitionFunction } from 'webpack';

import { performFastCheck } from '../utils/fast-check';
import { insertImportStatement } from '../utils/insert-import';
import { convertSourceMap } from '../utils/source-map';
import { LINARIA_GLOBAL_EXTENSION, LINARIA_MODULE_EXTENSION } from './consts';

export type LinariaLoaderOptions = {
  /**
   * Enables a quick syntax check to skip transform for files that don't contain Linaria code.
   * This can significantly improve performance for large projects.
   * @default false
   */
  fastCheck?: boolean;
  preprocessor?: Preprocessor;
  sourceMap?: boolean;
} & Partial<PluginOptions>;

type LoaderType = RawLoaderDefinitionFunction<
  LinariaLoaderOptions & { name: string }
>;

const cache = new TransformCacheCollection();

const webpackTransformLoader: LoaderType = function (content, inputSourceMap) {
  // tell Webpack this loader is async
  this.async();

  const { fastCheck = true, ...pluginOptions } = this.getOptions() || {};

  const contentStr = content.toString();

  // Use the performFastCheck utility function
  if (!performFastCheck(contentStr, fastCheck)) {
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

  const filename = path.basename(
    this.resourcePath,
    path.extname(this.resourcePath),
  );

  const transformServices = {
    options: {
      filename: this.resourcePath,
      inputSourceMap: convertSourceMap(inputSourceMap, this.resourcePath),
      root: process.cwd(),
      pluginOptions,
    },
    cache,
  } as PartialServices;

  transform(transformServices, contentStr, asyncResolve).then(
    async (result: Result) => {
      if (result.cssText) {
        const { cssText } = result;

        await Promise.all(
          result.dependencies?.map((dep) => {
            return asyncResolve(dep, this.resourcePath);
          }) ?? [],
        );

        try {
          const compressedCss = zlib.gzipSync(cssText);
          const encodedCss = Buffer.from(compressedCss).toString('base64');

          const isGlobalStyle = filename.endsWith(LINARIA_GLOBAL_EXTENSION);
          const cssSuffix = isGlobalStyle
            ? `${LINARIA_GLOBAL_EXTENSION}.css`
            : `${LINARIA_MODULE_EXTENSION}.css`;
          const cssFilename = `${filename}${cssSuffix}`;

          /// Example: import "./Component.linaria.module.css!=!./Component?./Component.linaria.module.css?css=..."
          /// The "!=!" syntax tells webpack to use specific loaders for this import
          /// The "?" parameter is needed for Next.js compatibility as it ignores the "!=!" directive
          /// The "css=" parameter is used to pass the compressed CSS to the output loader

          const importStatement = `import "./${cssFilename}!=!./${filename}?./${cssFilename}?css=${encodedCss}"`;

          const finalCode = insertImportStatement(result.code, importStatement);

          this.callback(null, finalCode, result.sourceMap ?? undefined);
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

export default webpackTransformLoader;
