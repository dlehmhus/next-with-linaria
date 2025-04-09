import crypto from 'crypto';
import Cache, { type FileSystemCache } from 'file-system-cache';
import fs from 'fs-extra';
import path from 'path';
import type * as Webpack from 'webpack';

import VirtualModulePlugin from './plugins/virtual-modules-plugin';
import { isFSCache } from './utils';
import { getCacheBasePath } from './utils/cache';

const getCacheVersionHash = (config: Webpack.Configuration) => {
  if (isFSCache(config.cache)) {
    const version = config.cache.version ?? 'default';
    // Create a short hash from version
    if (typeof version === 'string') {
      const hash = crypto.createHash('md5').update(version).digest('hex');
      return hash.substring(0, 8); // Return first 8 characters of the hash
    }
    return String(version);
  }
  return 'default';
};

export default class ModuleStore {
  private vmInstances: Map<string, VirtualModulePlugin> = new Map();
  private dependencyCache: FileSystemCache | undefined;

  constructor(config: Webpack.Configuration) {
    this.addModule = this.addModule.bind(this);

    const cachePath = path.join(getCacheBasePath(config), 'dependencies');
    fs.ensureDirSync(cachePath);

    this.dependencyCache = Cache({
      basePath: cachePath,
      ns: getCacheVersionHash(config),
    });
  }

  public createStore(config: Webpack.Configuration) {
    const vm = new VirtualModulePlugin(config);
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
