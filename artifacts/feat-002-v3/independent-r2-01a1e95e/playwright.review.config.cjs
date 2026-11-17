const { defineConfig } = require('C:/Users/KSG/Documents/ChatGPT/todo-app-lab/node_modules/@playwright/test');
module.exports = defineConfig({
  testDir: 'C:/Users/KSG/AppData/Local/Temp/feat002-r2-review-01a1e95e/tests',
  outputDir: __dirname + '/regression-output',
  fullyParallel: true,
  workers: 2,
  timeout: 30000,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173/',
    launchOptions: {executablePath: 'C:/Users/KSG/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe'},
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  }
});
