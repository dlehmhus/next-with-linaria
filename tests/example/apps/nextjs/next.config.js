const withLinaria = require('../../../../');

/** @type {import('../../../../').LinariaConfig} */
const config = {
  transpilePackages: ['ui-kit'],
};
module.exports = withLinaria(config);
