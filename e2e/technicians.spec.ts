import { test, expect } from '@playwright/test';

/**
 * Technicians Module E2E Tests
 * اختبارات شاملة لموديول الفنيين
 */

const TEST_TECHNICIAN = {
  email: 'test-technician@uberfix.shop',
  password: 'Test123456!',
  name: 'أحمد محمد',
  phone: '+201234567890',
  nationalId: '12345678901234',
  specialization: 'plumber',
};

test.describe('Technician Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/technicians/register');
  });

  test('should display registration form', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /تسجيل فني جديد/i })).toBeVisible();
    await expect(page.getByLabel(/الاسم الكامل/i)).toBeVisible();
    await expect(page.getByLabel(/رقم الهاتف/i)).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /إرسال الطلب/i });
    await submitButton.click();

    // Should show validation errors
    await expect(page.getByText(/يجب إدخال/i).first()).toBeVisible();
  });

  test('should submit registration successfully', async ({ page }) => {
    await page.getByLabel(/الاسم الكامل/i).fill(TEST_TECHNICIAN.name);
    await page.getByLabel(/رقم الهاتف/i).fill(TEST_TECHNICIAN.phone);
    await page.getByLabel(/الرقم القومي/i).fill(TEST_TECHNICIAN.nationalId);
    
    // Select specialization
    await page.getByLabel(/التخصص/i).click();
    await page.getByRole('option', { name: /سباكة/i }).click();

    await page.getByRole('button', { name: /إرسال الطلب/i }).click();

    // Should show success message
    await expect(page.getByText(/تم إرسال الطلب بنجاح/i)).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Technician Verification', () => {
  test('should display verification upload form', async ({ page }) => {
    await page.goto('/technicians/verification');
    
    await expect(page.getByRole('heading', { name: /التحقق من الهوية/i })).toBeVisible();
    await expect(page.getByText(/صورة البطاقة/i).first()).toBeVisible();
  });

  test('should validate file uploads', async ({ page }) => {
    await page.goto('/technicians/verification');
    
    const submitButton = page.getByRole('button', { name: /إرسال المستندات/i });
    
    // Button should be disabled without files
    await expect(submitButton).toBeDisabled();
  });
});

test.describe('Technician Agreement', () => {
  test('should display all policy sections', async ({ page }) => {
    await page.goto('/technicians/agreement');
    
    await expect(page.getByRole('heading', { name: /اتفاقية العمل/i })).toBeVisible();
    await expect(page.getByText(/سياسة الجودة/i)).toBeVisible();
    await expect(page.getByText(/سياسة السلوك/i)).toBeVisible();
    await expect(page.getByText(/سياسة الأسعار/i)).toBeVisible();
  });

  test('should require all policy acceptances', async ({ page }) => {
    await page.goto('/technicians/agreement');
    
    const submitButton = page.getByRole('button', { name: /التوقيع على الاتفاقية/i });
    
    // Button should be disabled until all policies accepted
    await expect(submitButton).toBeDisabled();
  });
});

test.describe('Technician Training', () => {
  test('should display training courses list', async ({ page }) => {
    await page.goto('/technicians/training');
    
    await expect(page.getByRole('heading', { name: /التدريب الأساسي/i })).toBeVisible();
    await expect(page.getByText(/استقبال الطلب/i)).toBeVisible();
  });

  test('should show progress indicator', async ({ page }) => {
    await page.goto('/technicians/training');
    
    // Progress bar should be visible
    const progressBar = page.locator('[role="progressbar"]');
    await expect(progressBar).toBeVisible();
  });

  test('should lock courses in sequence', async ({ page }) => {
    await page.goto('/technicians/training');
    
    // First course should be unlocked
    const firstCourse = page.getByRole('button', { name: /ابدأ الآن/i }).first();
    await expect(firstCourse).toBeEnabled();
  });
});

test.describe('Technician Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Assume logged in as technician
    await page.goto('/technicians/dashboard');
  });

  test('should display performance metrics', async ({ page }) => {
    await expect(page.getByText(/الأداء الإجمالي/i)).toBeVisible();
    await expect(page.getByText(/المستوى الحالي/i)).toBeVisible();
  });

  test('should show badges section', async ({ page }) => {
    await expect(page.getByText(/الشارات/i)).toBeVisible();
  });

  test('should display recent tasks', async ({ page }) => {
    await expect(page.getByText(/المهام الأخيرة/i)).toBeVisible();
  });
});

test.describe('Task Management', () => {
  test('should display tasks with tabs', async ({ page }) => {
    await page.goto('/technicians/tasks');
    
    await expect(page.getByRole('tab', { name: /النشطة/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /المعلقة/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /المكتملة/i })).toBeVisible();
  });

  test('should allow check-in for accepted tasks', async ({ page }) => {
    await page.goto('/technicians/tasks');
    
    // Click on Active tab
    await page.getByRole('tab', { name: /النشطة/i }).click();
    
    // Should show check-in buttons for accepted tasks
    const checkInButton = page.getByRole('button', { name: /تسجيل الوصول/i }).first();
    if (await checkInButton.isVisible()) {
      await expect(checkInButton).toBeEnabled();
    }
  });
});

test.describe('Hall of Excellence', () => {
  test('should display hall of excellence page', async ({ page }) => {
    await page.goto('/hall-of-excellence');
    
    await expect(page.getByRole('heading', { name: /قاعة الشرف/i })).toBeVisible();
  });

  test('should show featured achievements', async ({ page }) => {
    await page.goto('/hall-of-excellence');
    
    // Check for tabs
    await expect(page.getByRole('tab', { name: /المميزون/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /جميع الإنجازات/i })).toBeVisible();
  });

  test('should display achievement cards', async ({ page }) => {
    await page.goto('/hall-of-excellence');
    
    // Wait for data to load
    await page.waitForTimeout(2000);
    
    // Should show achievement cards or empty state
    const cards = page.locator('[class*="Card"]');
    await expect(cards.first()).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('should work on mobile devices', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/technicians/dashboard');
    
    await expect(page.getByText(/الأداء الإجمالي/i)).toBeVisible();
  });

  test('should work on tablets', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/technicians/dashboard');
    
    await expect(page.getByText(/الأداء الإجمالي/i)).toBeVisible();
  });
});
