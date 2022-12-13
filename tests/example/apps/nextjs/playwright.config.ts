import { devices, PlaywrightTestConfig } from '@playwright/test';
import path from 'path';

const { CI: isCI = false, TARGET } = process.env;

const port = 3200;

const devConfig = {
  type: 'development',
  command: `pnpm exec next dev --port ${port}`,
};

const prodConfig = {
  type: 'production',
  command: `pnpm run build && pnpm run start -p ${port}`,
};

export const webServer = TARGET === 'dev' ? devConfig : prodConfig;

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
