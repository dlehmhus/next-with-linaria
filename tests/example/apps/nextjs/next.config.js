const withLinaria = require('../../../../');

/** @type {import('../../../../').LinariaConfig} */
const config = {
  experimental: {
    appDir: true,
    transpilePackages: ['ui-kit'],
  },
};
module.exports = withLinaria(config);
