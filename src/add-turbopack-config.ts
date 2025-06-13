import path from 'path';

import { WithLinariaConfig } from './types';

export function addTurbopackConfig({
  linaria: linariaOptions,
  ...config
}: WithLinariaConfig) {
  config.turbopack ??= {};
  config.turbopack.rules ??= {};

  const linariaLoader = {
    loader: path.resolve(__dirname, './loaders/turbopack-transform-loader'),
    options: {
      sourceMap: process.env.NODE_ENV !== 'production',
      displayName: process.env.NODE_ENV !== 'production',
      ...linariaOptions,
      babelOptions: {
        presets: ['next/babel', '@wyw-in-js'],
      },
    },
  };

  // TODO: re-enable this once https://github.com/vercel/next.js/issues/79592 is fixed
  // and remove the regex approach below

  // if (config.turbopack.rules['*.{ts,tsx,js,jsx}']) {
  //   // @ts-expect-error Turbopack only allows for primitive options that can be serialized to JSON
  //   // but the default linaria options include functions. We ignore this for now.
  //   config.turbopack.rules['*.{ts,tsx,js,jsx}'].loaders.push(linariaLoader);
  // } else {
  //   // @ts-expect-error Turbopack only allows for primitive options that can be serialized to JSON
  //   config.turbopack.rules['*.{ts,tsx,js,jsx}'] = {
  //     loaders: [linariaLoader],
  //   };
  // }

  const conditionId = '#linaria-loader';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config.turbopack.conditions ??= {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config.turbopack.conditions[conditionId] = {
    path: /^(?!.*middleware\.(tsx?|jsx?)$).*\.(tsx?|jsx?)$/,
  };

  // @ts-expect-error Turbopack only allows for primitive options that can be serialized to JSON
  // but the default linaria options include functions. We ignore this for now.
  config.turbopack.rules[conditionId] = {
    loaders: [linariaLoader],
  };

  return config;
}
