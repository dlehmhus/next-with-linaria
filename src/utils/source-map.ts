import type { RawLoaderDefinitionFunction } from 'webpack';

import type { LinariaLoaderOptions } from '../loaders/webpack-transform-loader';

type LoaderType = RawLoaderDefinitionFunction<
  LinariaLoaderOptions & { name: string }
>;

export function convertSourceMap(
  value: Parameters<LoaderType>[1],
  filename: string,
): Parameters<
  typeof import('@wyw-in-js/transform').transform
>[0]['options']['inputSourceMap'] {
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
