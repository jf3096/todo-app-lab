const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/KSG/Documents/ChatGPT/todo-app-lab/node_modules/playwright');

const outputPath = path.join(__dirname, 'verification-replay-01a1e95e.json');
const screenshotPath = path.join(__dirname, 'verification-after-reload-01a1e95e.png');
const syntheticText = 'v3-created-at-check';

function snapshot(page) {
  return page.evaluate(() => {
    const item = document.querySelector('#task-list > li.task-item');
    return {
      url: location.href,
      title: document.title,
      storageRaw: localStorage.getItem('todo-app-lab.tasks.v1'),
      itemCount: document.querySelectorAll('#task-list > li.task-item').length,
      itemText: item?.textContent ?? null,
      itemOuterHTML: item?.outerHTML ?? null,
      timeText: item?.querySelector('time')?.textContent ?? null,
      dataCreatedAt: item?.getAttribute('data-created-at') ?? null,
      createdAtClassText: item?.querySelector('.task-created-at')?.textContent ?? null,
      hasTime: Boolean(item?.querySelector('time')),
      hasDataCreatedAt: Boolean(item?.getAttribute('data-created-at')),
      hasCreatedAtClass: Boolean(item?.querySelector('.task-created-at')),
      pageErrors: window.__verificationPageErrors ?? [],
      consoleErrors: window.__verificationConsoleErrors ?? []
    };
  });
}

(async () => {
  const browser = await chromium.launch({
    executablePath: 'C:/Users/KSG/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe',
    headless: true
  });
  const context = await browser.newContext({
    locale: 'zh-CN',
    viewport: { width: 1280, height: 900 },
    colorScheme: 'light'
  });
  const page = await context.newPage();
  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (error) => pageErrors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  await page.addInitScript(() => {
    window.__verificationPageErrors = [];
    window.__verificationConsoleErrors = [];
    window.addEventListener('error', (event) => window.__verificationPageErrors.push(String(event.error || event.message)));
    window.addEventListener('unhandledrejection', (event) => window.__verificationPageErrors.push(String(event.reason)));
    const originalConsoleError = console.error;
    console.error = (...args) => {
      window.__verificationConsoleErrors.push(args.map(String).join(' '));
      originalConsoleError.apply(console, args);
    };
  });

  const response = await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await page.fill('#task-input', syntheticText);
  await page.click('button[type="submit"]');
  await page.waitForSelector('#task-list > li.task-item');
  const afterSubmit = await snapshot(page);
  await page.reload({ waitUntil: 'networkidle' });
  const afterReload = await snapshot(page);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  const result = {
    schema: 'feat-002.verification-replay/v1',
    verifier_id: '01a1e95e-2785-7ec3-b768-1978540a87b2',
    candidate_sha: '6b2d3cc987b09a05d85276d2f36b02be85a67040',
    checked_at: new Date().toISOString(),
    environment: {
      platform: process.platform,
      node: process.version,
      playwright: require('C:/Users/KSG/Documents/ChatGPT/todo-app-lab/node_modules/playwright/package.json').version,
      executable: 'Chromium 1248 packaged browser',
      viewport: '1280x900',
      locale: 'zh-CN',
      color_scheme: 'light',
      storage: 'fresh isolated context, synthetic localStorage only'
    },
    action: {
      entry: 'http://127.0.0.1:4173/',
      input_selector: '#task-input',
      submit_selector: 'button[type="submit"]',
      synthetic_text: syntheticText,
      refresh_performed: true
    },
    http_status: response?.status() ?? null,
    after_submit: afterSubmit,
    after_reload: afterReload,
    page_errors: pageErrors,
    console_errors: consoleErrors,
    conclusion: afterReload.itemCount === 1 &&
      afterReload.itemText?.includes(syntheticText) &&
      !afterReload.hasTime &&
      !afterReload.hasDataCreatedAt &&
      !afterReload.hasCreatedAtClass &&
      (() => {
        const saved = JSON.parse(afterReload.storageRaw || 'null');
        return Array.isArray(saved) &&
          saved.length === 1 &&
          saved[0].text === syntheticText &&
          !Object.hasOwn(saved[0], 'createdAt') &&
          !Object.hasOwn(saved[0], 'created_at');
      })()
      ? 'GAP_CONFIRMED'
      : 'NEEDS_REVIEW',
    screenshot: path.basename(screenshotPath)
  };
  fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
