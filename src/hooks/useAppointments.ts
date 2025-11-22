import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Appointment {
  id: string;
  title: string;
  description?: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  appointment_date: string;
  appointment_time: string;
  duration_minutes: number;
  status: string;
  property_id?: string;
  vendor_id?: string;
  maintenance_request_id?: string;
  location?: string;
  notes?: string;
  reminder_sent: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Related data
  properties?: { name: string; address: string };
  vendors?: { name: string; specialization: string[] };
}

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('appointments-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'appointments' },
        () => {
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchAppointments = async () => {
    try {
      // استخدام الجدول الأساسي مباشرة
      const { data, error} = await supabase
        .from('appointments')
        .select(`
          *,
          properties:property_id(name, address),
          vendors:vendor_id(name, specialization)
        `)
        .order('appointment_date', { ascending: true })
        .order('appointment_time', { ascending: true });

      if (error) throw error;
      setAppointments((data || []) as Appointment[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const addAppointment = async (appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at' | 'properties' | 'vendors'>) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'خطأ في إضافة الموعد' };
    }
  };

  const updateAppointment = async (id: string, updates: Partial<Appointment>) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'خطأ في تحديث الموعد' };
    }
  };

  return { appointments, loading, error, addAppointment, updateAppointment, refetch: fetchAppointments };
};
