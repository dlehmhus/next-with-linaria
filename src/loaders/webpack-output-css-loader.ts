import type { RawLoaderDefinitionFunction } from 'webpack';

type LoaderType = RawLoaderDefinitionFunction;

const cssOutputLoader: LoaderType = function () {
  const callback = this.async();

  const css = this.resourceQuery.split('.css?css=').pop();

  if (!css) {
    callback(new Error('No CSS part found in resource query'));
    return;
  }

  const decodedCss = Buffer.from(css, 'base64').toString();

  callback(null, decodedCss, undefined);
};

export default cssOutputLoader;
