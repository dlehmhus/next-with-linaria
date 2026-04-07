import withRspack from 'next-rspack';

import withLinaria, { LinariaConfig } from '../../../../';
import path from 'node:path';

const config: LinariaConfig = {
  transpilePackages: ['ui-kit'],
  linaria: {
    fastCheck: true,
  },
  outputFileTracingRoot: path.join(__dirname, '..', '..'),
};

// // Use environment variable to toggle between webpack and rspack
const enableRspack = process.env.USE_RSPACK === 'true';

let nextConfig;

if (enableRspack) {
  nextConfig = withLinaria(withRspack(config));
} else {
  nextConfig = withLinaria(config);
}

export default nextConfig;
