import { existsSync, rmSync } from 'fs';
import { Compiler, WebpackError } from 'webpack';

import { isFSCache } from '../utils';

const cssRegex = /\.linaria\.(module|global)\.css/;

export class ErrorPlugin {
  apply(compiler: Compiler) {
    compiler.hooks.afterDone.tap('ErrorPlugin', (stats) => {
      if (stats.hasErrors()) {
        if (isFSCache(stats.compilation.compiler.options.cache)) {
          let isLinariaRelated = false;

          stats.compilation.errors.some((error) => {
            isLinariaRelated = cssRegex.test(error.message);
          });

          if (isLinariaRelated) {
            stats.compilation.errors = stats.compilation.errors.filter(
              (err) => !cssRegex.test(err.message),
            );

            const { cache, mode } = stats.compilation.compiler.options;

            let message =
              '🔄 The Linaria cache seems to be out of sync with the webpack cache, let me fix that for you...\n\n';

            if (mode === 'production') {
              message += 'Please restart the build process!';
            } else {
              message += 'Please restart the dev server!';
            }

            if (cache.cacheDirectory && existsSync(cache.cacheDirectory)) {
              rmSync(cache.cacheDirectory, { recursive: true, force: true });
            }

            stats.compilation.errors.push(new WebpackError(message));
          }
        }
      }
    });
  }
}
