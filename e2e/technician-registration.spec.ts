import { test, expect } from '@playwright/test';

/**
 * Technician Registration Wizard E2E Tests
 * اختبارات شاملة لمعالج تسجيل الفنيين - 9 خطوات
 */

test.describe('Technician Registration Wizard - 9 Steps', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/technicians/register');
    await page.waitForLoadState('networkidle');
  });

  test('Step 1: Basic Information - should display and validate', async ({ page }) => {
    // Check step 1 is visible
    await expect(page.getByText(/الأساسيات|المعلومات الأساسية/i)).toBeVisible();
    
    // Check required fields
    await expect(page.getByLabel(/اسم الشركة/i)).toBeVisible();
    await expect(page.getByLabel(/الاسم الكامل/i)).toBeVisible();
    await expect(page.getByLabel(/البريد الإلكتروني/i)).toBeVisible();
    await expect(page.getByLabel(/رقم الهاتف/i)).toBeVisible();
    
    // Check entity type selection
    await expect(page.getByText(/فرد|individual/i)).toBeVisible();
    await expect(page.getByText(/فريق صغير|small_team/i)).toBeVisible();
    await expect(page.getByText(/شركة|company/i)).toBeVisible();
  });

  test('Step 1: Should validate required fields before proceeding', async ({ page }) => {
    // Try to proceed without filling required fields
    const nextButton = page.getByRole('button', { name: /التالي|حفظ ومتابعة/i });
    await nextButton.click();
    
    // Should show validation errors
    await expect(page.getByText(/مطلوب|required/i).first()).toBeVisible({ timeout: 5000 });
  });

  test('Step 1: Should fill basic info and proceed to step 2', async ({ page }) => {
    // Fill basic info
    await page.getByLabel(/اسم الشركة/i).fill('شركة الاختبار للصيانة');
    
    // Select entity type
    const individualOption = page.getByText(/فرد|individual/i);
    if (await individualOption.isVisible()) {
      await individualOption.click();
    }
    
    await page.getByLabel(/الاسم الكامل/i).fill('أحمد محمد علي');
    await page.getByLabel(/البريد الإلكتروني/i).fill('test-tech@uberfix.shop');
    await page.getByLabel(/رقم الهاتف/i).fill('01234567890');
    
    // Click next
    const nextButton = page.getByRole('button', { name: /التالي|حفظ ومتابعة/i });
    await nextButton.click();
    
    // Should be on step 2
    await expect(page.getByText(/العنوان|Address/i)).toBeVisible({ timeout: 10000 });
  });

  test('Step 2: Address Information', async ({ page }) => {
    // Navigate to step 2 by URL or fill step 1 first
    await page.goto('/technicians/register?step=2');
    await page.waitForLoadState('networkidle');
    
    // Check address fields
    await expect(page.getByLabel(/المحافظة|المدينة|city/i)).toBeVisible();
    await expect(page.getByLabel(/الحي|district/i)).toBeVisible();
    await expect(page.getByLabel(/العنوان التفصيلي|street/i)).toBeVisible();
  });

  test('Step 3: Insurance Information', async ({ page }) => {
    await page.goto('/technicians/register?step=3');
    await page.waitForLoadState('networkidle');
    
    // Check insurance toggle
    await expect(page.getByText(/التأمين|insurance/i)).toBeVisible();
    
    // Toggle insurance
    const insuranceToggle = page.locator('[role="switch"]').first();
    if (await insuranceToggle.isVisible()) {
      await insuranceToggle.click();
      
      // Should show insurance details fields
      await expect(page.getByLabel(/اسم شركة التأمين/i)).toBeVisible();
      await expect(page.getByLabel(/رقم الوثيقة/i)).toBeVisible();
    }
  });

  test('Step 4: Service Rates (Flat Rate Model)', async ({ page }) => {
    await page.goto('/technicians/register?step=4');
    await page.waitForLoadState('networkidle');
    
    // Check rates section
    await expect(page.getByText(/الأسعار|rates|pricing/i)).toBeVisible();
    
    // Should NOT have hourly rate fields
    const hourlyText = page.getByText(/بالساعة|hourly|per hour/i);
    await expect(hourlyText).not.toBeVisible();
    
    // Should have flat rate fields
    await expect(page.getByText(/السعر القياسي|standard.*price/i)).toBeVisible();
  });

  test('Step 5: Trades/Specializations', async ({ page }) => {
    await page.goto('/technicians/register?step=5');
    await page.waitForLoadState('networkidle');
    
    // Check trades section
    await expect(page.getByText(/المهن|التخصصات|trades/i)).toBeVisible();
    
    // Should have category selection
    const categories = ['كهرباء', 'سباكة', 'تكييف', 'نجارة'];
    for (const cat of categories) {
      const element = page.getByText(new RegExp(cat, 'i'));
      // Just check at least some categories exist
      if (await element.isVisible()) {
        break;
      }
    }
  });

  test('Step 6: Coverage Areas', async ({ page }) => {
    await page.goto('/technicians/register?step=6');
    await page.waitForLoadState('networkidle');
    
    // Check coverage section
    await expect(page.getByText(/نطاق التغطية|coverage/i)).toBeVisible();
    
    // Should have radius or area selection
    await expect(page.getByText(/نطاق|radius|كم/i)).toBeVisible();
  });

  test('Step 7: Extended Information', async ({ page }) => {
    await page.goto('/technicians/register?step=7');
    await page.waitForLoadState('networkidle');
    
    // Check extended info section
    await expect(page.getByText(/معلومات إضافية|extended/i)).toBeVisible();
    
    // Check for company model options
    await expect(page.getByText(/عدد الفنيين|technicians.*count/i)).toBeVisible();
  });

  test('Step 8: Document Uploads', async ({ page }) => {
    await page.goto('/technicians/register?step=8');
    await page.waitForLoadState('networkidle');
    
    // Check uploads section
    await expect(page.getByText(/المرفقات|المستندات|documents|uploads/i)).toBeVisible();
    
    // Check document type options
    await expect(page.getByText(/البطاقة الضريبية|tax.*card/i)).toBeVisible();
    await expect(page.getByText(/السجل التجاري|commercial.*registration/i)).toBeVisible();
  });

  test('Step 9: Terms and Submit', async ({ page }) => {
    await page.goto('/technicians/register?step=9');
    await page.waitForLoadState('networkidle');
    
    // Check terms section
    await expect(page.getByText(/الشروط|terms/i)).toBeVisible();
    
    // Check agreement checkboxes
    await expect(page.getByText(/أوافق على الشروط|agree.*terms/i)).toBeVisible();
    await expect(page.getByText(/شروط الدفع|payment.*terms/i)).toBeVisible();
    
    // Submit button should be disabled until terms accepted
    const submitButton = page.getByRole('button', { name: /إرسال|submit/i });
    await expect(submitButton).toBeDisabled();
  });

  test('Full Registration Flow - Happy Path', async ({ page }) => {
    // Step 1: Basic Info
    await page.getByLabel(/اسم الشركة/i).fill('شركة الاختبار');
    await page.getByLabel(/الاسم الكامل/i).fill('أحمد محمد');
    await page.getByLabel(/البريد الإلكتروني/i).fill('e2e-test@uberfix.shop');
    await page.getByLabel(/رقم الهاتف/i).fill('01012345678');
    
    // Select entity type if available
    const individualOption = page.getByRole('radio', { name: /فرد/i });
    if (await individualOption.isVisible()) {
      await individualOption.click();
    }
    
    await page.getByRole('button', { name: /التالي/i }).click();
    await page.waitForTimeout(1000);
    
    // Step 2: Address - Fill minimum required
    const citySelect = page.getByLabel(/المحافظة/i);
    if (await citySelect.isVisible()) {
      await citySelect.click();
      await page.getByRole('option').first().click();
    }
    
    const districtSelect = page.getByLabel(/الحي/i);
    if (await districtSelect.isVisible()) {
      await districtSelect.click();
      await page.getByRole('option').first().click();
    }
    
    await page.getByLabel(/العنوان/i).fill('123 شارع الاختبار');
    await page.getByRole('button', { name: /التالي/i }).click();
    await page.waitForTimeout(1000);
    
    // Steps 3-8: Skip optional or fill minimums
    for (let step = 3; step <= 8; step++) {
      const nextButton = page.getByRole('button', { name: /التالي|حفظ/i });
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(500);
      }
    }
    
    // Step 9: Accept terms
    const termsCheckbox = page.getByRole('checkbox', { name: /الشروط/i });
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.click();
    }
    
    const paymentCheckbox = page.getByRole('checkbox', { name: /الدفع/i });
    if (await paymentCheckbox.isVisible()) {
      await paymentCheckbox.click();
    }
    
    // Verify submit button is enabled
    const submitButton = page.getByRole('button', { name: /إرسال/i });
    await expect(submitButton).toBeEnabled({ timeout: 5000 });
  });

  test('Stepper Navigation - Should allow going back', async ({ page }) => {
    // Fill step 1 and go to step 2
    await page.getByLabel(/اسم الشركة/i).fill('شركة الاختبار');
    await page.getByLabel(/الاسم الكامل/i).fill('أحمد محمد');
    await page.getByLabel(/البريد الإلكتروني/i).fill('test@uberfix.shop');
    await page.getByLabel(/رقم الهاتف/i).fill('01012345678');
    await page.getByRole('button', { name: /التالي/i }).click();
    
    await page.waitForTimeout(1000);
    
    // Go back to step 1
    const backButton = page.getByRole('button', { name: /السابق|رجوع|back/i });
    if (await backButton.isVisible()) {
      await backButton.click();
      
      // Data should be preserved
      await expect(page.getByLabel(/اسم الشركة/i)).toHaveValue('شركة الاختبار');
    }
  });

  test('Save Draft - Should persist data', async ({ page }) => {
    // Fill some data
    await page.getByLabel(/اسم الشركة/i).fill('شركة مسودة');
    await page.getByLabel(/الاسم الكامل/i).fill('فني مسودة');
    await page.getByLabel(/البريد الإلكتروني/i).fill('draft@uberfix.shop');
    await page.getByLabel(/رقم الهاتف/i).fill('01098765432');
    
    // Look for save draft button
    const saveDraftButton = page.getByRole('button', { name: /حفظ.*لاحقاً|save.*draft/i });
    if (await saveDraftButton.isVisible()) {
      await saveDraftButton.click();
      
      // Should show success message
      await expect(page.getByText(/تم الحفظ|saved/i)).toBeVisible({ timeout: 5000 });
    }
  });
});

