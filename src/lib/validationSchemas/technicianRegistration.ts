import { z } from "zod";
import { emailSchema, egyptianPhoneSchema, nameSchema, addressSchema } from "../validationSchemas";

// Step 1: Basic Information
export const basicInfoSchema = z.object({
  company_name: z.string().trim().min(2, "اسم الشركة مطلوب").max(200, "اسم الشركة طويل جداً"),
  company_type: z.union([
    z.literal('individual'),
    z.literal('small_team'),
    z.literal('company')
  ], { errorMap: () => ({ message: "نوع الكيان مطلوب" }) }),
  full_name: nameSchema,
  email: emailSchema,
  phone: egyptianPhoneSchema,
  preferred_language: z.string().optional(),
});

// Step 2: Address
export const addressInfoSchema = z.object({
  service_email: emailSchema.optional(),
  contact_name: nameSchema.optional(),
  country: z.string().default('Egypt'),
  city_id: z.number().int().positive({ message: "المحافظة مطلوبة" }),
  district_id: z.number().int().positive({ message: "الحي مطلوب" }),
  street_address: addressSchema,
  building_no: z.string().optional(),
  floor: z.string().optional(),
  unit: z.string().optional(),
  landmark: z.string().optional(),
  accounting_name: z.string().optional(),
  accounting_email: emailSchema.optional(),
  accounting_phone: egyptianPhoneSchema.optional(),
});

// Step 3: Insurance
export const insuranceSchema = z.object({
  has_insurance: z.boolean(),
  insurance_company_name: z.string().optional(),
  policy_number: z.string().optional(),
  policy_expiry_date: z.string().optional(),
  insurance_notes: z.string().optional(),
});

// Step 4: Service Pricing
export const servicePriceSchema = z.object({
  service_id: z.number().int().positive(),
  standard_price: z.number().positive("السعر القياسي مطلوب"),
  emergency_price: z.number().positive().optional(),
  night_weekend_price: z.number().positive().optional(),
  min_job_value: z.number().positive().optional(),
  material_markup_percent: z.number().min(0).max(100).optional(),
});

export const ratesSchema = z.object({
  pricing_notes: z.string().optional(),
  services: z.array(servicePriceSchema).min(1, "يجب اختيار خدمة واحدة على الأقل"),
});

// Step 5: Trades
export const tradeSchema = z.object({
  category_id: z.number().int().positive(),
  years_of_experience: z.number().int().min(0).optional(),
  licenses_or_certifications: z.string().optional(),
  can_handle_heavy_projects: z.boolean().default(false),
});

export const tradesSchema = z.object({
  trades: z.array(tradeSchema).min(1, "يجب اختيار مجال عمل واحد على الأقل"),
});

// Step 6: Coverage
export const coverageAreaSchema = z.object({
  city_id: z.number().int().positive(),
  district_id: z.number().int().positive().optional(),
  radius_km: z.number().int().positive().optional(),
});

export const coverageSchema = z.object({
  coverage_areas: z.array(coverageAreaSchema).min(1, "يجب إضافة منطقة تغطية واحدة على الأقل"),
});

// Step 7: Extended Information
export const extendedInfoSchema = z.object({
  company_model: z.enum(['local_provider', 'third_party']).optional(),
  number_of_inhouse_technicians: z.number().int().min(0).optional(),
  number_of_office_staff: z.number().int().min(0).optional(),
  accepts_emergency_jobs: z.boolean().default(false),
  accepts_national_contracts: z.boolean().default(false),
  additional_notes: z.string().max(2000).optional(),
});

// Step 8: Documents
export const documentSchema = z.object({
  document_type: z.enum(['tax_card', 'commercial_registration', 'national_id', 'insurance_certificate', 'professional_license']),
  file_url: z.string().url("رابط الملف غير صحيح"),
  file_name: z.string(),
  file_size: z.number().optional(),
});

export const documentsSchema = z.object({
  documents: z.array(documentSchema).min(1, "يجب رفع مستند واحد على الأقل"),
});

// Step 9: Terms
export const termsSchema = z.object({
  agree_terms: z.boolean().refine(val => val === true, {
    message: "يجب الموافقة على الشروط والأحكام",
  }),
  agree_payment_terms: z.boolean().refine(val => val === true, {
    message: "يجب الموافقة على شروط الدفع",
  }),
});

// Complete registration schema
export const completeRegistrationSchema = basicInfoSchema
  .merge(addressInfoSchema)
  .merge(insuranceSchema)
  .merge(ratesSchema)
  .merge(tradesSchema)
  .merge(coverageSchema)
  .merge(extendedInfoSchema)
  .merge(documentsSchema)
  .merge(termsSchema);

export type BasicInfoFormData = z.infer<typeof basicInfoSchema>;
export type AddressInfoFormData = z.infer<typeof addressInfoSchema>;
export type InsuranceFormData = z.infer<typeof insuranceSchema>;
export type RatesFormData = z.infer<typeof ratesSchema>;
export type TradesFormData = z.infer<typeof tradesSchema>;
export type CoverageFormData = z.infer<typeof coverageSchema>;
export type ExtendedInfoFormData = z.infer<typeof extendedInfoSchema>;
export type DocumentsFormData = z.infer<typeof documentsSchema>;
export type TermsFormData = z.infer<typeof termsSchema>;
export type CompleteRegistrationFormData = z.infer<typeof completeRegistrationSchema>;
