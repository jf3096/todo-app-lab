const { chromium } = require('playwright');
const fs = require('node:fs/promises');
const path = require('node:path');

const outputDir = __dirname;
const candidateSha = '6b2d3cc987b09a05d85276d2f36b02be85a67040';
const entryUrl = 'http://127.0.0.1:4173/';
const syntheticText = 'v3-created-at-check';

async function main() {
  const browser = await chromium.launch({ executablePath: process.env.FEAT_002_CHROMIUM, headless: true });
  const states = [];
  for (const colorScheme of ['light', 'dark']) {
    for (const width of [375, 1280]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme, locale: 'zh-CN' });
      const page = await context.newPage();
      await page.goto(entryUrl, { waitUntil: 'networkidle' });
      await page.locator('#task-input').fill(syntheticText);
      await page.locator('button[type="submit"]').click();
      const item = page.getByRole('listitem').filter({ hasText: syntheticText });
      await item.waitFor();
      const observation = await item.evaluate((node) => ({
        text: node.textContent,
        timeText: node.querySelector('time')?.textContent ?? null,
        hasCreatedAt: Boolean(node.querySelector('[data-created-at], .task-created-at, time')),
        scrollWidth: document.documentElement.scrollWidth,
        innerWidth,
        overflows: document.documentElement.scrollWidth > innerWidth,
        itemRect: (() => {
          const rect = node.getBoundingClientRect();
          return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
        })(),
        submitVisible: Boolean(document.querySelector('button[type="submit"]')?.getClientRects().length)
      }));
      const screenshot = `layout-${width}-${colorScheme}.png`;
      await page.screenshot({ path: path.join(outputDir, screenshot), fullPage: true });
      states.push({ width, colorScheme, screenshot, ...observation });
      await context.close();
    }
  }
  await browser.close();
  const result = { schema: 'feat-002.layout-replay/v1', candidate_sha: candidateSha, entry_url: entryUrl, browser: process.env.FEAT_002_CHROMIUM, synthetic_text: syntheticText, states };
  await fs.writeFile(path.join(outputDir, 'layout-result.json'), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
