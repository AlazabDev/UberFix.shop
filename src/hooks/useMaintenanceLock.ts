import { useQuery } from "@tanstack/react-query";
import { supabase, supabaseReady } from "@/integrations/supabase/client";

interface MaintenanceLockStatus {
  isLocked: boolean;
  message: string | null;
}

export const useMaintenanceLock = () => {
  return useQuery({
    queryKey: ["maintenance-lock"],
    queryFn: async (): Promise<MaintenanceLockStatus> => {
      if (!supabaseReady) {
        console.warn("Supabase is not configured; skipping maintenance lock check.");
        return { isLocked: false, message: null };
      }

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
    staleTime: 20000,
  });
};
