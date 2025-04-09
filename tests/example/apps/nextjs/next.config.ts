import withRspack from 'next-rspack';

import withLinaria from '../../../../';

/** @type {import('../../../../').LinariaConfig} */
const config = {
  transpilePackages: ['ui-kit'],
  typescript: {
    ignoreBuildErrors: true,
  },
  linaria: {
    fastCheck: true,
  },
};

// Use environment variable to toggle between webpack and rspack
const enableRspack = process.env.USE_RSPACK !== 'false';

let nextConfig;

if (enableRspack) {
  nextConfig = withRspack(withLinaria(config));
} else {
  nextConfig = withLinaria(config);
}

export default nextConfig;
