import * as z from "zod";

export const propertyFormSchema = z.object({
  // Basic fields
  code: z.string().optional(),
  name: z.string().min(2, "يجب أن يكون الاسم 2 أحرف على الأقل"),
  category: z.enum(["residential", "commercial", "industrial"]),
  type: z.string().min(1, "نوع العقار مطلوب"),
  status: z.string().min(1, "حالة العقار مطلوبة"),
  address: z.string().min(5, "العنوان مطلوب"),
  city_id: z.number().optional(),
  district_id: z.number().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  description: z.string().optional(),
  manager_id: z.string().optional(),
  management_start_date: z.string().optional(),
  
  // Shared fields
  area: z.number().optional(),
  floors: z.number().optional(),
  parking_spaces: z.number().optional(),
  units_count: z.number().optional(),
  
  // Residential specific
  unit_type: z.string().optional(),
  rooms: z.number().optional(),
  bathrooms: z.number().optional(),
  
  // Commercial specific
  business_activity: z.string().optional(),
  opening_time: z.string().optional(),
  closing_time: z.string().optional(),
  sla_level: z.string().optional(),
  
  // Industrial specific
  industrial_activity: z.string().optional(),
  hazard_level: z.string().optional(),
  shift_pattern: z.string().optional(),
  production_lines: z.number().optional(),
  workers_count: z.number().optional(),
  
  // Contact info
  contact_name: z.string().optional(),
  contact_phone: z.string().optional(),
});

export type PropertyFormData = z.infer<typeof propertyFormSchema>;

export const categoryToType: Record<string, string> = {
  residential: "residential",
  commercial: "commercial", 
  industrial: "industrial",
};
