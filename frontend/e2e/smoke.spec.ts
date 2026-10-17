import { test, expect } from '@playwright/test';

const ROUTES = [
  '/',
  '/predict',
  '/batch',
  '/insights',
  '/models',
  '/history',
  '/about',
  '/privacy',
  '/non-existing-route-404',
];

const VIEWPORTS = [
  { width: 320, height: 640, label: '320px mobile' },
  { width: 768, height: 1024, label: '768px tablet' },
  { width: 1440, height: 900, label: '1440px desktop' },
];

test.describe('Responsive & No Horizontal Overflow Smoke Suite', () => {
  for (const vp of VIEWPORTS) {
    for (const route of ROUTES) {
      test(`${route} has no horizontal scroll or console errors on ${vp.label}`, async ({ page }) => {
        const consoleErrors: string[] = [];
        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
          }
        });
        page.on('pageerror', (err) => {
          consoleErrors.push(err.message);
        });

        await page.setViewportSize({ width: vp.width, height: vp.height });
        await page.goto(route, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(400);

        // Verify no horizontal overflow
        const overflow = await page.evaluate(() => {
          return {
            scrollWidth: document.documentElement.scrollWidth,
            innerWidth: window.innerWidth,
          };
        });

        expect(
          overflow.scrollWidth,
          `Route ${route} has horizontal overflow at ${vp.width}px (scrollWidth: ${overflow.scrollWidth}, innerWidth: ${overflow.innerWidth})`
        ).toBeLessThanOrEqual(overflow.innerWidth);

        // Verify no console errors
        expect(consoleErrors, `Console errors occurred on ${route} at ${vp.width}px`).toEqual([]);
      });
    }
  }
});

test.describe('Single Prediction Submission Integrity', () => {
  test('single click on Generate Prediction produces exactly 1 toast and 1 history record', async ({
    page,
    request,
  }) => {
    // 1. Get initial history count from backend API
    const initialResp = await request.get('http://127.0.0.1:8000/api/history');
    expect(initialResp.status()).toBe(200);
    const initialHistory = await initialResp.json();
    const initialTotal = initialHistory.total;

    // 2. Open Predict page
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/predict', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    // Initial state should show placeholder
    await expect(page.locator('text=Your prediction will appear here')).toBeVisible();

    // 3. Click "Generate Prediction" once
    const generateBtn = page.getByRole('button', { name: /generate prediction/i });
    await expect(generateBtn).toBeVisible();
    await generateBtn.click();

    // 4. Result card should appear with predicted grade
    await page.waitForSelector('[role="img"][aria-label*="Predicted grade"]', { timeout: 8000 });

    // 5. Verify exactly 1 success toast appears
    const toasts = page.locator('[role="status"]:has-text("Prediction generated and auto-saved to History!")');
    await expect(toasts).toHaveCount(1);

    // 6. Verify history count increased by exactly 1 in the database
    const afterResp = await request.get('http://127.0.0.1:8000/api/history');
    expect(afterResp.status()).toBe(200);
    const afterHistory = await afterResp.json();
    expect(afterHistory.total).toBe(initialTotal + 1);
  });
});
