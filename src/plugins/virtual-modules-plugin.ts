// This based on: https://github.com/rspack-contrib/rspack-plugin-virtual-module/blob/cb277d529253de047284760be1d1cd439dc20676/src/index.ts
import path, { dirname, extname, join } from 'node:path';

import fs from 'fs-extra';
import type * as Webpack from 'webpack';

import { getCacheBasePath } from '../utils/cache';

export class VirtualModulePlugin implements Webpack.WebpackPluginInstance {
  #staticModules: Record<string, string>;
  #modulesDir: string;

  constructor(
    config: Webpack.Configuration,
    staticModules: Record<string, string> = {},
  ) {
    this.#staticModules = staticModules;
    const modulesDir = path.join(getCacheBasePath(config), 'css');
    fs.ensureDirSync(modulesDir);
    this.#modulesDir = modulesDir;
  }

  apply(compiler: Webpack.Compiler) {
    // Write the modules to the disk
    for (const [path, content] of Object.entries(this.#staticModules)) {
      this.writeModule(path, content);
    }
    const originalResolveModulesDir = compiler.options.resolve.modules || [
      'node_modules',
    ];
    compiler.options.resolve.modules = [
      ...originalResolveModulesDir,
      this.#modulesDir,
    ];
    compiler.options.resolve.alias = {
      ...compiler.options.resolve.alias,
      ...Object.keys(this.#staticModules).reduce(
        (acc, p) => {
          acc[p] = this.#normalizePath(p);
          return acc;
        },
        {} as Record<string, string>,
      ),
    };
  }

  writeModule(path: string, content: string) {
    const normalizedPath = this.#normalizePath(path);
    fs.ensureDirSync(dirname(normalizedPath));
    fs.writeFileSync(normalizedPath, content);
  }

  #normalizePath(p: string) {
    const ext = extname(p);
    const normalizedPath = join(this.#modulesDir, ext ? p : `${p}.js`);
    return normalizedPath;
  }
}

export default VirtualModulePlugin;
