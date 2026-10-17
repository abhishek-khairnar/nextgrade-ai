const fs = require('fs');
const path = require('path');
const puppeteer = require('../frontend/node_modules/puppeteer-core');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const BASE_URL = 'http://127.0.0.1:5173';
const API_DOCS_URL = 'http://127.0.0.1:8000/docs';
const OUT_DIR = path.resolve(__dirname, '..', 'docs', 'screenshots');

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function capture() {
  console.log('Launching Chrome for 40-screenshot suite...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--window-size=1440,900',
    ],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  async function take(filename, options = {}) {
    const targetPath = path.join(OUT_DIR, filename);
    await page.screenshot({ path: targetPath, ...options });
    const stat = fs.statSync(targetPath);
    console.log(`[Captured] ${filename} (${(stat.size / 1024).toFixed(1)} KB)`);
  }

  async function gotoDesktop(url, wait = 800) {
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto(url, { waitUntil: 'load', timeout: 15000 });
    await sleep(wait);
  }

  async function gotoMobile(url, wait = 800) {
    await page.setViewport({ width: 390, height: 844 });
    await page.goto(url, { waitUntil: 'load', timeout: 15000 });
    await sleep(wait);
  }

  // ----------------------------------------------------
  // 01 to 04: HOME PAGE
  // ----------------------------------------------------
  console.log('\n--- 01 to 04: Home Page ---');
  try {
    await gotoDesktop(`${BASE_URL}/`, 1000);

    // 01: Home Hero
    await page.evaluate(() => window.scrollTo(0, 0));
    await sleep(300);
    await take('01-home-hero.png');

    // 02: Home Stats & Workflow
    await page.evaluate(() => window.scrollTo(0, 720));
    await sleep(400);
    await take('02-home-stats-and-workflow.png');

    // 03: Home Top Drivers & CTA
    await page.evaluate(() => window.scrollTo(0, 1600));
    await sleep(400);
    await take('03-home-top-drivers-and-cta.png');

    // 04: Home Mobile
    await gotoMobile(`${BASE_URL}/`, 800);
    await take('04-home-mobile.png');
  } catch (e) {
    console.error('Home error:', e.message);
  }

  // ----------------------------------------------------
  // 05 to 12: PREDICT PAGE
  // ----------------------------------------------------
  console.log('\n--- 05 to 12: Predict Page ---');
  try {
    await gotoDesktop(`${BASE_URL}/predict`, 1200);

    // 05: Predict Form Early Warning
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      const buttons = Array.from(document.querySelectorAll('button'));
      const earlyBtn = buttons.find((b) => b.textContent.includes('Early Warning'));
      if (earlyBtn) earlyBtn.click();
    });
    await sleep(500);
    await take('05-predict-form-early-warning.png');

    // 06: Predict Form Midterm
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const midBtn = buttons.find((b) => b.textContent.includes('Mid-Term'));
      if (midBtn) midBtn.click();
    });
    await sleep(500);
    await take('06-predict-form-midterm.png');

    // 07: Predict Advanced Fields
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const advBtn = buttons.find((b) => b.textContent.includes('Advanced & Demographic'));
      if (advBtn) advBtn.click();
    });
    await sleep(400);
    await page.evaluate(() => window.scrollTo(0, 360));
    await sleep(400);
    await take('07-predict-advanced-fields.png');

    // 08: Predict Result Panel
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      const buttons = Array.from(document.querySelectorAll('button'));
      const atRiskBtn = buttons.find((b) => b.textContent.includes('At-Risk Student'));
      if (atRiskBtn) atRiskBtn.click();
    });
    await sleep(1000);
    await page.evaluate(() => window.scrollTo(0, 150));
    await sleep(400);
    await take('08-predict-result-panel.png');

    // 09: Predict Factor Bars & Suggestions
    await page.evaluate(() => window.scrollTo(0, 700));
    await sleep(500);
    await take('09-predict-factor-bars-and-suggestions.png');

    // 10: Predict What-If Simulator
    await page.evaluate(() => window.scrollTo(0, 1200));
    await sleep(500);
    await take('10-predict-whatif-simulator.png');

    // 11: Predict Validation Errors
    await page.evaluate(() => {
      window.scrollTo(0, 0);
      const absencesInput = document.getElementById('absences');
      if (absencesInput) {
        absencesInput.value = '150';
        absencesInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
      const submitBtn = document.querySelector('button[type="submit"]');
      if (submitBtn) submitBtn.click();
    });
    await sleep(600);
    await take('11-predict-validation-errors.png');

    // 12: Predict Mobile
    await gotoMobile(`${BASE_URL}/predict`, 800);
    await take('12-predict-mobile.png');
  } catch (e) {
    console.error('Predict error:', e.message);
  }

  // ----------------------------------------------------
  // 13 to 16: BATCH PAGE
  // ----------------------------------------------------
  console.log('\n--- 13 to 16: Batch Page ---');
  try {
    await gotoDesktop(`${BASE_URL}/batch`, 800);

    // 13: Batch Upload
    await take('13-batch-upload.png');

    // 14: Batch Validation Summary
    const sampleCsvPath = path.resolve(__dirname, '..', 'data', 'sample_batch.csv');
    const fileInput = await page.$('input[type="file"]');
    if (fileInput) {
      await fileInput.uploadFile(sampleCsvPath);
      await sleep(500);
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const uploadBtn = buttons.find((b) => b.textContent.includes('Run Batch Prediction') || b.textContent.includes('Process Batch'));
        if (uploadBtn) uploadBtn.click();
      });
      await sleep(1500);
    }
    await take('14-batch-validation-summary.png');

    // 15: Batch Results & Charts
    await page.evaluate(() => window.scrollTo(0, 520));
    await sleep(500);
    await take('15-batch-results-and-charts.png');

    // 16: Batch Mobile
    await gotoMobile(`${BASE_URL}/batch`, 800);
    await take('16-batch-mobile.png');
  } catch (e) {
    console.error('Batch error:', e.message);
  }

  // ----------------------------------------------------
  // 17 to 20: INSIGHTS PAGE
  // ----------------------------------------------------
  console.log('\n--- 17 to 20: Insights Page ---');
  try {
    await gotoDesktop(`${BASE_URL}/insights`, 1200);

    // 17: Insights KPIs & Filters
    await take('17-insights-kpis-and-filters.png');

    // 18: Insights Progression & Explorer
    await page.evaluate(() => window.scrollTo(0, 650));
    await sleep(500);
    await take('18-insights-progression-and-explorer.png');

    // 19: Insights Correlation Heatmap
    await page.evaluate(() => window.scrollTo(0, 1380));
    await sleep(500);
    await take('19-insights-correlation-heatmap.png');

    // 20: Insights Data Quality
    await page.evaluate(() => window.scrollTo(0, 2100));
    await sleep(500);
    await take('20-insights-data-quality.png');
  } catch (e) {
    console.error('Insights error:', e.message);
  }

  // ----------------------------------------------------
  // 21 to 25: MODELS PAGE
  // ----------------------------------------------------
  console.log('\n--- 21 to 25: Models Page ---');
  try {
    await gotoDesktop(`${BASE_URL}/models`, 1200);

    // 21: Models Summary & Comparison
    await take('21-models-summary-and-comparison.png');

    // 22: Models Scatter & Residuals
    await page.evaluate(() => window.scrollTo(0, 780));
    await sleep(500);
    await take('22-models-scatter-and-residuals.png');

    // 23: Models Confusion & ROC
    await page.evaluate(() => window.scrollTo(0, 1580));
    await sleep(500);
    await take('23-models-confusion-and-roc.png');

    // 24: Models Feature Importance
    await page.evaluate(() => window.scrollTo(0, 2350));
    await sleep(500);
    await take('24-models-feature-importance.png');

    // 25: Models Honest Findings
    await page.evaluate(() => window.scrollTo(0, 2980));
    await sleep(500);
    await take('25-models-honest-findings.png');
  } catch (e) {
    console.error('Models error:', e.message);
  }

  // ----------------------------------------------------
  // 26 to 30: HISTORY PAGE
  // ----------------------------------------------------
  console.log('\n--- 26 to 30: History Page ---');
  try {
    await gotoDesktop(`${BASE_URL}/history`, 1000);

    // 26: History Table
    await take('26-history-table.png');

    // 27: History Detail Drawer
    await page.evaluate(() => {
      const viewButtons = Array.from(document.querySelectorAll('button'));
      const viewBtn = viewButtons.find((b) => b.textContent.includes('Details') || b.querySelector('svg.lucide-eye'));
      if (viewBtn) viewBtn.click();
    });
    await sleep(600);
    await take('27-history-detail-drawer.png');

    // Close drawer
    await page.evaluate(() => {
      const closeButtons = Array.from(document.querySelectorAll('button'));
      const closeBtn = closeButtons.find((b) => b.querySelector('svg.lucide-x'));
      if (closeBtn) closeBtn.click();
    });
    await sleep(400);

    // 28: History Delete Modal
    await page.evaluate(() => {
      const trashButtons = Array.from(document.querySelectorAll('button'));
      const trashBtn = trashButtons.find((b) => b.querySelector('svg.lucide-trash-2') && !b.textContent.includes('Clear All'));
      if (trashBtn) trashBtn.click();
    });
    await sleep(600);
    await take('28-history-delete-modal.png');

    // Cancel modal
    await page.evaluate(() => {
      const cancelButtons = Array.from(document.querySelectorAll('button'));
      const cancelBtn = cancelButtons.find((b) => b.textContent.includes('Cancel'));
      if (cancelBtn) cancelBtn.click();
    });
    await sleep(400);

    // 29: History Empty State
    await page.evaluate(() => {
      const searchInput = document.querySelector('input[placeholder*="Search"]');
      if (searchInput) {
        searchInput.value = 'NonExistentStudentSearchQuery999';
        searchInput.dispatchEvent(new Event('input', { bubbles: true }));
        searchInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    await sleep(700);
    await take('29-history-empty-state.png');

    // 30: History Mobile Cards
    await gotoMobile(`${BASE_URL}/history`, 800);
    await take('30-history-mobile-cards.png');
  } catch (e) {
    console.error('History error:', e.message);
  }

  // ----------------------------------------------------
  // 31 to 34: ABOUT, PRIVACY, 404
  // ----------------------------------------------------
  console.log('\n--- 31 to 34: About, Privacy, 404 ---');
  try {
    // 31: About Methodology
    await gotoDesktop(`${BASE_URL}/about`, 600);
    await take('31-about-methodology.png');

    // 32: About Ethics & Limitations
    await page.evaluate(() => window.scrollTo(0, 1100));
    await sleep(400);
    await take('32-about-ethics-and-limitations.png');

    // 33: Privacy
    await gotoDesktop(`${BASE_URL}/privacy`, 600);
    await take('33-privacy.png');

    // 34: 404 Page
    await gotoDesktop(`${BASE_URL}/nonexistent-route-404-demo`, 600);
    await take('34-404.png');
  } catch (e) {
    console.error('About/Privacy error:', e.message);
  }

  // ----------------------------------------------------
  // 35 to 37: NAVBAR, MOBILE MENU, FOOTER
  // ----------------------------------------------------
  console.log('\n--- 35 to 37: Navbar, Mobile Menu, Footer ---');
  try {
    // 35: Navbar Desktop
    await gotoDesktop(`${BASE_URL}/`, 500);
    const headerEl = await page.$('header');
    if (headerEl) {
      await headerEl.screenshot({ path: path.join(OUT_DIR, '35-navbar-desktop.png') });
      console.log(`[Captured] 35-navbar-desktop.png`);
    }

    // 36: Mobile Menu Open
    await gotoMobile(`${BASE_URL}/`, 500);
    await page.evaluate(() => {
      const menuBtn = document.querySelector('header button');
      if (menuBtn) menuBtn.click();
    });
    await sleep(500);
    await take('36-mobile-menu-open.png');

    // 37: Footer
    await gotoDesktop(`${BASE_URL}/`, 500);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await sleep(500);
    const footerEl = await page.$('footer');
    if (footerEl) {
      await footerEl.screenshot({ path: path.join(OUT_DIR, '37-footer.png') });
      console.log(`[Captured] 37-footer.png`);
    }
  } catch (e) {
    console.error('Nav/Footer error:', e.message);
  }

  // ----------------------------------------------------
  // 38 to 39: ERROR STATE & LOADING SKELETONS
  // ----------------------------------------------------
  console.log('\n--- 38 to 39: Error State & Skeletons ---');
  try {
    // 38: Error State Backend Offline
    await page.setViewport({ width: 1440, height: 900 });
    await page.setRequestInterception(true);
    const abortHandler = (req) => {
      if (req.url().includes('/api/')) req.abort('failed');
      else req.continue();
    };
    page.on('request', abortHandler);
    await page.goto(`${BASE_URL}/insights`, { waitUntil: 'load', timeout: 10000 }).catch(() => {});
    await sleep(1500);
    await take('38-error-state-backend-offline.png');
    page.off('request', abortHandler);
    await page.setRequestInterception(false);

    // 39: Loading Skeletons
    await page.setRequestInterception(true);
    const delayHandler = (req) => {
      if (req.url().includes('/api/')) {
        setTimeout(() => {
          try { req.continue(); } catch (e) {}
        }, 15000);
      } else {
        req.continue();
      }
    };
    page.on('request', delayHandler);
    await page.goto(`${BASE_URL}/models`, { waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => {});
    await sleep(400);
    await take('39-loading-skeletons.png');
    page.off('request', delayHandler);
    await page.setRequestInterception(false);
  } catch (e) {
    console.error('State shots error:', e.message);
  }

  // ----------------------------------------------------
  // 40: SWAGGER API DOCS
  // ----------------------------------------------------
  console.log('\n--- 40: Swagger API Docs ---');
  try {
    await gotoDesktop(API_DOCS_URL, 1200);
    await take('40-swagger-api-docs.png');
  } catch (e) {
    console.error('Swagger error:', e.message);
  }

  // ----------------------------------------------------
  // 42 to 44: V1.0.1 POLISH (GAUGE, STALE BANNER, BORDERLINE)
  // ----------------------------------------------------
  console.log('\n--- 42 to 44: v1.0.1 UI Enhancements ---');
  try {
    await gotoDesktop(`${BASE_URL}/predict`, 1000);

    // 44: Predict Borderline Note (G1=10, G2=10 produces borderline evaluation)
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
    await take('44-predict-borderline-note.png');

    // 42: Gauge Close-up (capture the rebuilt gauge component cleanly)
    const gaugeEl = await page.$('[role="img"][aria-label*="Predicted grade"]');
    if (gaugeEl) {
      const targetPath = path.join(OUT_DIR, '42-gauge-closeup.png');
      await gaugeEl.screenshot({ path: targetPath });
      console.log(`[Captured] 42-gauge-closeup.png`);
    }

    // 43: Predict Stale Result Banner (editing inputs after prediction displays amber notice)
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
    await take('43-predict-stale-result-banner.png');
  } catch (e) {
    console.error('v1.0.1 shots error:', e.message);
  }

  console.log('\nScreenshot suite finished successfully!');
  await browser.close();
}

capture().catch((e) => {
  console.error('Global capture error:', e);
  process.exit(1);
});
