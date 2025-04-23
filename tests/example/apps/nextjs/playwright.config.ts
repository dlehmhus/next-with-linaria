import { devices, PlaywrightTestConfig } from '@playwright/test';
import path from 'path';

const { CI: isCI = false, TEST_ENV } = process.env;

const port = 3200;

const BUNDLER = process.env.BUNDLER || 'webpack';
const IS_RSPACK = BUNDLER === 'rspack';
const IS_TURBOPACK = BUNDLER === 'turbopack';

const useRspackEnv = `USE_RSPACK=${IS_RSPACK}`;
const turbopackFlag = IS_TURBOPACK ? '--turbopack' : '';
const nextCommandPrefix = `${useRspackEnv} pnpm exec next`;

let webServerConfig: { command: string; type: string };

if (TEST_ENV === 'development') {
  webServerConfig = {
    type: 'development',
    command: `${nextCommandPrefix} dev -p ${port} ${turbopackFlag}`,
  };
} else {
  webServerConfig = {
    type: 'production',
    command: `${nextCommandPrefix} build ${turbopackFlag} && pnpm exec next start -p ${port}`,
  };
}

export const webServer = webServerConfig;

const config: PlaywrightTestConfig = {
  forbidOnly: !!isCI,
  retries: isCI ? 2 : 0,
  outputDir: path.join(__dirname, 'test-results'),
  testDir: path.join(__dirname, 'e2e'),
  workers: isCI ? 2 : undefined,
  reporter: process.env.CI ? 'github' : 'list',
  webServer: {
    command: webServer.command,
    port: port,
    reuseExistingServer: !isCI,
  },
  use: {
    baseURL: `http://localhost:${port}`,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
};

export default config;
