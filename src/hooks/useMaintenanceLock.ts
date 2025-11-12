import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface MaintenanceLockStatus {
  isLocked: boolean;
  message: string | null;
}

export const useMaintenanceLock = () => {
  return useQuery({
    queryKey: ["maintenance-lock"],
    queryFn: async (): Promise<MaintenanceLockStatus> => {
      const { data, error } = await supabase
        .from("app_control")
        .select("is_locked, message")
        .eq("id", "global")
        .single();

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
    staleTime: 20000,
  });
};
