import { addTurbopackConfig } from './add-turbopack-config';
import { addWebpackConfig } from './add-webpack-config';
import type { WithLinariaConfig } from './types';

export type LinariaConfig = WithLinariaConfig;

export default function withLinaria(config: WithLinariaConfig) {
  const useTurbopack = process.env.TURBOPACK;
  if (useTurbopack) {
    return addTurbopackConfig(config);
  } else {
    return addWebpackConfig(config);
  }
}

module.exports = withLinaria;
