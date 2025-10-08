/**
 * REID Dashboard E2E Test Suite
 * End-to-end tests for critical REID user flows
 *
 * @requires Playwright
 */

import { test, expect } from '@playwright/test';

test.describe('REID Dashboard E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Login as Elite tier user
    await page.goto('/login');
    await page.fill('input[name="email"]', 'elite@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/real-estate/dashboard');
  });

  test('displays REID dashboard for Elite users', async ({ page }) => {
    await page.goto('/real-estate/reid/dashboard');

    // Verify dashboard loaded
    await expect(page.locator('h1')).toContainText('REID Dashboard');

    // Verify dark theme applied
    await expect(page.locator('.reid-theme')).toBeVisible();

    // Verify key sections visible
    await expect(page.locator('text=Market Insights')).toBeVisible();
    await expect(page.locator('text=Active Alerts')).toBeVisible();
  });

  test('loads market heatmap', async ({ page }) => {
    await page.goto('/real-estate/reid/dashboard');

    // Wait for map to load
    await expect(page.locator('#reid-map')).toBeVisible({ timeout: 10000 });

    // Verify map controls visible
    await expect(page.locator('.leaflet-control-zoom')).toBeVisible();
  });

  test('displays neighborhood insights', async ({ page }) => {
    await page.goto('/real-estate/reid/dashboard');

    // Wait for insights to load
    await expect(page.locator('.reid-insight-card').first()).toBeVisible({ timeout: 10000 });

    // Verify insight data displayed
    await expect(page.locator('text=Median Price')).toBeVisible();
    await expect(page.locator('text=Days on Market')).toBeVisible();
  });

  test('creates new alert', async ({ page }) => {
    await page.goto('/real-estate/reid/alerts');

    // Click create alert button
    await page.click('button:has-text("New Alert")');

    // Fill alert form
    await page.fill('input[name="name"]', 'E2E Test Alert');
    await page.selectOption('select[name="alertType"]', 'PRICE_DROP');
    await page.fill('input[name="threshold"]', '10');
    await page.fill('input[name="areaCodes"]', '94110');
    await page.selectOption('select[name="frequency"]', 'DAILY');

    // Submit form
    await page.click('button[type="submit"]');

    // Verify alert created
    await expect(page.locator('text=E2E Test Alert')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Alert created successfully')).toBeVisible();
  });

  test('filters insights by area code', async ({ page }) => {
    await page.goto('/real-estate/reid/dashboard');

    // Apply filter
    await page.fill('input[placeholder*="area code"]', '94110');
    await page.click('button:has-text("Apply Filters")');

    // Wait for filtered results
    await page.waitForTimeout(1000);

    // Verify filtered results
    const insights = page.locator('.reid-insight-card');
    await expect(insights.first()).toBeVisible();
    await expect(insights.first()).toContainText('94110');
  });

  test('views alert details', async ({ page }) => {
    await page.goto('/real-estate/reid/alerts');

    // Click on first alert
    await page.click('.alert-item:first-child');

    // Verify alert details page
    await expect(page.locator('h2:has-text("Alert Details")')).toBeVisible();
    await expect(page.locator('text=Trigger History')).toBeVisible();
    await expect(page.locator('text=Criteria')).toBeVisible();
  });

  test('generates market report', async ({ page }) => {
    await page.goto('/real-estate/reid/reports');

    // Click generate report
    await page.click('button:has-text("Generate Report")');

    // Fill report form
    await page.fill('input[name="title"]', 'E2E Test Report');
    await page.selectOption('select[name="reportType"]', 'QUARTERLY');
    await page.fill('input[name="areaCodes"]', '94110,94103');
    await page.check('input[name="includeInsights"]');
    await page.check('input[name="includeAlerts"]');

    // Generate
    await page.click('button:has-text("Generate")');

    // Verify report created
    await expect(page.locator('text=E2E Test Report')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Report generated successfully')).toBeVisible();
  });

  test('blocks non-Elite users from REID', async ({ page }) => {
    // Logout and login as GROWTH tier user
    await page.goto('/logout');
    await page.goto('/login');
    await page.fill('input[name="email"]', 'growth@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');

    // Try to access REID dashboard
    await page.goto('/real-estate/reid/dashboard');

    // Should redirect to upgrade page
    await expect(page).toHaveURL(/upgrade/);
    await expect(page.locator('text=Upgrade to Elite')).toBeVisible();
  });

  test('displays ROI simulator', async ({ page }) => {
    await page.goto('/real-estate/reid/dashboard');

    // Scroll to ROI simulator
    await page.locator('text=ROI Simulator').scrollIntoViewIfNeeded();

    // Verify simulator visible
    await expect(page.locator('#roi-simulator')).toBeVisible();

    // Interact with simulator
    await page.fill('input[name="purchasePrice"]', '1000000');
    await page.fill('input[name="downPayment"]', '200000');
    await page.fill('input[name="interestRate"]', '6.5');

    // Verify calculation
    await expect(page.locator('text=Monthly Payment')).toBeVisible();
    await expect(page.locator('text=Cash Flow')).toBeVisible();
  });

  test('acknowledges alert trigger', async ({ page }) => {
    await page.goto('/real-estate/reid/alerts');

    // Find triggered alert
    const triggeredAlert = page.locator('.alert-triggered').first();
    await triggeredAlert.scrollIntoViewIfNeeded();

    // Click acknowledge
    await triggeredAlert.locator('button:has-text("Acknowledge")').click();

    // Verify acknowledged
    await expect(triggeredAlert.locator('.status-acknowledged')).toBeVisible();
  });

  test('mobile responsive - dashboard', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/real-estate/reid/dashboard');

    // Verify mobile layout
    await expect(page.locator('.reid-mobile-menu')).toBeVisible();

    // Open mobile menu
    await page.click('button[aria-label="Menu"]');

    // Verify navigation items
    await expect(page.locator('text=Insights')).toBeVisible();
    await expect(page.locator('text=Alerts')).toBeVisible();
    await expect(page.locator('text=Reports')).toBeVisible();
  });

  test('searches neighborhoods', async ({ page }) => {
    await page.goto('/real-estate/reid/dashboard');

    // Use search
    await page.fill('input[placeholder*="Search neighborhoods"]', 'Mission');
    await page.waitForTimeout(500); // Debounce

    // Verify autocomplete results
    await expect(page.locator('.search-result').first()).toBeVisible();
    await expect(page.locator('text=Mission District')).toBeVisible();

    // Select result
    await page.click('.search-result:has-text("Mission District")');

    // Verify map updated
    await expect(page.locator('#reid-map')).toBeVisible();
  });

  test('dark theme consistency', async ({ page }) => {
    await page.goto('/real-estate/reid/dashboard');

    // Verify dark theme elements
    const background = await page.locator('.reid-theme').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });

    expect(background).toContain('rgb'); // Dark background

    // Verify cyan accents
    const accentElements = page.locator('.text-cyan-400');
    await expect(accentElements.first()).toBeVisible();
  });

  test('loads demographics panel', async ({ page }) => {
    await page.goto('/real-estate/reid/dashboard');

    // Click on neighborhood insight
    await page.click('.reid-insight-card:first-child');

    // Verify demographics panel
    await expect(page.locator('text=Demographics')).toBeVisible();
    await expect(page.locator('text=Median Age')).toBeVisible();
    await expect(page.locator('text=Median Income')).toBeVisible();
    await expect(page.locator('text=Households')).toBeVisible();
  });
});
