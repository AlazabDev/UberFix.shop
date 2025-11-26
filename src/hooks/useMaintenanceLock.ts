import { useQuery } from "@tanstack/react-query";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";

interface MaintenanceLockStatus {
  isLocked: boolean;
  message: string | null;
}

export const useMaintenanceLock = () => {
  const shouldFetch = isSupabaseConfigured;

  return useQuery({
    queryKey: ["maintenance-lock"],
    enabled: shouldFetch,
    initialData: { isLocked: false, message: null },
    queryFn: async (): Promise<MaintenanceLockStatus> => {
      const { data, error } = await supabase
        .from("app_control")
        .select("is_locked, message")
        .eq("id", "global")
        .maybeSingle();

      if (error) {
        console.error("Error fetching maintenance lock status:", error);
        return { isLocked: false, message: null };
      }

      return {
        isLocked: data?.is_locked || false,
        message: data?.message || null,
      };
    },
    refetchInterval: 30000, // تحديث كل 30 ثانية
    staleTime: shouldFetch ? 20000 : Infinity,
  });
};
