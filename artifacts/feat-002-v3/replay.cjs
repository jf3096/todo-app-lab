const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');

const outputDir = __dirname;
const candidateSha = '6b2d3cc987b09a05d85276d2f36b02be85a67040';
const entryUrl = 'http://127.0.0.1:4173/';
const syntheticText = 'v3-created-at-check';
const storageKey = 'todo-app-lab.tasks.v1';

function inspectSnapshot(page) {
  return page.evaluate(({ storageKey, syntheticText }) => {
    const item = [...document.querySelectorAll('#task-list > li.task-item')]
      .find((node) => node.textContent.includes(syntheticText));
    const time = item?.querySelector('time') ?? null;
    const created = item?.querySelector('[data-created-at]') ?? null;
    const createdClass = item?.querySelector('.task-created-at') ?? null;
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? 'null');
    const savedTask = Array.isArray(saved)
      ? saved.find((task) => task.text === syntheticText)
      : null;
    return {
      documentTitle: document.title,
      itemFound: Boolean(item),
      itemOuterHTML: item?.outerHTML ?? null,
      itemText: item?.textContent ?? null,
      timeText: time?.textContent ?? null,
      timeDateTime: time?.getAttribute('datetime') ?? null,
      dataCreatedAt: created?.getAttribute('data-created-at') ?? null,
      createdAtClassText: createdClass?.textContent ?? null,
      hasTime: Boolean(time),
      hasDataCreatedAt: Boolean(created),
      hasCreatedAtClass: Boolean(createdClass),
      savedTask,
      itemDisplay: item ? getComputedStyle(item).display : null,
      viewport: { width: innerWidth, height: innerHeight },
      colorScheme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    };
  }, { storageKey, syntheticText });
}

async function main() {
  const browser = await chromium.launch({ executablePath: process.env.FEAT_002_CHROMIUM, headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: 'light', locale: 'zh-CN' });
  const page = await context.newPage();
  const consoleMessages = [];
  const pageErrors = [];
  const responses = [];
  page.on('console', (message) => consoleMessages.push({ type: message.type(), text: message.text() }));
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('response', (response) => responses.push({ url: response.url(), status: response.status() }));

  const response = await page.goto(entryUrl, { waitUntil: 'networkidle' });
  const initial = await inspectSnapshot(page);
  await page.locator('#task-input').fill(syntheticText);
  const inputValueBeforeSubmit = await page.locator('#task-input').inputValue();
  await page.locator('button[type="submit"]').click();
  await page.getByRole('listitem').filter({ hasText: syntheticText }).waitFor();
  const afterSubmit = await inspectSnapshot(page);
  const storageAfterSubmit = await page.evaluate((key) => localStorage.getItem(key), storageKey);
  await page.screenshot({ path: path.join(outputDir, 'replay-after-submit.png'), fullPage: true });

  await page.reload({ waitUntil: 'networkidle' });
  const afterReload = await inspectSnapshot(page);
  const storageAfterReload = await page.evaluate((key) => localStorage.getItem(key), storageKey);
  await page.screenshot({ path: path.join(outputDir, 'replay-after-reload.png'), fullPage: true });

  const result = {
    schema: 'feat-002.replay/v1',
    candidate_sha: candidateSha,
    entry_url: entryUrl,
    browser: { name: 'chromium', executable: process.env.FEAT_002_CHROMIUM, headless: true, version: browser.version() },
    environment: {
      node: process.version,
      platform: process.platform,
      locale: 'zh-CN',
      viewport: '1280x900',
      color_scheme: 'light',
      storage: 'isolated browser context; synthetic only'
    },
    action: {
      selector: '#task-input',
      inputValueBeforeSubmit,
      submit_selector: 'button[type="submit"]',
      reload: true
    },
    http_status: response?.status() ?? null,
    responses,
    initial,
    after_submit: afterSubmit,
    storage_after_submit: storageAfterSubmit,
    after_reload: afterReload,
    storage_after_reload: storageAfterReload,
    console_messages: consoleMessages,
    page_errors: pageErrors,
    conclusion: afterSubmit.itemFound && !afterSubmit.hasTime && !afterSubmit.hasDataCreatedAt && !afterSubmit.hasCreatedAtClass
      ? 'GAP_CONFIRMED'
      : afterSubmit.itemFound
        ? 'CREATED_AT_PRESENT'
        : 'CANNOT_VERIFY'
  };

  await fs.writeFile(path.join(outputDir, 'replay-result.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  await browser.close();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
