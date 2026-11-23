import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests/browser',
  timeout: 30000,
  expect: { timeout: 7000 },
  fullyParallel: true,
  workers: 2,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  use: { baseURL: process.env.BASE_URL || 'http://127.0.0.1:4373/', browserName: 'chromium', channel: process.env.PLAYWRIGHT_CHANNEL || (process.platform === 'win32' ? 'chrome' : undefined), viewport: { width:1440, height:1000 }, trace:'retain-on-failure', screenshot:'only-on-failure' },
  webServer: process.env.BASE_URL ? undefined : { command:'npm run dev', url:'http://127.0.0.1:4373/', reuseExistingServer:!process.env.CI, timeout:30000 },
});
