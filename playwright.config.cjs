const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  workers: 2,
  timeout: 30000,
  expect: { timeout: 5000 },
  reporter: 'list',
  use: {
    baseURL: process.env.BASE_URL || 'http://127.0.0.1:4173/',
    channel: process.env.PW_CHANNEL || 'chrome',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  webServer: process.env.BASE_URL ? undefined : {
    command: 'npm start',
    url: 'http://127.0.0.1:4173/',
    reuseExistingServer: false
  }
});
