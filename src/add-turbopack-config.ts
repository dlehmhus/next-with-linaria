import path from 'path';

import { WithLinariaConfig } from './types';

export function addTurbopackConfig({
  linaria: linariaOptions,
  ...config
}: WithLinariaConfig) {
  config.turbopack ??= {};
  config.turbopack.rules ??= {};
  config.turbopack.rules = {
    ...config.turbopack.rules,
    // @ts-expect-error Turbopack only allows for primitive options that can be serialized to JSON
    // but the default linaria options include functions. We ignore this for now.
    '*.{ts,tsx,js,jsx}': {
      loaders: [
        {
          loader: path.resolve(
            __dirname,
            './loaders/turbopack-transform-loader',
          ),
          options: {
            sourceMap: process.env.NODE_ENV !== 'production',
            displayName: process.env.NODE_ENV !== 'production',
            ...linariaOptions,
            babelOptions: {
              presets: ['next/babel', '@wyw-in-js'],
            },
          },
        },
      ],
    },
  };

  return config;
}
