/**
 * This was inspired by  https://github.com/callstack/linaria/blob/462739a781e31d5a8266957c0a4800292f452441/packages/webpack5-loader/src/index.ts
 */

import zlib from 'node:zlib';

import type { PluginOptions, Preprocessor, Result } from '@wyw-in-js/transform';
import { transform, TransformCacheCollection } from '@wyw-in-js/transform';
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
  /**
   * Eanbles a prefixer for css rules.
   * @default true
   */
  prefixer?: boolean;
  preprocessor?: Preprocessor;
  sourceMap?: boolean;
} & Partial<PluginOptions>;

type LoaderType = RawLoaderDefinitionFunction<
  LinariaLoaderOptions & { name: string }
>;

// `@wyw-in-js/transform` does not export the services type of `transform`, and its
// package `exports` map blocks deep imports, so derive it from the function itself.
type TransformServices = Parameters<typeof transform>[0];

const cache = new TransformCacheCollection();

type Resolver = (
  what: string,
  importer: string,
  stack: string[],
) => Promise<string>;

const resolvers: Record<string, Resolver[]> = {};

const stripQueryAndHash = (request: string) => {
  const queryIdx = request.indexOf('?');
  const hashIdx = request.indexOf('#');
  if (queryIdx === -1)
    return hashIdx === -1 ? request : request.slice(0, hashIdx);
  if (hashIdx === -1) return request.slice(0, queryIdx);
  return request.slice(0, Math.min(queryIdx, hashIdx));
};

const getResolverKey = (importer: string, stack: string[]): string => {
  const root = stack.length ? stack[stack.length - 1] : importer;
  return stripQueryAndHash(root);
};

const asyncResolve = (
  what: string,
  importer: string,
  stack: string[] = [importer],
): Promise<string> => {
  const key = getResolverKey(importer, stack);
  const resolver = resolvers[key];
  if (!resolver || resolver.length === 0) {
    throw new Error(`No resolver found for ${key}`);
  }

  return Promise.all(resolver.map((r) => r(what, importer, stack))).then(
    (results) => {
      const firstResult = results[0];
      if (results.some((r) => r !== firstResult)) {
        throw new Error('Resolvers returned different results');
      }
      return firstResult;
    },
  );
};

function addResolver(resourcePath: string, resolver: Resolver) {
  const key = stripQueryAndHash(resourcePath);
  if (!resolvers[key]) {
    resolvers[key] = [];
  }
  resolvers[key].push(resolver);
  return () => {
    resolvers[key] = resolvers[key].filter((r) => r !== resolver);
  };
}

const webpackTransformLoader: LoaderType = function (content, inputSourceMap) {
  // tell Webpack this loader is async
  this.async();

  const {
    fastCheck = true,
    prefixer = true,
    ...pluginOptions
  } = this.getOptions() || {};

  const contentStr = content.toString();

  // Use the performFastCheck utility function
  if (!performFastCheck(contentStr, fastCheck)) {
    this.callback(null, contentStr, inputSourceMap);
    return;
  }

  const removeResolver = addResolver(this.resourcePath, (what, importer) => {
    const importerPath = stripQueryAndHash(importer);
    const context = path.isAbsolute(importerPath)
      ? path.dirname(importerPath)
      : path.join(process.cwd(), path.dirname(importerPath));

    return new Promise((resolve, reject) => {
      this.resolve(context, what, (err, result) => {
        if (err) {
          reject(err);
        } else if (result) {
          const filePath = stripQueryAndHash(result);
          if (path.isAbsolute(filePath)) {
            this.addDependency(filePath);
          }
          resolve(result);
        } else {
          reject(new Error(`Cannot resolve ${what}`));
        }
      });
    });
  });

  const filename = path.basename(
    this.resourcePath,
    path.extname(this.resourcePath),
  );

  const transformServices: TransformServices = {
    options: {
      filename: this.resourcePath,
      inputSourceMap: convertSourceMap(inputSourceMap, this.resourcePath),
      root: process.cwd(),
      prefixer,
      pluginOptions,
    },
    cache,
  };

  transform(transformServices, contentStr, asyncResolve)
    .then(async (result: Result) => {
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
    })
    .catch((err: Error) => this.callback(err))
    .finally(removeResolver);
};

export default webpackTransformLoader;
