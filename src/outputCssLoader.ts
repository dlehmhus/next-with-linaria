// This idea is is basically 1:1 from the linaria webpack loader. Thanks for that.
// https://github.com/callstack/linaria/blob/462739a781e31d5a8266957c0a4800292f452441/packages/webpack5-loader/src/outputCssLoader.ts

import type { RawLoaderDefinitionFunction } from 'webpack';

import VirtualModuleStore from './VirtualModuleStore';

type OutputLoaderOptions = {
  moduleStore: VirtualModuleStore;
};

type LoaderType = RawLoaderDefinitionFunction<OutputLoaderOptions>;

const cssOutputLoader: LoaderType = function (content, inputSourceMap) {
  this.async();

  const { moduleStore } = this.getOptions();
  moduleStore
    .getModuleDependencies(this.resourcePath)
    .then((deps) => {
      if (deps) {
        deps.forEach((dep) => {
          this.addDependency(dep);
        });
      }
    })
    .catch((err) => {
      this.emitError(err);
      console.error('Error getting dependencies for ' + this.resourcePath);
    })
    .finally(() => {
      this.callback(null, content, inputSourceMap);
    });
};

export default cssOutputLoader;
