import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Technician {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  specialization: string;
  profile_image?: string | null;
  rating: number;
  total_reviews: number;
  status: 'online' | 'busy' | 'offline' | 'on_route';
  current_latitude?: number | null;
  current_longitude?: number | null;
  location_updated_at?: string | null;
  hourly_rate?: number | null;
  available_from?: string | null;
  available_to?: string | null;
  bio?: string | null;
  certifications?: any;
  service_area_radius?: number | null;
  is_active: boolean;
  is_verified: boolean;
}

export interface SpecializationIcon {
  id: string;
  name: string;
  name_ar: string;
  icon_path: string;
  color: string;
  sort_order: number;
}

export const useTechnicians = (filter?: { status?: string; specialization?: string }) => {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [specializationIcons, setSpecializationIcons] = useState<SpecializationIcon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();
  const supabaseClient = supabase as unknown as { from: typeof supabase.from };

  // استخراج القيم من filter لتجنب infinite loop
  const filterStatus = filter?.status;
  const filterSpecialization = filter?.specialization;

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabaseClient
        .from('technicians')
        .select('*')
        .eq('is_active', true);

      if (filterStatus) {
        query = query.eq('status', filterStatus);
      }

      if (filterSpecialization) {
        query = query.eq('specialization', filterSpecialization);
      }

      const { data, error: dbError } = await query.order('rating', { ascending: false });

      if (dbError) throw dbError;
      setTechnicians((data as Technician[] | null) ?? []);
    } catch (err: unknown) {
      console.error('Error fetching technicians:', err);
      setError(err instanceof Error ? err : new Error('Unexpected error'));
      setTechnicians([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecializationIcons = async () => {
    try {
      const { data, error: dbError } = await supabaseClient
        .from('specialization_icons')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (dbError) throw dbError;
      setSpecializationIcons((data as SpecializationIcon[] | null) ?? []);
    } catch (err: unknown) {
      console.error('Error fetching specialization icons:', err);
    }
  };

  useEffect(() => {
    fetchTechnicians();
    fetchSpecializationIcons();

    // إضافة realtime subscription
    const channel = supabase
      .channel('technicians-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'technicians' },
        () => {
          fetchTechnicians();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filterStatus, filterSpecialization]);

  return {
    technicians,
    specializationIcons,
    loading,
    error,
    refetch: fetchTechnicians,
  };
};
