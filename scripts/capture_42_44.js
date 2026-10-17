const fs = require('fs');
const path = require('path');
const puppeteer = require('../frontend/node_modules/puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://127.0.0.1:5173';
const OUT_DIR = path.resolve(__dirname, '..', 'docs', 'screenshots');

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--window-size=1440,900', '--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto(BASE_URL + '/predict', { waitUntil: 'load', timeout: 15000 });
  await sleep(1000);

  // Set G1=10, G2=10
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    function setVal(id, val) {
      const el = document.getElementById(id);
      if (!el) return;
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(el, val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
    setVal('G1', '10');
    setVal('G2', '10');
  });
  await sleep(300);

  const submitBtn = await page.$('button[type="submit"]');
  if (submitBtn) await submitBtn.click();
  await sleep(1500);

  await page.evaluate(() => window.scrollTo(0, 160));
  await sleep(300);
  await page.screenshot({ path: path.join(OUT_DIR, '44-predict-borderline-note.png') });
  console.log('Recaptured 44-predict-borderline-note.png');

  const gaugeEl = await page.$('[role="img"][aria-label*="Predicted grade"]');
  if (gaugeEl) {
    await gaugeEl.screenshot({ path: path.join(OUT_DIR, '42-gauge-closeup.png') });
    console.log('Recaptured 42-gauge-closeup.png');
  }

  // Edit absences to 24 to trigger stale banner
  await page.evaluate(() => {
    const el = document.getElementById('absences');
    if (el) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      setter.call(el, '24');
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
    window.scrollTo(0, 160);
  });
  await sleep(800);
  await page.screenshot({ path: path.join(OUT_DIR, '43-predict-stale-result-banner.png') });
  console.log('Recaptured 43-predict-stale-result-banner.png');

  await browser.close();
}

run().catch(console.error);
