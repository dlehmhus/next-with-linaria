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

  config.turbopack.rules['*.{ts,tsx,js,jsx}'] = {
    condition: {
      // TODO: can be removed once https://github.com/vercel/next.js/issues/79592 is fixed
      not: { path: /middleware\.(tsx?|jsx?)$/ },
    },
    loaders: [linariaLoader],
  };

  return config;
}
