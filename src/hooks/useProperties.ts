import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Property {
  id: string;
  name: string;
  code: string | null;
  type: string;
  status: string;
  address: string;
  city_id: number | null;
  district_id: number | null;
  latitude: number | null;
  longitude: number | null;
  area: number | null;
  rooms: number | null;
  bathrooms: number | null;
  floors: number | null;
  parking_spaces: number | null;
  description: string | null;
  images: string[] | null;
  icon_url: string | null;
  qr_code_data: string | null;
  qr_code_generated_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  last_modified_by: string | null;
  version: number;
}

export function useProperties() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setProperties(data || []);
      setError(null);
    } catch (err) {
      setError(err as Error);
      toast.error("فشل تحميل العقارات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();

    const subscription = supabase
      .channel("properties_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "properties" },
        () => {
          fetchProperties();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const addProperty = async (propertyData: Omit<Property, "id" | "created_at" | "updated_at" | "version">) => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .insert([propertyData])
        .select()
        .single();

      if (error) throw error;

      toast.success("تمت إضافة العقار بنجاح");
      await fetchProperties();
      return data;
    } catch (err) {
      toast.error("فشل إضافة العقار");
      throw err;
    }
  };

  const updateProperty = async (id: string, updates: Partial<Property>) => {
    try {
      const { data, error } = await supabase
        .from("properties")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      toast.success("تم تحديث العقار بنجاح");
      await fetchProperties();
      return data;
    } catch (err) {
      toast.error("فشل تحديث العقار");
      throw err;
    }
  };

  return {
    properties,
    loading,
    error,
    addProperty,
    updateProperty,
    refetch: fetchProperties,
  };
}
