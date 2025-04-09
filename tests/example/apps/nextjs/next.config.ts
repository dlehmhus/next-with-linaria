import withRspack from 'next-rspack';

import withLinariaWebpack from '../../../../';
import withLinariaRspack from '../../../../lib/rspack-config';

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

const enableRspack = true;

let nextConfig;

if (enableRspack) {
  nextConfig = withRspack(withLinariaRspack(config));
} else {
  nextConfig = withLinariaWebpack(config);
}

export default nextConfig;