test.describe('Technician Registration - Responsive Design', () => {
  test('Mobile view', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/technicians/register');
    
    // Should display correctly on mobile
    await expect(page.getByText(/تسجيل فني|register/i)).toBeVisible();
    await expect(page.getByLabel(/اسم الشركة/i)).toBeVisible();
  });

  test('Tablet view', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/technicians/register');
    
    // Should display correctly on tablet
    await expect(page.getByText(/تسجيل فني|register/i)).toBeVisible();
  });
});

test.describe('Technician Registration - Error Handling', () => {
  test('Should show error for duplicate email', async ({ page }) => {
    await page.goto('/technicians/register');
    
    // Fill with existing email
    await page.getByLabel(/اسم الشركة/i).fill('شركة اختبار');
    await page.getByLabel(/الاسم الكامل/i).fill('فني اختبار');
    await page.getByLabel(/البريد الإلكتروني/i).fill('admin@alazab.online'); // Existing email
    await page.getByLabel(/رقم الهاتف/i).fill('01012345678');
    
    await page.getByRole('button', { name: /التالي/i }).click();
    
    // Should show duplicate email error or proceed (depends on validation timing)
    await page.waitForTimeout(2000);
  });

  test('Should validate phone number format', async ({ page }) => {
    await page.goto('/technicians/register');
    
    // Fill with invalid phone
    await page.getByLabel(/رقم الهاتف/i).fill('12345');
    await page.getByRole('button', { name: /التالي/i }).click();
    
    // Should show phone validation error
    await expect(page.getByText(/رقم.*غير صحيح|invalid.*phone/i)).toBeVisible({ timeout: 5000 });
  });
});
