import jsPDF from 'jspdf';
import { TechnicianRegistrationData, ServicePrice, TechnicianTrade, CoverageArea, TechnicianDocument } from '@/types/technician-registration';

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
  individual: 'Individual / فرد',
  small_team: 'Small Team / فريق صغير',
  company: 'Company / شركة',
};

const documentTypeLabels: Record<string, string> = {
  tax_card: 'Tax Card',
  commercial_registration: 'Commercial Registration',
  national_id: 'National ID',
  insurance_certificate: 'Insurance Certificate',
  professional_license: 'Professional License',
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
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(title, pageWidth / 2, y + 5.5, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    y += 12;
  };

  // Helper to add field row (English only for proper rendering)
  const addFieldRow = (label: string, value: string | undefined | null) => {
    if (!value) return;
    checkPageBreak(8);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Label on left, value on right
    doc.setTextColor(80, 80, 80);
    doc.text(label + ':', margin + 5, y + 4);
    doc.setTextColor(0, 0, 0);
    doc.text(value, pageWidth - margin - 5, y + 4, { align: 'right' });
    
    doc.setDrawColor(230, 230, 230);
    doc.line(margin, y + 7, pageWidth - margin, y + 7);
    y += 10;
  };

  // Title
  doc.setFillColor(30, 58, 138); // Dark blue
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.text('UberFix.shop', pageWidth / 2, 15, { align: 'center' });
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Technician Registration Form', pageWidth / 2, 25, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  y = 45;

  // Registration date
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text('Generated: ' + dateStr, pageWidth - margin, y, { align: 'right' });
  y += 10;

  // Section 1: Basic Information
  drawSectionHeader('Basic Information');
  addFieldRow('Company Name', formData.company_name);
  addFieldRow('Company Type', companyTypeLabels[formData.company_type || ''] || formData.company_type);
  addFieldRow('Full Name', formData.full_name);
  addFieldRow('Email', formData.email);
  addFieldRow('Phone', formData.phone);
  addFieldRow('Preferred Language', formData.preferred_language === 'ar' ? 'Arabic' : 'English');
  y += 5;

  // Section 2: Address
  drawSectionHeader('Address');
  addFieldRow('Country', formData.country);
  addFieldRow('City', cityName || (formData.city_id ? `City ID: ${formData.city_id}` : undefined));
  addFieldRow('District', districtName || (formData.district_id ? `District ID: ${formData.district_id}` : undefined));
  addFieldRow('Street Address', formData.street_address);
  addFieldRow('Building No.', formData.building_no);
  addFieldRow('Floor', formData.floor);
  addFieldRow('Unit', formData.unit);
  addFieldRow('Landmark', formData.landmark);
  y += 5;

  // Section 3: Contact Information
  if (formData.service_email || formData.contact_name || formData.accounting_name) {
    drawSectionHeader('Contact Information');
    addFieldRow('Service Email', formData.service_email);
    addFieldRow('Contact Name', formData.contact_name);
    addFieldRow('Accounting Name', formData.accounting_name);
    addFieldRow('Accounting Email', formData.accounting_email);
    addFieldRow('Accounting Phone', formData.accounting_phone);
    y += 5;
  }

  // Section 4: Insurance
  drawSectionHeader('Insurance');
  addFieldRow('Has Insurance', formData.has_insurance ? 'Yes' : 'No');
  if (formData.has_insurance) {
    addFieldRow('Insurance Company', formData.insurance_company_name);
    addFieldRow('Policy Number', formData.policy_number);
    addFieldRow('Expiry Date', formData.policy_expiry_date);
    addFieldRow('Notes', formData.insurance_notes);
  }
  y += 5;

  // Section 5: Services
  if (services && services.length > 0) {
    drawSectionHeader('Services & Pricing');
    services.forEach((service, index) => {
      checkPageBreak(30);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.text(`Service ${index + 1}: ${service.service_name || `ID: ${service.service_id}`}`, margin + 5, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      addFieldRow('Standard Price', `${service.standard_price} EGP`);
      if (service.emergency_price) addFieldRow('Emergency Price', `${service.emergency_price} EGP`);
      if (service.night_weekend_price) addFieldRow('Night/Weekend Price', `${service.night_weekend_price} EGP`);
      if (service.min_job_value) addFieldRow('Minimum Job Value', `${service.min_job_value} EGP`);
      if (service.material_markup_percent) addFieldRow('Material Markup', `${service.material_markup_percent}%`);
    });
    if (formData.pricing_notes) {
      addFieldRow('Pricing Notes', formData.pricing_notes);
    }
    y += 5;
  }

  // Section 6: Trades
  if (trades && trades.length > 0) {
    drawSectionHeader('Trades & Expertise');
    trades.forEach((trade, index) => {
      checkPageBreak(25);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(59, 130, 246);
      doc.text(`Trade ${index + 1}: ${trade.category_name || `Category ID: ${trade.category_id}`}`, margin + 5, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      if (trade.years_of_experience) addFieldRow('Years of Experience', `${trade.years_of_experience} years`);
      if (trade.licenses_or_certifications) addFieldRow('Licenses/Certifications', trade.licenses_or_certifications);
      addFieldRow('Heavy Projects', trade.can_handle_heavy_projects ? 'Yes' : 'No');
    });
    y += 5;
  }

  // Section 7: Coverage Areas
  if (coverageAreas && coverageAreas.length > 0) {
    drawSectionHeader('Coverage Areas');
    coverageAreas.forEach((area, index) => {
      checkPageBreak(10);
      const areaName = area.city_name || `City ID: ${area.city_id}`;
      const districtInfo = area.district_name ? ` - ${area.district_name}` : '';
      const radiusInfo = area.radius_km ? ` (${area.radius_km} km radius)` : '';
      doc.setFontSize(10);
      doc.text(`${index + 1}. ${areaName}${districtInfo}${radiusInfo}`, margin + 5, y);
      y += 7;
    });
    y += 5;
  }

  // Section 8: Company Details
  drawSectionHeader('Company Details');
  addFieldRow('Company Model', formData.company_model === 'local_provider' ? 'Local Provider' : formData.company_model === 'third_party' ? 'Third Party' : undefined);
  if (formData.number_of_inhouse_technicians) {
    addFieldRow('In-house Technicians', `${formData.number_of_inhouse_technicians}`);
  }
  if (formData.number_of_office_staff) {
    addFieldRow('Office Staff', `${formData.number_of_office_staff}`);
  }
  addFieldRow('Emergency Jobs', formData.accepts_emergency_jobs ? 'Yes' : 'No');
  addFieldRow('National Contracts', formData.accepts_national_contracts ? 'Yes' : 'No');
  if (formData.additional_notes) {
    addFieldRow('Additional Notes', formData.additional_notes);
  }
  y += 5;

  // Section 9: Documents
  if (documents && documents.length > 0) {
    drawSectionHeader('Uploaded Documents');
    documents.forEach((doc_item, index) => {
      checkPageBreak(10);
      const typeName = documentTypeLabels[doc_item.document_type] || doc_item.document_type;
      doc.setFontSize(10);
      doc.text(`${index + 1}. ${typeName}: ${doc_item.file_name}`, margin + 5, y);
      y += 7;
    });
    y += 5;
  }

  // Section 10: Terms
  drawSectionHeader('Terms & Agreements');
  addFieldRow('Terms Accepted', formData.agree_terms ? 'Yes' : 'No');
  addFieldRow('Payment Terms Accepted', formData.agree_payment_terms ? 'Yes' : 'No');

  // Footer
  checkPageBreak(20);
  y = pageHeight - 20;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text('This document is auto-generated by UberFix.shop registration system.', pageWidth / 2, y, { align: 'center' });
  y += 4;
  doc.text('Please keep this document for your records.', pageWidth / 2, y, { align: 'center' });

  // Generate filename (use English only)
  const safeCompanyName = (formData.company_name || 'form').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
  const fileName = `technician_registration_${safeCompanyName}_${new Date().toISOString().slice(0, 10)}.pdf`;

  // Save the PDF
  doc.save(fileName);
}
