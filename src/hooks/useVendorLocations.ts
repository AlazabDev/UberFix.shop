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
      
      // جلب مواقع الموردين مع تفاصيل الموردين
      const { data: vendorLocData, error: locError } = await supabase
        .from('vendor_locations')
        .select('*')
        .eq('is_active', true);

      if (locError) throw locError;

      if (!vendorLocData || vendorLocData.length === 0) {
        setLocations([]);
        setError(null);
        return;
      }

      // جلب تفاصيل الموردين
      const vendorIds = vendorLocData.map(loc => loc.vendor_id);
      const { data: vendorsData, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .in('id', vendorIds)
        .eq('status', 'active');

      if (vendorError) throw vendorError;

      // دمج البيانات
      const combinedData: VendorLocation[] = [];
      
      for (const loc of vendorLocData) {
        const vendor = vendorsData?.find(v => v.id === loc.vendor_id);
        if (!vendor) continue;
        
        // تصفية حسب نوع الخدمة إذا كان محدد
        if (serviceType && vendor.specialization) {
          if (!vendor.specialization.includes(serviceType)) {
            continue;
          }
        }

        combinedData.push({
          id: loc.id,
          vendor_id: loc.vendor_id,
          latitude: loc.latitude,
          longitude: loc.longitude,
          address: loc.address,
          is_active: loc.is_active,
          vendor: {
            id: vendor.id,
            name: vendor.name,
            company_name: vendor.company_name,
            specialization: vendor.specialization,
            phone: vendor.phone,
            email: vendor.email,
            rating: vendor.rating,
            profile_image: vendor.profile_image
          }
        });
      }

      setLocations(combinedData);
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
