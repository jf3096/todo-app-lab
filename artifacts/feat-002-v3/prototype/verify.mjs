import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { chromium } from '../../../node_modules/playwright/index.mjs';
import { listen } from './server.mjs';

const root = new URL('./', import.meta.url);
const evidenceDir = new URL('./evidence/', root);
const evidencePath = fileURLToPath(evidenceDir);
const candidate = '6b2d3cc987b09a05d85276d2f36b02be85a67040';
const publicUrl = 'https://jf3096.github.io/todo-app-lab/previews/pr-10/2e88373/';
const storageKey = 'todo-app-lab.preview.pr-10.2e88373.tasks.v1';
const expected = [
  { width: 375, theme: 'light' },
  { width: 375, theme: 'dark' },
  { width: 1280, theme: 'light' },
  { width: 1280, theme: 'dark' }
];
const now = () => new Date().toISOString();
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const git = args => execFileSync('git', args, { encoding: null });
await mkdir(evidenceDir, { recursive: true });
const result = {
  schema: 'feat-002.sop3.1-prototype/v1',
  started_at: now(),
  executor_id: process.env.CODEX_THREAD_ID,
  host_session_id: process.env.CODEX_SESSION_ID,
  candidate,
  public_url: publicUrl,
  source_hashes: [],
  interactions: {},
  screenshots: [],
  observations: {},
  cleanup: {}
};

for (const file of ['index.html', 'app.js', 'styles.css']) {
  const response = await fetch(`${publicUrl}${file}`, { redirect: 'error' });
  const publicBytes = Buffer.from(await response.arrayBuffer());
  const frozenBytes = git(['show', `${candidate}:previews/pr-10/2e88373/${file}`]);
  result.source_hashes.push({
    file,
    url: `${publicUrl}${file}`,
    status: response.status,
    public_sha256: sha(publicBytes),
    frozen_sha256: sha(frozenBytes),
    matches: publicBytes.equals(frozenBytes),
    bytes: publicBytes.length
  });
  assert.equal(response.status, 200);
  assert.ok(publicBytes.equals(frozenBytes), `${file} differs from frozen baseline`);
}

