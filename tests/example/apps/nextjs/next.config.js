const withLinaria = require('../../../../');

/** @type {import('../../../../').LinariaConfig} */
const config = {
  transpilePackages: ['ui-kit'],
  typescript: {
    ignoreBuildErrors: true,
  },
};
module.exports = withLinaria(config);
