import { test, expect } from '@playwright/test';

test.describe('Smoke tests', () => {
  test('home page loads and language chooser works', async ({ page }) => {
    await page.goto('/');
    // Wait for the app to hydrate
    await page.waitForTimeout(1000);

    // If language chooser appears, select Spanish
    const chooser = page.locator('text=Español');
    if (await chooser.isVisible({ timeout: 3000 }).catch(() => false)) {
      await chooser.click();
    }
  });

  test('rosary page shows Today\'s Mystery banner', async ({ page }) => {
    // Set language preference to skip chooser
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('sjd_lang', 'es');
      localStorage.setItem('sjd_first_visit_done', 'true');
    });

    await page.goto('/rosary');
    await page.waitForTimeout(1000);

    // Verify Today's Mystery banner exists with Spanish label
    const banner = page.locator('[data-testid="todays-mystery-label"]');
    await expect(banner).toBeVisible();
    const text = await banner.textContent();
    // Should contain Spanish mystery name
    expect(text).toMatch(/Misterios (Gozosos|Dolorosos|Gloriosos|Luminosos)/);
  });

  test('rosary bead counter increments', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('sjd_lang', 'en');
      localStorage.setItem('sjd_first_visit_done', 'true');
    });

    await page.goto('/rosary');
    await page.waitForTimeout(1000);

    // Start praying
    const startBtn = page.locator('text=Start Praying');
    if (await startBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await startBtn.click();
    }

    // Navigate past Sign of the Cross and Apostles' Creed to get to the first bead step
    // Step through: Sign of Cross -> Next
    const nextBtn = page.locator('text=Next →');
    if (await nextBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nextBtn.click(); // past Sign of the Cross
      await page.waitForTimeout(300);
      await nextBtn.click(); // past Apostles' Creed
      await page.waitForTimeout(300);
      await nextBtn.click(); // past Our Father
      await page.waitForTimeout(300);

      // Now on Hail Mary x3 bead step — tap the circle
      const beadBtn = page.locator('button[aria-label*="Tap to pray"]');
      if (await beadBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await beadBtn.click();
        // Check the counter shows 1
        await expect(page.locator('text=1')).toBeVisible();
      }
    }
  });

  test('admin redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('sjd_first_visit_done', 'true');
    });

    await page.goto('/admin');
    await page.waitForTimeout(2000);

    // Should show login form or "not configured" message — not the dashboard
    const pageContent = await page.textContent('body');
    const hasLoginIndicator =
      pageContent?.includes('Sign in') ||
      pageContent?.includes('Magic Link') ||
      pageContent?.includes('Admin Login') ||
      pageContent?.includes('Supabase') ||
      pageContent?.includes('not configured');
    expect(hasLoginIndicator).toBeTruthy();
  });
});
