/**
 * أنواع الصيانة الموحدة - المصدر الوحيد للحقيقة
 * يستورد من Supabase types ويوفر أنواع مساعدة للتطبيق
 */
import type { Database } from "@/integrations/supabase/types";

// === أنواع قاعدة البيانات ===

/** حالة الطلب في قاعدة البيانات (mr_status enum) */
export type MrStatus = Database["public"]["Enums"]["mr_status"];

/** صف طلب الصيانة الكامل من DB */
export type MaintenanceRequestRow = Database["public"]["Tables"]["maintenance_requests"]["Row"];

/** بيانات إدراج طلب صيانة */
export type MaintenanceRequestInsert = Database["public"]["Tables"]["maintenance_requests"]["Insert"];

/** بيانات تحديث طلب صيانة */
export type MaintenanceRequestUpdate = Database["public"]["Tables"]["maintenance_requests"]["Update"];

// === أنواع التطبيق ===

/** واجهة طلب الصيانة للاستخدام في المكونات */
export interface MaintenanceRequest {
  id: string;
  company_id: string;
  branch_id: string;
  asset_id?: string | null;
  category_id?: string | null;
  subcategory_id?: string | null;
  opened_by_role?: string | null;
  channel?: string | null;
  title: string;
  description?: string | null;
  priority?: string | null;
  sla_deadline?: string | null;
  status: MrStatus;
  created_at: string;
  created_by?: string | null;
  client_name?: string | null;
  client_phone?: string | null;
  client_email?: string | null;
  location?: string | null;
  service_type?: string | null;
  estimated_cost?: number | null;
  actual_cost?: number | null;
  rating?: number | null;
  workflow_stage?: string | null;
  sla_due_date?: string | null;
  assigned_vendor_id?: string | null;
  assigned_technician_id?: string | null;
  vendor_notes?: string | null;
  archived_at?: string | null;
  updated_at?: string | null;
  request_number?: string | null;
  property_id?: string | null;
  contract_id?: string | null;
  customer_notes?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  version: number;
  last_modified_by?: string | null;
  sla_accept_due?: string | null;
  sla_arrive_due?: string | null;
  sla_complete_due?: string | null;
}

/** خريطة إعدادات العرض */
export interface StatusDisplayConfig {
  label: string;
  color: string;
  bgColor: string;
}

/** أنواع الأولوية */
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
