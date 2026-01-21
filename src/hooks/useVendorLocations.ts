import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface VendorLocation {
  id: string;
  vendor_id: string;
  latitude: number;
  longitude: number;
  address?: string;
  is_active: boolean;
  vendor?: {
    id: string;
    name: string;
    company_name?: string;
    specialization?: string[];
    phone?: string;
    email?: string;
    rating?: number;
    profile_image?: string;
  };
}

export const useVendorLocations = (serviceType?: string) => {
  const [locations, setLocations] = useState<VendorLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchVendorLocations();
  }, [serviceType]);

  const fetchVendorLocations = async () => {
    try {
      setLoading(true);

      // جلب مواقع الموردين بشكل آمن عبر Edge Function (يحترم الصلاحيات بدون تعريض PII)
      const { data, error: fnError } = await supabase.functions.invoke(
        'get-vendor-locations-public',
        { body: { serviceType } }
      );
      if (fnError) throw fnError;

      setLocations((data?.data || []) as VendorLocation[]);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل تحميل مواقع مزودي الخدمات';
      setError(message);
      console.error('Error fetching vendor locations:', err);
    } finally {
      setLoading(false);
    }
  };

  const findNearestVendors = async (
    latitude: number, 
    longitude: number, 
    maxDistance: number = 50 // بالكيلومتر
  ) => {
    try {
      const { data, error } = await supabase.rpc('find_nearest_vendor', {
        request_latitude: latitude,
        request_longitude: longitude,
        service_specialization: serviceType || null
      });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error finding nearest vendors:', err);
      toast({
        title: 'خطأ في البحث',
        description: 'فشل البحث عن أقرب مزودي الخدمات',
        variant: 'destructive'
      });
      return [];
    }
  };

  return {
    locations,
    loading,
    error,
    refetch: fetchVendorLocations,
    findNearestVendors
  };
};
