import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('pageerror', error => console.error('PAGE ERROR!', error));
  page.on('console', msg => {
    if (msg.type() === 'error') console.log('CONSOLE ERROR!', msg.text());
  });
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(3000);
  await browser.close();
})();
