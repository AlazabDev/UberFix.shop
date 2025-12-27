import jsPDF from 'jspdf';
import { TechnicianRegistrationData, ServicePrice, TechnicianTrade, CoverageArea, TechnicianDocument } from '@/types/technician-registration';

// Amiri Arabic font (base64 subset for basic Arabic support)
const ARABIC_FONT_URL = 'https://fonts.gstatic.com/s/amiri/v27/J7aRnpd8CGxBHqUp.ttf';

interface RegistrationPDFData {
  formData: Partial<TechnicianRegistrationData>;
  services?: ServicePrice[];
  trades?: TechnicianTrade[];
  coverageAreas?: CoverageArea[];
  documents?: TechnicianDocument[];
  cityName?: string;
  districtName?: string;
}

const companyTypeLabels: Record<string, string> = {
  individual: 'فرد',
  small_team: 'فريق صغير',
  company: 'شركة',
};

const documentTypeLabels: Record<string, string> = {
  tax_card: 'البطاقة الضريبية',
  commercial_registration: 'السجل التجاري',
  national_id: 'بطاقة الهوية',
  insurance_certificate: 'شهادة التأمين',
  professional_license: 'الرخصة المهنية',
};

export async function generateRegistrationPDF(data: RegistrationPDFData): Promise<void> {
  const { formData, services, trades, coverageAreas, documents, cityName, districtName } = data;
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Set up document
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);
  let y = margin;

  // Helper function to add new page if needed
  const checkPageBreak = (requiredHeight: number) => {
    if (y + requiredHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  // Helper to draw section header
  const drawSectionHeader = (title: string) => {
    checkPageBreak(15);
    doc.setFillColor(59, 130, 246); // Blue
    doc.rect(margin, y, contentWidth, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text(title, pageWidth - margin - 5, y + 5.5, { align: 'right' });
    doc.setTextColor(0, 0, 0);
    y += 12;
  };

  // Helper to add field row
  const addFieldRow = (label: string, value: string | undefined | null, isRTL: boolean = true) => {
    if (!value) return;
    checkPageBreak(8);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    
    if (isRTL) {
      doc.text(value, margin + 5, y + 4);
      doc.text(label + ':', pageWidth - margin - 5, y + 4, { align: 'right' });
    } else {
      doc.text(label + ':', margin + 5, y + 4);
      doc.text(value, pageWidth - margin - 5, y + 4, { align: 'right' });
    }
    
    doc.setDrawColor(230, 230, 230);
    doc.line(margin, y + 7, pageWidth - margin, y + 7);
    y += 10;
  };

  // Title
  doc.setFillColor(30, 58, 138); // Dark blue
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text('UberFix.shop', pageWidth / 2, 15, { align: 'center' });
  doc.setFontSize(14);
  doc.text('Technician Registration Form', pageWidth / 2, 25, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  y = 45;

  // Registration date
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  const dateStr = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(dateStr, pageWidth - margin, y, { align: 'right' });
  y += 10;

  // Section 1: Basic Information
  drawSectionHeader('Basic Information - البيانات الأساسية');
  addFieldRow('Company Name / اسم الشركة', formData.company_name);
  addFieldRow('Company Type / نوع الكيان', companyTypeLabels[formData.company_type || ''] || formData.company_type);
  addFieldRow('Full Name / الاسم الكامل', formData.full_name);
  addFieldRow('Email / البريد الإلكتروني', formData.email, false);
  addFieldRow('Phone / رقم الهاتف', formData.phone, false);
  addFieldRow('Preferred Language / اللغة المفضلة', formData.preferred_language === 'ar' ? 'العربية' : 'English');
  y += 5;

  // Section 2: Address
  drawSectionHeader('Address - العنوان');
  addFieldRow('Country / الدولة', formData.country);
  addFieldRow('City / المحافظة', cityName || `ID: ${formData.city_id}`);
  addFieldRow('District / الحي', districtName || `ID: ${formData.district_id}`);
  addFieldRow('Street Address / عنوان الشارع', formData.street_address);
  addFieldRow('Building No. / رقم المبنى', formData.building_no);
  addFieldRow('Floor / الطابق', formData.floor);
  addFieldRow('Unit / الوحدة', formData.unit);
  addFieldRow('Landmark / علامة مميزة', formData.landmark);
  y += 5;

  // Section 3: Contact Information
  if (formData.service_email || formData.contact_name || formData.accounting_name) {
    drawSectionHeader('Contact Information - معلومات الاتصال');
    addFieldRow('Service Email / بريد الخدمة', formData.service_email, false);
    addFieldRow('Contact Name / اسم جهة الاتصال', formData.contact_name);
    addFieldRow('Accounting Name / اسم المحاسب', formData.accounting_name);
    addFieldRow('Accounting Email / بريد المحاسب', formData.accounting_email, false);
    addFieldRow('Accounting Phone / هاتف المحاسب', formData.accounting_phone, false);
    y += 5;
  }

  // Section 4: Insurance
  drawSectionHeader('Insurance - التأمين');
  addFieldRow('Has Insurance / لديه تأمين', formData.has_insurance ? 'نعم' : 'لا');
  if (formData.has_insurance) {
    addFieldRow('Insurance Company / شركة التأمين', formData.insurance_company_name);
    addFieldRow('Policy Number / رقم الوثيقة', formData.policy_number);
    addFieldRow('Expiry Date / تاريخ الانتهاء', formData.policy_expiry_date);
    addFieldRow('Notes / ملاحظات', formData.insurance_notes);
  }
  y += 5;

  // Section 5: Services
  if (services && services.length > 0) {
    drawSectionHeader('Services & Pricing - الخدمات والأسعار');
    services.forEach((service, index) => {
      checkPageBreak(25);
      doc.setFontSize(10);
      doc.setTextColor(59, 130, 246);
      doc.text(`Service ${index + 1}: ${service.service_name || `ID: ${service.service_id}`}`, pageWidth - margin - 5, y, { align: 'right' });
      y += 6;
      doc.setTextColor(0, 0, 0);
      addFieldRow('Standard Price / السعر القياسي', `${service.standard_price} EGP`);
      if (service.emergency_price) addFieldRow('Emergency Price / سعر الطوارئ', `${service.emergency_price} EGP`);
      if (service.night_weekend_price) addFieldRow('Night/Weekend Price / سعر الليل/العطلة', `${service.night_weekend_price} EGP`);
      if (service.min_job_value) addFieldRow('Minimum Job Value / الحد الأدنى', `${service.min_job_value} EGP`);
      if (service.material_markup_percent) addFieldRow('Material Markup / هامش المواد', `${service.material_markup_percent}%`);
    });
    if (formData.pricing_notes) {
      addFieldRow('Pricing Notes / ملاحظات التسعير', formData.pricing_notes);
    }
    y += 5;
  }

  // Section 6: Trades
  if (trades && trades.length > 0) {
    drawSectionHeader('Trades & Expertise - المهن والخبرات');
    trades.forEach((trade, index) => {
      checkPageBreak(20);
      doc.setFontSize(10);
      doc.setTextColor(59, 130, 246);
      doc.text(`Trade ${index + 1}: ${trade.category_name || `Category ID: ${trade.category_id}`}`, pageWidth - margin - 5, y, { align: 'right' });
      y += 6;
      doc.setTextColor(0, 0, 0);
      if (trade.years_of_experience) addFieldRow('Years of Experience / سنوات الخبرة', `${trade.years_of_experience} years`);
      if (trade.licenses_or_certifications) addFieldRow('Licenses/Certifications / التراخيص', trade.licenses_or_certifications);
      addFieldRow('Heavy Projects / مشاريع كبيرة', trade.can_handle_heavy_projects ? 'Yes / نعم' : 'No / لا');
    });
    y += 5;
  }

  // Section 7: Coverage Areas
  if (coverageAreas && coverageAreas.length > 0) {
    drawSectionHeader('Coverage Areas - مناطق التغطية');
    coverageAreas.forEach((area, index) => {
      checkPageBreak(15);
      const areaName = area.city_name || `City ID: ${area.city_id}`;
      const districtInfo = area.district_name ? ` - ${area.district_name}` : '';
      const radiusInfo = area.radius_km ? ` (${area.radius_km} km radius)` : '';
      doc.setFontSize(10);
      doc.text(`${index + 1}. ${areaName}${districtInfo}${radiusInfo}`, pageWidth - margin - 5, y, { align: 'right' });
      y += 7;
    });
    y += 5;
  }

  // Section 8: Company Details
  drawSectionHeader('Company Details - تفاصيل الشركة');
  addFieldRow('Company Model / نموذج العمل', formData.company_model === 'local_provider' ? 'مقدم خدمة محلي' : 'طرف ثالث');
  if (formData.number_of_inhouse_technicians) {
    addFieldRow('In-house Technicians / الفنيون الداخليون', `${formData.number_of_inhouse_technicians}`);
  }
  if (formData.number_of_office_staff) {
    addFieldRow('Office Staff / موظفو المكتب', `${formData.number_of_office_staff}`);
  }
  addFieldRow('Emergency Jobs / أعمال الطوارئ', formData.accepts_emergency_jobs ? 'Yes / نعم' : 'No / لا');
  addFieldRow('National Contracts / عقود وطنية', formData.accepts_national_contracts ? 'Yes / نعم' : 'No / لا');
  if (formData.additional_notes) {
    addFieldRow('Additional Notes / ملاحظات إضافية', formData.additional_notes);
  }
  y += 5;

  // Section 9: Documents
  if (documents && documents.length > 0) {
    drawSectionHeader('Uploaded Documents - المستندات المرفوعة');
    documents.forEach((doc_item, index) => {
      checkPageBreak(10);
      const typeName = documentTypeLabels[doc_item.document_type] || doc_item.document_type;
      doc.setFontSize(10);
      doc.text(`${index + 1}. ${typeName}: ${doc_item.file_name}`, pageWidth - margin - 5, y, { align: 'right' });
      y += 7;
    });
    y += 5;
  }

  // Section 10: Terms
  drawSectionHeader('Terms & Agreements - الشروط والأحكام');
  addFieldRow('Terms Accepted / قبول الشروط', formData.agree_terms ? 'Yes / نعم' : 'No / لا');
  addFieldRow('Payment Terms Accepted / قبول شروط الدفع', formData.agree_payment_terms ? 'Yes / نعم' : 'No / لا');

  // Footer
  checkPageBreak(20);
  y = pageHeight - 25;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('This document is auto-generated by UberFix.shop registration system.', pageWidth / 2, y, { align: 'center' });
  y += 4;
  doc.text('هذا المستند تم إنشاؤه تلقائيًا بواسطة نظام تسجيل UberFix.shop', pageWidth / 2, y, { align: 'center' });

  // Generate filename
  const fileName = `technician_registration_${formData.company_name || 'form'}_${new Date().toISOString().slice(0, 10)}.pdf`;

  // Save the PDF
  doc.save(fileName);
}
