import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { chromium } from '../../../node_modules/playwright/index.mjs';

const reviewRoot = new URL('./', import.meta.url);
const evidenceDir = new URL('./evidence/', reviewRoot);
const evidencePath = fileURLToPath(evidenceDir);
const artifactVersion = '5ba90f604f52c215c227c294ad44667a50342893';
const publicUrl = 'https://jf3096.github.io/todo-app-lab/previews/pr-10/2e88373/';
const storageKey = 'todo-app-lab.preview.pr-10.2e88373.tasks.v1';
const sourceFiles = ['index.html', 'app.js', 'styles.css'];
const states = [
  { width: 375, theme: 'light' },
  { width: 375, theme: 'dark' },
  { width: 1280, theme: 'light' },
  { width: 1280, theme: 'dark' }
];
const now = () => new Date().toISOString();
const sha256 = value => createHash('sha256').update(value).digest('hex');
const git = args => execFileSync('git', args, { encoding: null });

await mkdir(evidenceDir, { recursive: true });
const result = {
  schema: 'feat-002.sop3.2-prototype-review/v1',
  started_at: now(),
  executor_id: process.env.CODEX_THREAD_ID ?? null,
  host_session_id: process.env.CODEX_SESSION_ID ?? null,
  card_url: 'https://github.com/jf3096/todo-app-lab/issues/14',
  dependency_url: 'https://github.com/jf3096/todo-app-lab/issues/13#issuecomment-6950520107',
  artifact_version: artifactVersion,
  public_url: publicUrl,
  source_hashes: [],
  source_drift: {},
  interactions: {},
  screenshots: [],
  browser: {},
  cleanup: {}
};

for (const file of sourceFiles) {
  const response = await fetch(`${publicUrl}${file}`, { redirect: 'error' });
  const publicBytes = Buffer.from(await response.arrayBuffer());
  const previewBytes = git(['show', `${artifactVersion}:previews/pr-10/2e88373/${file}`]);
  const prototypeBytes = git(['show', `${artifactVersion}:artifacts/feat-002-v3/prototype/${file}`]);
  assert.equal(response.status, 200);
  assert.ok(publicBytes.equals(previewBytes), `${file}: public bytes differ from frozen preview`);
  result.source_hashes.push({
    file,
    url: `${publicUrl}${file}`,
    status: response.status,
    bytes: publicBytes.length,
    public_sha256: sha256(publicBytes),
    frozen_preview_sha256: sha256(previewBytes),
    prototype_source_sha256: sha256(prototypeBytes),
    public_matches_preview: true,
    public_matches_prototype_source: publicBytes.equals(prototypeBytes)
  });
  result.source_drift[file] = publicBytes.equals(prototypeBytes)
    ? 'identical'
    : 'prototype source differs from published preview; public version is the review object';
}

