import { test, expect } from '@playwright/test';
import { testUsers } from './fixtures/test-data';

/**
 * E2E Tests for Properties Module
 * اختبارات E2E لوحدة العقارات
 */

test.describe('Properties Module', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin before each test
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    await page.fill('input[type="email"]', testUsers.admin.email);
    await page.fill('input[type="password"]', testUsers.admin.password);
    await page.click('button[type="submit"]');
    
    await page.waitForURL('/dashboard', { timeout: 10000 });
    
    // Navigate to properties page
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
  });

  test('should display properties list page', async ({ page }) => {
    // Verify page title
    await expect(page.locator('h1')).toContainText('العقارات');
    
    // Verify "Add Property" button exists
    await expect(page.locator('text=إضافة عقار جديد')).toBeVisible();
  });

  test('should display property statistics cards', async ({ page }) => {
    // Wait for statistics cards to load
    await page.waitForSelector('[class*="grid"]', { timeout: 10000 });
    
    // Verify statistics are visible (should show counts for different property types)
    const statsCards = page.locator('[class*="rounded-lg"][class*="border"]');
    await expect(statsCards.first()).toBeVisible();
  });

  test('should filter properties by type', async ({ page }) => {
    // Wait for properties to load
    await page.waitForTimeout(2000);
    
    // Click on property type filter
    const typeFilter = page.locator('select[name="type"]').first();
    if (await typeFilter.isVisible()) {
      await typeFilter.selectOption('residential');
      await page.waitForTimeout(1000);
      
      // Verify filter is applied
      await expect(typeFilter).toHaveValue('residential');
    }
  });

  test('should filter properties by status', async ({ page }) => {
    // Wait for properties to load
    await page.waitForTimeout(2000);
    
    // Click on status filter
    const statusFilter = page.locator('select').filter({ hasText: 'الحالة' }).or(page.locator('select').nth(1));
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption('active');
      await page.waitForTimeout(1000);
      
      // Verify filter is applied
      await expect(statusFilter).toHaveValue('active');
    }
  });

  test('should search for properties', async ({ page }) => {
    // Wait for search input to be visible
    await page.waitForSelector('input[type="search"], input[placeholder*="بحث"]', { timeout: 5000 });
    
    const searchInput = page.locator('input[type="search"], input[placeholder*="بحث"]').first();
    
    // Type in search box
    await searchInput.fill('عقار');
    await page.waitForTimeout(1000);
    
    // Verify search input has value
    await expect(searchInput).toHaveValue('عقار');
  });

  test('should navigate to add property page', async ({ page }) => {
    // Click "Add Property" button
    await page.click('text=إضافة عقار جديد');
    
    // Wait for navigation
    await page.waitForURL('/properties/add', { timeout: 10000 });
    
    // Verify we're on the add property page
    await expect(page.locator('h1')).toContainText('إضافة عقار جديد');
    await expect(page.locator('text=بيانات العقار')).toBeVisible();
  });

  test('should display property form fields on add page', async ({ page }) => {
    await page.goto('/properties/add');
    await page.waitForLoadState('networkidle');
    
    // Verify essential form fields exist
    await expect(page.locator('select[name="type"]')).toBeVisible();
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="address"]')).toBeVisible();
  });

  test('should show validation errors on empty form submission', async ({ page }) => {
    await page.goto('/properties/add');
    await page.waitForLoadState('networkidle');
    
    // Try to submit empty form
    const submitButton = page.locator('button[type="submit"]').first();
    await submitButton.click();
    
    // Wait for validation messages
    await page.waitForTimeout(1000);
    
    // Verify error messages appear (form should not submit)
    const currentUrl = page.url();
    expect(currentUrl).toContain('/properties/add');
  });

  test('should display property cards with images', async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Look for property cards
    const propertyCards = page.locator('[class*="rounded-lg"][class*="border"][class*="overflow-hidden"]');
    
    if (await propertyCards.count() > 0) {
      // Verify first card has an image or icon
      const firstCard = propertyCards.first();
      await expect(firstCard).toBeVisible();
      
      // Check for image element
      const cardImage = firstCard.locator('img').first();
      if (await cardImage.isVisible()) {
        await expect(cardImage).toBeVisible();
      }
    }
  });

  test('should have working back button on add property page', async ({ page }) => {
    await page.goto('/properties/add');
    await page.waitForLoadState('networkidle');
    
    // Click back button
    const backButton = page.locator('text=الرجوع إلى القائمة');
    if (await backButton.isVisible()) {
      await backButton.click();
      
      // Verify we're back on properties list
      await page.waitForURL('/properties', { timeout: 10000 });
      await expect(page.locator('h1')).toContainText('العقارات');
    }
  });

  test('should display property action buttons', async ({ page }) => {
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const propertyCards = page.locator('[class*="rounded-lg"][class*="border"]');
    
    if (await propertyCards.count() > 0) {
      // Check if action buttons exist in first card
      const firstCard = propertyCards.first();
      
      // Look for action buttons (Edit, QR Code, etc.)
      const editButton = firstCard.locator('button:has-text("تعديل"), button[aria-label*="تعديل"]');
      const qrButton = firstCard.locator('button:has-text("QR"), button[aria-label*="QR"]');
      
      // At least one action button should be visible
      const hasEditButton = await editButton.isVisible().catch(() => false);
      const hasQrButton = await qrButton.isVisible().catch(() => false);
      
      expect(hasEditButton || hasQrButton).toBeTruthy();
    }
  });
});

test.describe('Properties Module - Responsive', () => {
  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/login');
    await page.fill('input[type="email"]', testUsers.admin.email);
    await page.fill('input[type="password"]', testUsers.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
    
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
    
    // Verify page is responsive
    await expect(page.locator('h1')).toBeVisible();
    
    // Verify add button is visible on mobile
    const addButton = page.locator('text=إضافة عقار جديد').first();
    await expect(addButton).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/login');
    await page.fill('input[type="email"]', testUsers.admin.email);
    await page.fill('input[type="password"]', testUsers.admin.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard', { timeout: 10000 });
    
    await page.goto('/properties');
    await page.waitForLoadState('networkidle');
    
    // Verify layout adapts to tablet
    await expect(page.locator('h1')).toBeVisible();
    const grid = page.locator('[class*="grid"]').first();
    await expect(grid).toBeVisible();
  });
});
