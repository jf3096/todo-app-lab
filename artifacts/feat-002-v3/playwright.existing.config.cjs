const { defineConfig } = require('@playwright/test');
const path = require('node:path');

module.exports = defineConfig({
  testDir: path.resolve(__dirname, '..', '..', 'tests'),
  fullyParallel: true,
  workers: 2,
  timeout: 30000,
  expect: { timeout: 5000 },
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173/',
    launchOptions: { executablePath: process.env.FEAT_002_CHROMIUM },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  }
});
