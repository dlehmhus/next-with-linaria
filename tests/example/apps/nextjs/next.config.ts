import withRspack from 'next-rspack';

import withLinaria, { LinariaConfig } from '../../../../';

const config: LinariaConfig = {
  transpilePackages: ['ui-kit'],
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  linaria: {
    fastCheck: true,
  },
};

// // Use environment variable to toggle between webpack and rspack
const enableRspack = process.env.USE_RSPACK === 'true';

let nextConfig;

if (enableRspack) {
  nextConfig = withRspack(withLinaria(config));
} else {
  nextConfig = withLinaria(config);
}

export default nextConfig;
