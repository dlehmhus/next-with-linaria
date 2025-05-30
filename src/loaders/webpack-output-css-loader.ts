import zlib from 'node:zlib';

import type { RawLoaderDefinitionFunction } from 'webpack';

type LoaderType = RawLoaderDefinitionFunction;

const cssOutputLoader: LoaderType = function () {
  const callback = this.async();

  const css = this.resourceQuery.split('.css?css=').pop();

  if (!css) {
    callback(new Error('No CSS part found in resource query'));
    return;
  }

  const decodedCss = Buffer.from(css, 'base64');
  const decompressedCss = zlib.gunzipSync(decodedCss);

  callback(null, decompressedCss.toString('utf-8'), undefined);
};

export default cssOutputLoader;
