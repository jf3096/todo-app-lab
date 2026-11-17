const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('C:/Users/KSG/Documents/ChatGPT/todo-app-lab/node_modules/playwright');

const outputPath = path.join(__dirname, 'review-3c1d2b5e-01a1e95e.json');
const screenshotPath = path.join(__dirname, 'review-after-reload-3c1d2b5e-01a1e95e.png');
const syntheticText = 'v3-created-at-check';

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
  const requests = [];
  const pageErrors = [];
  const consoleErrors = [];
  page.on('request', (request) => requests.push({ method: request.method(), url: request.url(), resourceType: request.resourceType() }));
  page.on('pageerror', (error) => pageErrors.push(String(error)));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  const response = await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await page.fill('#task-input', syntheticText);
  await page.click('button[type="submit"]');
  await page.waitForSelector('#task-list > li.task-item');
  const afterSubmit = await page.evaluate((key) => {
    const item = document.querySelector('#task-list > li.task-item');
    return {
      itemCount: document.querySelectorAll('#task-list > li.task-item').length,
      itemText: item?.textContent ?? null,
      itemOuterHTML: item?.outerHTML ?? null,
      timeText: item?.querySelector('time')?.textContent ?? null,
      dataCreatedAt: item?.getAttribute('data-created-at') ?? null,
      createdAtClassText: item?.querySelector('.task-created-at')?.textContent ?? null,
      storageRaw: localStorage.getItem(key),
      cookie: document.cookie,
      sessionStorageLength: sessionStorage.length
    };
  }, 'todo-app-lab.tasks.v1');

  const requestCountBeforeReload = requests.length;
  await page.reload({ waitUntil: 'networkidle' });
  const afterReload = await page.evaluate((key) => {
    const item = document.querySelector('#task-list > li.task-item');
    return {
      itemCount: document.querySelectorAll('#task-list > li.task-item').length,
      itemText: item?.textContent ?? null,
      itemOuterHTML: item?.outerHTML ?? null,
      timeText: item?.querySelector('time')?.textContent ?? null,
      dataCreatedAt: item?.getAttribute('data-created-at') ?? null,
      createdAtClassText: item?.querySelector('.task-created-at')?.textContent ?? null,
      storageRaw: localStorage.getItem(key),
      cookie: document.cookie,
      sessionStorageLength: sessionStorage.length
    };
  }, 'todo-app-lab.tasks.v1');
  await page.screenshot({ path: screenshotPath, fullPage: true });
  const saved = JSON.parse(afterReload.storageRaw);

  const result = {
    schema: 'feat-002.independent-review/v1',
    submission_id: 'feat-002-sop1-submission-3c1d2b5ee7f8',
    round_id: 'feat-002-sop1-review-3c1d2b5e-01a1e95e',
    reviewer_id: '01a1e95e-2785-7ec3-b768-1978540a87b2',
    candidate_sha: '6b2d3cc987b09a05d85276d2f36b02be85a67040',
    checked_at: new Date().toISOString(),
    environment: {
      platform: process.platform,
      node: process.version,
      playwright: require('C:/Users/KSG/Documents/ChatGPT/todo-app-lab/node_modules/playwright/package.json').version,
      browser: 'Chromium 1248',
      viewport: '1280x900',
      locale: 'zh-CN',
      theme: 'light',
      entry: 'http://127.0.0.1:4173/'
    },
    input: syntheticText,
    http_status: response?.status() ?? null,
    after_submit: afterSubmit,
    after_reload: afterReload,
    requests,
    request_count_before_reload: requestCountBeforeReload,
    external_network_requests: requests.filter((request) => !request.url.startsWith('http://127.0.0.1:4173/')),
    page_errors: pageErrors,
    console_errors: consoleErrors,
    observations: {
      task_persisted: afterReload.itemCount === 1 && afterReload.itemText?.includes(syntheticText),
      created_at_absent: !afterReload.timeText && !afterReload.dataCreatedAt && !afterReload.createdAtClassText,
      storage_fields: Object.keys(saved[0]).sort(),
      cookie_empty: afterReload.cookie === '',
      session_storage_empty: afterReload.sessionStorageLength === 0
    },
    screenshot: path.basename(screenshotPath)
  };
  fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(result, null, 2));
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
