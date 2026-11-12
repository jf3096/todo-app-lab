const { test, expect } = require('@playwright/test');
const storageKey = 'todo-app-lab.tasks.v1';

async function addTask(page, text) {
  await page.getByRole('textbox', { name: '新待办事项' }).fill(text);
  await page.getByRole('button', { name: '添加', exact: true }).click();
}

test('serves the app and rejects whitespace-only tasks', async ({ page }) => {
  const response = await page.goto('./');
  expect(response.status()).toBe(200);
  await expect(page.getByRole('heading', { name: '我的待办' })).toBeVisible();
  await expect(page.getByText('从一件小事开始')).toBeVisible();
  await addTask(page, '   ');
  await expect(page.getByRole('listitem')).toHaveCount(0);
  await expect(page.getByRole('alert')).toContainText('请输入');
});

test('adds, persists, completes, filters, restores and deletes a task', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('./');
  await page.getByRole('textbox', { name: '新待办事项' }).fill('  买牛奶  ');
  await page.getByRole('textbox', { name: '新待办事项' }).press('Enter');
  await expect(page.getByRole('listitem')).toHaveCount(1);
  await expect(page.getByRole('listitem')).toContainText('买牛奶');
  await page.reload();
  await expect(page.getByRole('checkbox', { name: '买牛奶', exact: true })).not.toBeChecked();
  await page.getByRole('checkbox', { name: '买牛奶', exact: true }).check();
  await page.reload();
  await expect(page.getByRole('checkbox', { name: '买牛奶', exact: true })).toBeChecked();
  await expect(page.getByTestId('remaining')).toHaveText('0 项待完成');
  await page.getByRole('button', { name: '未完成', exact: true }).click();
  await expect(page.getByRole('listitem')).toHaveCount(0);
  await page.getByRole('button', { name: '已完成', exact: true }).click();
  await expect(page.getByRole('listitem')).toHaveCount(1);
  await page.getByRole('checkbox', { name: '买牛奶', exact: true }).click();
  await expect(page.getByRole('listitem')).toHaveCount(0);
  await page.getByRole('button', { name: '全部', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('checkbox', { name: '买牛奶', exact: true })).not.toBeChecked();
  await page.getByRole('button', { name: '删除：买牛奶', exact: true }).click();
  await page.reload();
  await expect(page.getByRole('listitem')).toHaveCount(0);
  await expect(page.getByTestId('remaining')).toHaveText('0 项待完成');
  expect(errors).toEqual([]);
});

test('treats user input as text and keeps other tasks when deleting', async ({ page }) => {
  await page.goto('./');
  await addTask(page, '<img src=x onerror=alert(1)>');
  await addTask(page, '保留这件事');
  await expect(page.getByRole('listitem')).toHaveCount(2);
  await expect(page.locator('#task-list img')).toHaveCount(0);
  await page.getByRole('button', { name: '删除：<img src=x onerror=alert(1)>', exact: true }).click();
  await expect(page.getByRole('listitem')).toHaveCount(1);
  await expect(page.getByRole('listitem')).toContainText('保留这件事');
});

test('reports malformed stored data without silently overwriting it', async ({ page }) => {
  await page.addInitScript(key => localStorage.setItem(key, '{broken'), storageKey);
  await page.goto('./');
  await expect(page.getByRole('alert')).toContainText('保存的数据');
  await addTask(page, '本次临时待办');
  await expect(page.getByRole('listitem')).toHaveCount(1);
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBe('{broken');
});

test('rejects invalid stored task shapes without crashing', async ({ page }) => {
  await page.addInitScript(key => localStorage.setItem(key, '[{"id":1,"text":null}]'), storageKey);
  await page.goto('./');
  await expect(page.getByRole('alert')).toContainText('保存的数据');
  await expect(page.getByRole('listitem')).toHaveCount(0);
});

test('remains usable and warns when browser storage is unavailable', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
    Storage.prototype.setItem = () => { throw new DOMException('Blocked', 'SecurityError'); };
  });
  await page.goto('./');
  await addTask(page, '临时事项');
  await expect(page.getByRole('listitem')).toHaveCount(1);
  await expect(page.getByRole('alert')).toContainText('刷新后');
});

test('preserves saved tasks when a later write exceeds browser storage capacity', async ({ page }) => {
  await page.addInitScript(key => {
    localStorage.setItem(key, JSON.stringify([{ id: 'saved', text: '原有事项', completed: false }]));
    Storage.prototype.setItem = () => { throw new DOMException('Full', 'QuotaExceededError'); };
  }, storageKey);
  await page.goto('./');
  await expect(page.getByRole('listitem')).toHaveCount(1);
  await addTask(page, '临时新增');
  await expect(page.getByRole('listitem')).toHaveCount(2);
  await expect(page.getByRole('alert')).toContainText('无法保存');
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey))
    .toEqual([{ id: 'saved', text: '原有事项', completed: false }]);
});

for (const colorScheme of ['light', 'dark']) {
  for (const width of [375, 1280]) {
    test(`readable controls and long text at ${width}px in ${colorScheme} mode`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme });
      await page.goto('./');
      await addTask(page, '整理今天的计划');
      await addTask(page, '完成一件重要的小事');
      await page.getByRole('checkbox', { name: '完成一件重要的小事' }).check();
      await addTask(page, '很长的待办内容'.repeat(25));
      await expect(page.getByRole('listitem')).toHaveCount(3);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await expect(page.getByRole('button', { name: '添加', exact: true })).toBeInViewport();
      await page.screenshot({ path: testInfo.outputPath(`todo-${width}-${colorScheme}.png`), fullPage: true });
    });
  }
}
