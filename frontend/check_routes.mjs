import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  let hasErrors = false;
  page.on('pageerror', error => { console.error('PAGE ERROR =>', error.message); hasErrors = true; });
  page.on('console', msg => {
    if (msg.type() === 'error') { console.log('CONSOLE ERROR =>', msg.text()); hasErrors = true; }
  });
  
  const routes = [
    'http://localhost:5173/closekart/#/',
    'http://localhost:5173/closekart/#/register-shop',
    'http://localhost:5173/closekart/#/shop-dashboard',
    'http://localhost:5173/closekart/#/login'
  ];
  
  for (const route of routes) {
      console.log('Visiting:', route);
      try {
          await page.goto(route);
          await page.waitForTimeout(2000);
      } catch (e) {
          console.error("Failed to load", route, e.message);
      }
  }
  
  if (!hasErrors) console.log("NO_ERRORS_FOUND");
  await browser.close();
})();
