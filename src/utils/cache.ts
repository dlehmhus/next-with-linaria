import path from 'path';
import * as Webpack from 'webpack';

import { isFSCache } from '../utils';

export const CACHE_NAME = 'next-with-linaria';

export const getCacheBasePath = (config: Webpack.Configuration) => {
  const fallback = path.join('.next', 'cache');

  const mode = config.mode ?? 'development';

  return isFSCache(config.cache)
    ? path.join(config.cache.cacheDirectory ?? fallback, CACHE_NAME, mode)
    : path.join(fallback, CACHE_NAME, mode);
};
