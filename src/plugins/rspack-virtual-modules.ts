import { dirname, extname, join } from 'node:path';

import type { Compiler, RspackPluginInstance } from '@rspack/core';
import fs from 'fs-extra';
import type * as Webpack from 'webpack';

export class RspackVirtualModulePlugin implements RspackPluginInstance {
  #staticModules: Record<string, string>;

  #modulesDir: string;

  constructor(config: Webpack.Configuration) {
    this.#staticModules = {};

    const moduleDir = join(
      process.cwd(),
      '.next',
      'cache',
      'linaria',
      config.mode ?? '',
    );
    fs.ensureDirSync(moduleDir);
    this.#modulesDir = moduleDir;
  }

  apply(compiler: Compiler) {
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

export default RspackVirtualModulePlugin;
