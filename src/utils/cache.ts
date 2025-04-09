import crypto from 'crypto';
import path from 'path';
import type * as Webpack from 'webpack';

import { isFSCache } from '../utils';

export const CACHE_NAME = 'next-with-linaria';

export const getCacheBasePath = (config: Webpack.Configuration) => {
  const fallback = path.join('.next', 'cache');

  const mode = config.mode ?? 'development';

  return isFSCache(config.cache)
    ? path.join(config.cache.cacheDirectory ?? fallback, CACHE_NAME, mode)
    : path.join(fallback, CACHE_NAME, mode);
};
export const getCacheVersionHash = (config: Webpack.Configuration) => {
  if (isFSCache(config.cache)) {
    const version = config.cache.version ?? 'default';
    // Create a short hash from version
    if (typeof version === 'string') {
      const hash = crypto.createHash('md5').update(version).digest('hex');
      return hash.substring(0, 8); // Return first 8 characters of the hash
    }
    return String(version);
  }
  return 'default';
};