const { server, port } = await listen(0);
result.entry = `http://127.0.0.1:${port}/`;
result.cleanup.self_started = true;
result.cleanup.port = port;
let browser;
try {
  browser = await chromium.launch({ headless: true, executablePath: 'C:/Users/KSG/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe' });
  result.environment = { os: process.platform, node: process.version, browser: browser.version() };

  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: 'light', locale: 'zh-CN' });
    const page = await context.newPage();
    const requests = [];
    page.on('request', request => requests.push(request.url()));
    await page.goto(result.entry);
    result.interactions.empty_state = await page.locator('#empty-state').innerText();
    await page.locator('#task-input').fill('   ');
    await page.locator('button[type=submit]').click();
    result.interactions.whitespace_error = await page.locator('#notice').innerText();
    result.interactions.whitespace_kept_empty = await page.locator('#task-list > li').count() === 0;
    assert.match(result.interactions.whitespace_error, /请输入/);
    assert.equal(result.interactions.whitespace_kept_empty, true);

    await page.locator('#task-input').fill('旧数据事项');
    await page.locator('button[type=submit]').click();
    const initialStorage = await page.evaluate(key => localStorage.getItem(key), storageKey);
    const initialTime = await page.locator('time.task-created-at').first().innerText();
    result.interactions.created_text = initialTime;
    await page.reload();
    const reloadedStorage = await page.evaluate(key => localStorage.getItem(key), storageKey);
    const reloadedTime = await page.locator('time.task-created-at').first().innerText();
    assert.equal(reloadedStorage, initialStorage);
    assert.equal(reloadedTime, initialTime);

    await page.locator('.task-check').check();
    await page.getByRole('button', { name: '未完成', exact: true }).click();
    assert.equal(await page.locator('#task-list > li').count(), 0);
    await page.getByRole('button', { name: '已完成', exact: true }).click();
    assert.equal(await page.locator('#task-list > li').count(), 1);
    await page.locator('.delete-button').click();
    await page.reload();
    assert.equal(await page.locator('#task-list > li').count(), 0);
    result.interactions.complete_filter_delete = true;

    await page.evaluate(key => localStorage.setItem(key, JSON.stringify([{ id: 'legacy', text: '旧版无时间', completed: false }])), storageKey);
    await page.reload();
    result.interactions.legacy_time = await page.locator('.task-created-at').innerText();
    assert.equal(result.interactions.legacy_time, '创建时间未知');

    await page.evaluate(key => localStorage.setItem(key, JSON.stringify([{ id: 'invalid', text: '无效时间', completed: false, createdAt: 'not-a-date' }])), storageKey);
    await page.reload();
    result.interactions.invalid_time = await page.locator('.task-created-at').innerText();
    assert.equal(result.interactions.invalid_time, '创建时间无效');
    result.interactions.external_requests = requests.filter(url => !url.startsWith(result.entry));
    assert.deepEqual(result.interactions.external_requests, []);
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: 'light', locale: 'zh-CN' });
    const page = await context.newPage();
    await page.addInitScript(() => {
      Storage.prototype.getItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
      Storage.prototype.setItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
    });
    await page.goto(result.entry);
    await page.locator('#task-input').fill('临时事项');
    await page.locator('button[type=submit]').click();
    result.interactions.storage_error = await page.locator('#notice').innerText();
    result.interactions.temporary_item_visible = await page.locator('#task-list > li').count() === 1;
    assert.match(result.interactions.storage_error, /刷新后/);
    assert.equal(result.interactions.temporary_item_visible, true);
    await context.close();
  }

  for (const state of expected) {
    const context = await browser.newContext({ viewport: { width: state.width, height: 900 }, colorScheme: state.theme, locale: 'zh-CN' });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(result.entry);
    await page.locator('#task-input').fill('整理今天的计划');
    await page.locator('#task-input').press('Enter');
    await page.locator('#task-input').fill('很长的待办内容'.repeat(25));
    await page.locator('button[type=submit]').click();
    const snapshot = await page.evaluate(() => ({
      scroll_width: document.documentElement.scrollWidth,
      inner_width: innerWidth,
      rows: [...document.querySelectorAll('#task-list > li.task-item')].map(row => {
        const time = row.querySelector('time.task-created-at');
        const details = row.querySelector('.task-details');
        const remove = row.querySelector('.delete-button');
        return {
          title: row.querySelector('.task-text')?.textContent,
          time_text: time?.textContent,
          datetime: time?.getAttribute('datetime'),
          details_width: details?.getBoundingClientRect().width,
          remove_rect: remove ? { x: remove.getBoundingClientRect().x, width: remove.getBoundingClientRect().width, height: remove.getBoundingClientRect().height } : null
        };
      })
    }));
    assert.equal(snapshot.scroll_width, snapshot.inner_width);
    assert.equal(snapshot.rows.length, 2);
    assert.match(snapshot.rows[0].time_text, /^创建于 /);
    assert.ok(snapshot.rows[0].datetime);
    const filename = `todo-${state.width}-${state.theme}.png`;
    const screenshotPath = fileURLToPath(new URL(filename, evidenceDir));
    await page.screenshot({ path: screenshotPath, fullPage: true });
    result.screenshots.push({ ...state, file: filename, captured_at: now(), sha256: sha(await readFile(screenshotPath)), bytes: (await readFile(screenshotPath)).length, snapshot, errors });
    assert.deepEqual(errors, []);
    await context.close();
  }
  result.observations.format = 'UTC ISO stored; zh-CN local timezone displayed to minute';
  result.observations.four_states = 'Captions are below titles, controls remain separate, and scrollWidth equals innerWidth.';
} finally {
  if (browser) await browser.close();
  await new Promise(resolve => server.close(resolve));
  result.cleanup.closed_at = now();
  result.finished_at = now();
  await writeFile(new URL('./result.json', evidenceDir), JSON.stringify(result, null, 2) + '\n');
}
console.log(JSON.stringify(result, null, 2));
