import { PluginOptions } from '@wyw-in-js/transform';
import { NextConfig } from 'next';

export type LinariaTransformLoaderOptions = {
  /**
   * Enables a quick syntax check to skip transform for files that don't contain Linaria code.
   * This can significantly improve performance for large projects.
   * @default true
   */
  fastCheck?: boolean;
} & Partial<Omit<PluginOptions, 'sourceMaps'>>;

export type WithLinariaConfig = NextConfig & {
  /**
   * Linaria webpack loader options
   */
  linaria?: LinariaTransformLoaderOptions;
};
