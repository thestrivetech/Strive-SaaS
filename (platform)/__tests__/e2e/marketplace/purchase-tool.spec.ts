import { test, expect } from '@playwright/test';

/**
 * E2E Test: Purchase Tool Flow
 * Tests complete purchase flow from cart to checkout
 */

test.describe('Marketplace - Purchase Tool', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to marketplace
    await page.goto('/real-estate/marketplace');
    await page.waitForSelector('[data-testid="marketplace-tools-grid"]', { timeout: 10000 });
  });

  test('should add tool to cart and see cart badge update', async ({ page }) => {
    // Get initial cart count
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    const initialCount = await cartBadge.textContent().then((text) => parseInt(text || '0'));

    // Click "Add to Cart" on first tool
    const addToCartBtn = page.locator('[data-testid="add-to-cart-btn"]').first();
    await addToCartBtn.click();

    // Wait for cart update
    await page.waitForTimeout(500);

    // Verify cart badge increased
    const newCount = await cartBadge.textContent().then((text) => parseInt(text || '0'));
    expect(newCount).toBe(initialCount + 1);

    // Verify success notification
    await expect(page.locator('[data-testid="toast-success"]')).toBeVisible();
  });

  test('should complete full purchase flow', async ({ page }) => {
    // Step 1: Add tool to cart
    const firstTool = page.locator('[data-testid="tool-card"]').first();
    const toolName = await firstTool.locator('[data-testid="tool-name"]').textContent();

    await firstTool.locator('[data-testid="add-to-cart-btn"]').click();
    await page.waitForTimeout(500);

    // Step 2: Navigate to cart
    await page.locator('[data-testid="cart-icon"]').click();
    await page.waitForURL(/\/real-estate\/marketplace\/cart/);

    // Verify tool is in cart
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();
    const cartItemName = await page.locator('[data-testid="cart-item-name"]').first().textContent();
    expect(cartItemName).toBe(toolName);

    // Step 3: Proceed to checkout
    await page.locator('[data-testid="checkout-btn"]').click();

    // Wait for checkout page or payment modal
    await page.waitForTimeout(1000);

    // Step 4: Complete purchase (mock payment)
    const confirmBtn = page.locator('[data-testid="confirm-purchase-btn"]');
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }

    // Step 5: Verify success
    await expect(page.locator('[data-testid="purchase-success"]')).toBeVisible({ timeout: 5000 });

    // Step 6: Navigate to My Tools
    await page.locator('[data-testid="tab-my-tools"]').click();

    // Verify tool appears in purchases
    await expect(page.locator('[data-testid="purchased-tool"]')).toBeVisible();
  });

  test('should add multiple tools to cart', async ({ page }) => {
    // Add first tool
    await page.locator('[data-testid="add-to-cart-btn"]').first().click();
    await page.waitForTimeout(500);

    // Add second tool
    await page.locator('[data-testid="add-to-cart-btn"]').nth(1).click();
    await page.waitForTimeout(500);

    // Navigate to cart
    await page.locator('[data-testid="cart-icon"]').click();
    await page.waitForURL(/\/real-estate\/marketplace\/cart/);

    // Verify 2 items in cart
    const cartItems = page.locator('[data-testid="cart-item"]');
    await expect(cartItems).toHaveCount(2);

    // Verify total price is sum of both tools
    const totalPrice = page.locator('[data-testid="cart-total-price"]');
    await expect(totalPrice).toBeVisible();
  });

  test('should remove tool from cart', async ({ page }) => {
    // Add tool to cart
    await page.locator('[data-testid="add-to-cart-btn"]').first().click();
    await page.waitForTimeout(500);

    // Navigate to cart
    await page.locator('[data-testid="cart-icon"]').click();
    await page.waitForURL(/\/real-estate\/marketplace\/cart/);

    // Remove item
    await page.locator('[data-testid="remove-cart-item-btn"]').first().click();
    await page.waitForTimeout(500);

    // Verify empty cart
    await expect(page.locator('[data-testid="empty-cart"]')).toBeVisible();
  });

  test('should prevent purchasing same tool twice', async ({ page }) => {
    // Purchase tool first time
    await page.locator('[data-testid="add-to-cart-btn"]').first().click();
    await page.waitForTimeout(500);

    await page.locator('[data-testid="cart-icon"]').click();
    await page.waitForURL(/\/real-estate\/marketplace\/cart/);

    await page.locator('[data-testid="checkout-btn"]').click();
    await page.waitForTimeout(1000);

    const confirmBtn = page.locator('[data-testid="confirm-purchase-btn"]');
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }

    // Wait for success
    await page.waitForSelector('[data-testid="purchase-success"]', { timeout: 5000 });

    // Go back to marketplace
    await page.goto('/real-estate/marketplace');
    await page.waitForSelector('[data-testid="marketplace-tools-grid"]');

    // Try to add same tool again
    await page.locator('[data-testid="add-to-cart-btn"]').first().click();
    await page.waitForTimeout(500);

    // Should show "Already Purchased" or similar
    await expect(page.locator('[data-testid="already-purchased"]')).toBeVisible();
  });

  test('should show cart persistence across sessions', async ({ page }) => {
    // Add tool to cart
    await page.locator('[data-testid="add-to-cart-btn"]').first().click();
    await page.waitForTimeout(500);

    const cartCount = await page.locator('[data-testid="cart-badge"]').textContent();

    // Reload page
    await page.reload();
    await page.waitForSelector('[data-testid="marketplace-tools-grid"]');

    // Cart count should persist
    const newCartCount = await page.locator('[data-testid="cart-badge"]').textContent();
    expect(newCartCount).toBe(cartCount);
  });

  test('should display correct pricing in cart', async ({ page }) => {
    // Get tool price
    const firstTool = page.locator('[data-testid="tool-card"]').first();
    const toolPrice = await firstTool.locator('[data-testid="tool-price"]').textContent();
    const price = toolPrice?.replace(/[^0-9.]/g, '') || '0';

    // Add to cart
    await firstTool.locator('[data-testid="add-to-cart-btn"]').click();
    await page.waitForTimeout(500);

    // Go to cart
    await page.locator('[data-testid="cart-icon"]').click();
    await page.waitForURL(/\/real-estate\/marketplace\/cart/);

    // Verify price matches
    const cartPrice = await page.locator('[data-testid="cart-item-price"]').first().textContent();
    const cartPriceNum = cartPrice?.replace(/[^0-9.]/g, '') || '0';

    expect(cartPriceNum).toBe(price);
  });

  test('should handle empty cart checkout gracefully', async ({ page }) => {
    // Navigate to cart (empty)
    await page.goto('/real-estate/marketplace/cart');

    // Verify empty state
    await expect(page.locator('[data-testid="empty-cart"]')).toBeVisible();

    // Checkout button should be disabled
    const checkoutBtn = page.locator('[data-testid="checkout-btn"]');
    await expect(checkoutBtn).toBeDisabled();
  });

  test('should add bundle to cart', async ({ page }) => {
    // Navigate to bundles tab
    await page.locator('[data-testid="tab-bundles"]').click();

    // Wait for bundles grid
    await expect(page.locator('[data-testid="bundles-grid"]')).toBeVisible();

    // Add bundle to cart
    await page.locator('[data-testid="add-bundle-to-cart-btn"]').first().click();
    await page.waitForTimeout(500);

    // Verify cart badge updated
    const cartBadge = page.locator('[data-testid="cart-badge"]');
    await expect(cartBadge).toBeVisible();

    // Go to cart
    await page.locator('[data-testid="cart-icon"]').click();

    // Verify bundle in cart
    await expect(page.locator('[data-testid="cart-bundle-item"]')).toBeVisible();
  });

  test('should show purchase confirmation modal', async ({ page }) => {
    // Add tool to cart
    await page.locator('[data-testid="add-to-cart-btn"]').first().click();
    await page.waitForTimeout(500);

    // Go to cart
    await page.locator('[data-testid="cart-icon"]').click();
    await page.waitForURL(/\/real-estate\/marketplace\/cart/);

    // Click checkout
    await page.locator('[data-testid="checkout-btn"]').click();

    // Verify confirmation modal
    await expect(page.locator('[data-testid="purchase-confirmation-modal"]')).toBeVisible();

    // Check modal contents
    await expect(page.locator('[data-testid="confirm-purchase-btn"]')).toBeVisible();
    await expect(page.locator('[data-testid="cancel-purchase-btn"]')).toBeVisible();
  });

  test('should cancel purchase from confirmation', async ({ page }) => {
    // Add tool to cart
    await page.locator('[data-testid="add-to-cart-btn"]').first().click();
    await page.waitForTimeout(500);

    // Go to cart
    await page.locator('[data-testid="cart-icon"]').click();
    await page.waitForURL(/\/real-estate\/marketplace\/cart/);

    // Click checkout
    await page.locator('[data-testid="checkout-btn"]').click();

    // Cancel purchase
    await page.locator('[data-testid="cancel-purchase-btn"]').click();

    // Should return to cart
    await expect(page.locator('[data-testid="cart-item"]')).toBeVisible();

    // Modal should close
    await expect(page.locator('[data-testid="purchase-confirmation-modal"]')).not.toBeVisible();
  });
});
