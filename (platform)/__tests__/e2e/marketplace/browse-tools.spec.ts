import { test, expect } from '@playwright/test';

/**
 * E2E Test: Browse Marketplace Tools
 * Tests marketplace browsing, filtering, and search functionality
 */

test.describe('Marketplace - Browse Tools', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to marketplace
    await page.goto('/real-estate/marketplace');

    // Wait for marketplace to load
    await page.waitForSelector('[data-testid="marketplace-tools-grid"]', { timeout: 10000 });
  });

  test('should display marketplace tools grid', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/Marketplace/i);

    // Check for tools grid
    const toolsGrid = page.locator('[data-testid="marketplace-tools-grid"]');
    await expect(toolsGrid).toBeVisible();

    // Check for at least one tool card
    const toolCards = page.locator('[data-testid="tool-card"]');
    await expect(toolCards.first()).toBeVisible();
  });

  test('should filter tools by category', async ({ page }) => {
    // Click category filter
    const categoryFilter = page.locator('[data-testid="filter-category"]');
    await categoryFilter.click();

    // Select CRM category
    await page.locator('[data-testid="category-option-CRM"]').click();

    // Wait for filtered results
    await page.waitForTimeout(500);

    // Verify only CRM tools are shown
    const toolCards = page.locator('[data-testid="tool-card"]');
    const count = await toolCards.count();

    expect(count).toBeGreaterThan(0);

    // Check each tool has CRM badge
    for (let i = 0; i < count; i++) {
      const categoryBadge = toolCards.nth(i).locator('[data-testid="tool-category"]');
      await expect(categoryBadge).toHaveText(/CRM/i);
    }
  });

  test('should filter tools by tier', async ({ page }) => {
    // Click tier filter
    const tierFilter = page.locator('[data-testid="filter-tier"]');
    await tierFilter.click();

    // Select ELITE tier
    await page.locator('[data-testid="tier-option-ELITE"]').click();

    // Wait for filtered results
    await page.waitForTimeout(500);

    // Verify ELITE tools are shown
    const toolCards = page.locator('[data-testid="tool-card"]');
    const count = await toolCards.count();

    expect(count).toBeGreaterThan(0);

    // Check each tool has ELITE tier
    for (let i = 0; i < count; i++) {
      const tierBadge = toolCards.nth(i).locator('[data-testid="tool-tier"]');
      await expect(tierBadge).toHaveText(/ELITE/i);
    }
  });

  test('should search tools by name', async ({ page }) => {
    // Type in search box
    const searchInput = page.locator('[data-testid="search-tools"]');
    await searchInput.fill('CRM');

    // Wait for search results
    await page.waitForTimeout(500);

    // Verify filtered results
    const toolCards = page.locator('[data-testid="tool-card"]');
    const count = await toolCards.count();

    expect(count).toBeGreaterThan(0);

    // Check each tool name contains search term
    for (let i = 0; i < count; i++) {
      const toolName = toolCards.nth(i).locator('[data-testid="tool-name"]');
      const text = await toolName.textContent();
      expect(text?.toLowerCase()).toContain('crm');
    }
  });

  test('should filter by price range', async ({ page }) => {
    // Set price range
    const minPriceInput = page.locator('[data-testid="filter-price-min"]');
    const maxPriceInput = page.locator('[data-testid="filter-price-max"]');

    await minPriceInput.fill('50');
    await maxPriceInput.fill('150');

    // Apply filter
    await page.locator('[data-testid="apply-price-filter"]').click();

    // Wait for filtered results
    await page.waitForTimeout(500);

    // Verify price range
    const toolCards = page.locator('[data-testid="tool-card"]');
    const count = await toolCards.count();

    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const priceText = await toolCards.nth(i).locator('[data-testid="tool-price"]').textContent();
        const price = parseFloat(priceText?.replace(/[^0-9.]/g, '') || '0');

        expect(price).toBeGreaterThanOrEqual(50);
        expect(price).toBeLessThanOrEqual(150);
      }
    }
  });

  test('should sort tools by popularity', async ({ page }) => {
    // Click sort dropdown
    const sortDropdown = page.locator('[data-testid="sort-tools"]');
    await sortDropdown.click();

    // Select "Most Popular"
    await page.locator('[data-testid="sort-option-popular"]').click();

    // Wait for sorted results
    await page.waitForTimeout(500);

    // Verify tools exist
    const toolCards = page.locator('[data-testid="tool-card"]');
    await expect(toolCards.first()).toBeVisible();
  });

  test('should open tool detail page', async ({ page }) => {
    // Click first tool card
    const firstTool = page.locator('[data-testid="tool-card"]').first();
    await firstTool.click();

    // Wait for navigation
    await page.waitForURL(/\/real-estate\/marketplace\/tools\/.+/);

    // Verify tool detail page
    await expect(page.locator('[data-testid="tool-detail"]')).toBeVisible();
    await expect(page.locator('[data-testid="tool-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="tool-description"]')).toBeVisible();
    await expect(page.locator('[data-testid="tool-price"]')).toBeVisible();
  });

  test('should show tool reviews', async ({ page }) => {
    // Click first tool
    const firstTool = page.locator('[data-testid="tool-card"]').first();
    await firstTool.click();

    // Wait for detail page
    await page.waitForURL(/\/real-estate\/marketplace\/tools\/.+/);

    // Check for reviews section
    const reviewsSection = page.locator('[data-testid="tool-reviews"]');
    await expect(reviewsSection).toBeVisible();

    // Check rating display
    const rating = page.locator('[data-testid="tool-rating"]');
    await expect(rating).toBeVisible();
  });

  test('should show empty state when no results', async ({ page }) => {
    // Search for non-existent tool
    const searchInput = page.locator('[data-testid="search-tools"]');
    await searchInput.fill('zzz-nonexistent-tool-xyz-123');

    // Wait for search
    await page.waitForTimeout(500);

    // Verify empty state
    const emptyState = page.locator('[data-testid="no-tools-found"]');
    await expect(emptyState).toBeVisible();
  });

  test('should navigate between marketplace tabs', async ({ page }) => {
    // Check current tab is "Browse Tools"
    const browseTab = page.locator('[data-testid="tab-browse-tools"]');
    await expect(browseTab).toHaveAttribute('aria-selected', 'true');

    // Click "Bundles" tab
    const bundlesTab = page.locator('[data-testid="tab-bundles"]');
    await bundlesTab.click();

    // Verify bundles are shown
    await expect(page.locator('[data-testid="bundles-grid"]')).toBeVisible();

    // Click "My Tools" tab
    const myToolsTab = page.locator('[data-testid="tab-my-tools"]');
    await myToolsTab.click();

    // Verify purchases are shown
    await expect(page.locator('[data-testid="my-tools-list"]')).toBeVisible();
  });

  test('should display tool statistics', async ({ page }) => {
    // Click first tool
    const firstTool = page.locator('[data-testid="tool-card"]').first();
    await firstTool.click();

    // Wait for detail page
    await page.waitForURL(/\/real-estate\/marketplace\/tools\/.+/);

    // Check statistics
    await expect(page.locator('[data-testid="purchase-count"]')).toBeVisible();
    await expect(page.locator('[data-testid="review-count"]')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Reload page
    await page.reload();

    // Verify mobile layout
    const toolsGrid = page.locator('[data-testid="marketplace-tools-grid"]');
    await expect(toolsGrid).toBeVisible();

    // Check tools stack vertically
    const toolCards = page.locator('[data-testid="tool-card"]');
    const firstCard = toolCards.first();
    const secondCard = toolCards.nth(1);

    if (await firstCard.isVisible() && await secondCard.isVisible()) {
      const firstBox = await firstCard.boundingBox();
      const secondBox = await secondCard.boundingBox();

      if (firstBox && secondBox) {
        // Cards should stack vertically (second card below first)
        expect(secondBox.y).toBeGreaterThan(firstBox.y);
      }
    }
  });
});
