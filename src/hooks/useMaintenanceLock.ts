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
        return { isLocked: false, message: null };
      }

      try {
        // Use Promise.race with timeout to prevent hanging
        const queryPromise = supabase
          .from("app_control")
          .select("is_locked, message")
          .eq("id", "global")
          .maybeSingle();

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error("Timeout")), 3000);
        });

        const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

        if (error) {
          console.error("Maintenance lock check failed:", error.message);
          return { isLocked: false, message: null };
        }

        return {
          isLocked: data?.is_locked || false,
          message: data?.message || null,
        };
      } catch {
        // Timeout or network error - allow app to continue
        console.warn("Maintenance lock check timed out");
        return { isLocked: false, message: null };
      }
    },
    refetchInterval: 30000,
    staleTime: 20000,
    retry: false,
    gcTime: 60000,
  });
};