let browser;
try {
  browser = await chromium.launch({
    headless: true,
    executablePath: 'C:/Users/KSG/AppData/Local/ms-playwright/chromium-1248/chrome-win64/chrome.exe'
  });
  result.browser = { engine: 'Chromium', version: browser.version(), playwright: '1.65.0' };

  {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      colorScheme: 'light',
      locale: 'zh-CN',
      timezoneId: 'Asia/Shanghai'
    });
    const page = await context.newPage();
    const externalRequests = [];
    page.on('request', request => {
      if (!request.url().startsWith(publicUrl)) externalRequests.push(request.url());
    });
    await page.goto(publicUrl, { waitUntil: 'networkidle' });
    result.interactions.initial_storage = await page.evaluate(key => localStorage.getItem(key), storageKey);
    assert.equal(result.interactions.initial_storage, null);

    await page.locator('#task-input').fill('   ');
    await page.locator('button[type=submit]').click();
    result.interactions.whitespace_error = await page.locator('#notice').innerText();
    result.interactions.whitespace_rows = await page.locator('#task-list > li').count();
    assert.match(result.interactions.whitespace_error, /请输入/);
    assert.equal(result.interactions.whitespace_rows, 0);

    await page.locator('#task-input').fill('技术自验事项');
    await page.locator('button[type=submit]').click();
    const storedBeforeReload = await page.evaluate(key => localStorage.getItem(key), storageKey);
    const timeBeforeReload = await page.locator('time.task-created-at').innerText();
    const datetimeBeforeReload = await page.locator('time.task-created-at').getAttribute('datetime');
    const firstTask = JSON.parse(storedBeforeReload)[0];
    result.interactions.created = {
      visible: timeBeforeReload,
      datetime: datetimeBeforeReload,
      stored_created_at: firstTask.createdAt,
      visible_matches_stored: datetimeBeforeReload === firstTask.createdAt
    };
    assert.match(timeBeforeReload, /^创建于 \d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/);
    assert.equal(datetimeBeforeReload, firstTask.createdAt);

    await page.reload({ waitUntil: 'networkidle' });
    result.interactions.reload = {
      storage_equal: (await page.evaluate(key => localStorage.getItem(key), storageKey)) === storedBeforeReload,
      visible: await page.locator('time.task-created-at').innerText(),
      datetime: await page.locator('time.task-created-at').getAttribute('datetime')
    };
    assert.equal(result.interactions.reload.storage_equal, true);
    assert.equal(result.interactions.reload.visible, timeBeforeReload);
    assert.equal(result.interactions.reload.datetime, datetimeBeforeReload);

    await page.locator('.task-check').check();
    assert.equal(await page.getByTestId('remaining').innerText(), '0 项待完成');
    await page.getByRole('button', { name: '未完成', exact: true }).click();
    assert.equal(await page.locator('#task-list > li').count(), 0);
    assert.equal(await page.locator('#empty-title').innerText(), '待办都完成了');
    await page.getByRole('button', { name: '已完成', exact: true }).click();
    assert.equal(await page.locator('#task-list > li').count(), 1);
    await page.getByRole('button', { name: '全部', exact: true }).click();
    await page.locator('.delete-button').click();
    await page.reload({ waitUntil: 'networkidle' });
    assert.equal(await page.locator('#task-list > li').count(), 0);
    result.interactions.complete_filter_delete = 'PASS';

    await page.evaluate(key => localStorage.setItem(key, JSON.stringify([
      { id: 'legacy', text: '旧版无时间', completed: false }
    ])), storageKey);
    await page.reload({ waitUntil: 'networkidle' });
    result.interactions.legacy = {
      visible: await page.locator('.task-created-at').innerText(),
      datetime: await page.locator('.task-created-at').getAttribute('datetime')
    };
    assert.equal(result.interactions.legacy.visible, '创建时间未知');
    assert.equal(result.interactions.legacy.datetime, null);

    await page.evaluate(key => localStorage.setItem(key, JSON.stringify([
      { id: 'invalid', text: '无效时间', completed: false, createdAt: 'not-a-date' }
    ])), storageKey);
    await page.reload({ waitUntil: 'networkidle' });
    result.interactions.invalid = {
      visible: await page.locator('.task-created-at').innerText(),
      datetime: await page.locator('.task-created-at').getAttribute('datetime'),
      stored: await page.evaluate(key => localStorage.getItem(key), storageKey)
    };
    assert.equal(result.interactions.invalid.visible, '创建时间无效');
    assert.equal(result.interactions.invalid.datetime, null);
    assert.match(result.interactions.invalid.stored, /not-a-date/);
    result.interactions.external_requests = externalRequests;
    assert.deepEqual(externalRequests, []);
    await context.close();
  }

  {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      colorScheme: 'light',
      locale: 'zh-CN',
      timezoneId: 'Asia/Shanghai'
    });
    const page = await context.newPage();
    await page.addInitScript(() => {
      Storage.prototype.getItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
      Storage.prototype.setItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
    });
    await page.goto(publicUrl, { waitUntil: 'networkidle' });
    await page.locator('#task-input').fill('临时事项');
    await page.locator('button[type=submit]').click();
    result.interactions.storage_error = {
      notice: await page.locator('#notice').innerText(),
      status: await page.locator('#storage-status').innerText(),
      rows: await page.locator('#task-list > li').count()
    };
    assert.match(result.interactions.storage_error.notice, /刷新后/);
    assert.match(result.interactions.storage_error.status, /临时模式/);
    assert.equal(result.interactions.storage_error.rows, 1);
    await context.close();
  }

  for (const state of states) {
    const context = await browser.newContext({
      viewport: { width: state.width, height: 900 },
      colorScheme: state.theme,
      locale: 'zh-CN',
      timezoneId: 'Asia/Shanghai'
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await page.goto(publicUrl, { waitUntil: 'networkidle' });
    await page.evaluate(key => localStorage.setItem(key, JSON.stringify([
      { id: 'created', text: '整理今天的计划', completed: false, createdAt: '2026-11-17T13:47:00.000Z' },
      { id: 'completed', text: '完成一件重要的小事', completed: true, createdAt: '2026-11-17T12:05:00.000Z' },
      { id: 'long', text: '很长的待办内容'.repeat(25), completed: false, createdAt: '2026-11-17T11:30:00.000Z' }
    ])), storageKey);
    await page.reload({ waitUntil: 'networkidle' });
    const snapshot = await page.evaluate(() => ({
      scroll_width: document.documentElement.scrollWidth,
      inner_width: innerWidth,
      color_scheme: matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      rows: [...document.querySelectorAll('#task-list > li')].map(row => {
        const time = row.querySelector('.task-created-at');
        const remove = row.querySelector('.delete-button');
        const check = row.querySelector('.task-check');
        const details = row.querySelector('.task-details');
        const timeRect = time?.getBoundingClientRect();
        const removeRect = remove?.getBoundingClientRect();
        return {
          title: row.querySelector('.task-text')?.textContent,
          time: time?.textContent,
          datetime: time?.getAttribute('datetime'),
          time_rect: timeRect ? { x: timeRect.x, y: timeRect.y, width: timeRect.width, height: timeRect.height } : null,
          details_width: details?.getBoundingClientRect().width,
          check_rect: check ? { x: check.getBoundingClientRect().x, y: check.getBoundingClientRect().y, width: check.getBoundingClientRect().width, height: check.getBoundingClientRect().height } : null,
          remove_rect: removeRect ? { x: removeRect.x, y: removeRect.y, width: removeRect.width, height: removeRect.height } : null,
          overlaps_delete: !!(timeRect && removeRect && timeRect.right > removeRect.left)
        };
      }),
      add_rect: (() => { const r = document.querySelector('.add-button').getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; })(),
      filter_rects: [...document.querySelectorAll('.filters button')].map(button => {
        const r = button.getBoundingClientRect();
        return { text: button.textContent, x: r.x, y: r.y, width: r.width, height: r.height, pressed: button.getAttribute('aria-pressed') };
      })
    }));
    assert.equal(snapshot.scroll_width, snapshot.inner_width);
    assert.equal(snapshot.rows.length, 3);
    assert.equal(snapshot.color_scheme, state.theme);
    for (const row of snapshot.rows) {
      assert.match(row.time, /^创建于 \d{4}\/\d{2}\/\d{2} \d{2}:\d{2}$/);
      assert.ok(row.datetime);
      assert.equal(row.overlaps_delete, false);
      assert.ok(row.remove_rect.width >= 44 && row.remove_rect.height >= 44);
      assert.ok(row.check_rect.width >= 20 && row.check_rect.height >= 20);
    }
    assert.ok(snapshot.add_rect.width >= 44 && snapshot.add_rect.height >= 44);
    assert.ok(snapshot.filter_rects.every(button => button.width >= 44 && button.height >= 40));
    const filename = `todo-${state.width}-${state.theme}.png`;
    const screenshotPath = fileURLToPath(new URL(filename, evidenceDir));
    await page.screenshot({ path: screenshotPath, fullPage: true });
    const bytes = await readFile(screenshotPath);
    result.screenshots.push({
      ...state,
      file: filename,
      captured_at: now(),
      sha256: sha256(bytes),
      bytes: bytes.length,
      snapshot,
      page_errors: pageErrors
    });
    assert.deepEqual(pageErrors, []);
    await context.close();
  }
  result.cleanup = { browser_closed: false, contexts_closed: true, owned_server_started: false };
} finally {
  if (browser) await browser.close();
  result.cleanup.browser_closed = true;
  result.finished_at = now();
  await writeFile(new URL('./result.json', evidenceDir), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
}

console.log(JSON.stringify(result, null, 2));
