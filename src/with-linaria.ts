import { addTurbopackConfig } from './add-turbopack-config';
import { addWebpackConfig } from './add-webpack-config';
import type { WithLinariaConfig } from './types';

export type LinariaConfig = WithLinariaConfig;

export default function withLinaria(config: WithLinariaConfig) {
  let configWithLinaria = config;

  configWithLinaria = addTurbopackConfig(configWithLinaria);
  configWithLinaria = addWebpackConfig(configWithLinaria);

  return configWithLinaria;
}

module.exports = withLinaria;
