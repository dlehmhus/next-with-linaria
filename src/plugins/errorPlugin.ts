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

            const message =
              '🔄 The Linaria cache seems to be out of sync with the webpack cache, please restart the server.\n For more details see: https://github.com/dlehmhus/next-with-linaria#good-to-know \n\n';

            stats.compilation.errors.push(new WebpackError(message));
          }
        }
      }
    });
  }
}
