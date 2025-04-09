import Cache, { type FileSystemCache } from 'file-system-cache';
import fs from 'fs-extra';
import path from 'path';
import type * as Webpack from 'webpack';

import VirtualModulePlugin from './plugins/virtual-modules-plugin';
import { getCacheBasePath, getCacheVersionHash } from './utils/cache';

export default class ModuleStore {
  public virtualModules: VirtualModulePlugin;
  private dependencyCache: FileSystemCache | undefined;

  constructor(config: Webpack.Configuration) {
    this.addModule = this.addModule.bind(this);
    this.virtualModules = new VirtualModulePlugin(config);
    const cachePath = path.join(getCacheBasePath(config), 'dependencies');
    fs.ensureDirSync(cachePath);

    this.dependencyCache = Cache({
      basePath: cachePath,
      ns: getCacheVersionHash(config),
    });
  }

  public addModule(path: string, content: string) {
    this.virtualModules.writeModule(path, content);
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
