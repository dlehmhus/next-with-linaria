import { expect, test } from '@playwright/test';

import { webServer } from '../playwright.config';

test.describe.configure({ mode: 'parallel' });

test(`${webServer.type}: should contain styling for build-in CSS modules, linaria \`css\` & \`styled\``, async ({
  page,
}) => {
  await page.goto('/');

  await expect(page.locator('html')).toHaveCSS(
    'content',
    '"Default global CSS"',
  );
  await expect(page.locator('body')).toHaveCSS(
    'content',
    '"Linaria global CSS"',
  );
  await expect(page.locator('data-testid=server-container')).toHaveCSS(
    'content',
    '"Server Container"',
  );
  await expect(page.locator('data-testid=css-module-button')).toHaveCSS(
    'content',
    '"CSS Module Link"',
  );
  await expect(page.locator('data-testid=linaria-button')).toHaveCSS(
    'content',
    '"Linaria Link"',
  );
  await expect(page.locator('data-testid=linaria-uikit-button')).toHaveCSS(
    'content',
    '"Linaria UiKit Button"',
  );

  await page.goto('/posts');

  await expect(page.locator('data-testid=linaria-post').first()).toHaveCSS(
    'content',
    '"Linaria Post"',
  );
});
