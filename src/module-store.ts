import Cache, { type FileSystemCache } from 'file-system-cache';
import path from 'path';
import type * as Webpack from 'webpack';

import RspackVirtualModulePlugin from './plugins/rspack-virtual-modules';
import { isFSCache } from './utils';

export default class ModuleStore {
  private vmInstances: Map<string, RspackVirtualModulePlugin> = new Map();

  private dependencyCache: FileSystemCache | undefined;

  constructor(config: Webpack.Configuration) {
    this.addModule = this.addModule.bind(this);

    if (isFSCache(config.cache)) {
      const baseDir =
        config.cache.cacheDirectory ||
        path.join(process.cwd(), '.linaria-cache');

      const cachePath = path.join(baseDir, `linaria-${config.mode}`);

      this.dependencyCache = Cache({
        basePath: cachePath,
        ns: config.cache.version + '-deps',
      });
    }
  }

  public createStore(config: Webpack.Configuration) {
    const vm = new RspackVirtualModulePlugin(config);
    this.vmInstances.set(config.name ?? 'default', vm);
    return vm;
  }

  public addModule(path: string, content: string) {
    this.vmInstances.forEach((vm) => {
      vm.writeModule(path, content);
    });
  }

  public addModuleDependencies(modulePath: string, deps: string[]) {
    if (this.dependencyCache) {
      this.dependencyCache.setSync(modulePath, deps);
    }
  }

  public async getModuleDependencies(
    modulePath: string,
  ): Promise<string[] | null> {
    if (this.dependencyCache) {
      return this.dependencyCache.get(modulePath);
    }
    return null;
  }
}
