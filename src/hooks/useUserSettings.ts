import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  position: string | null;
  department_id: string | null;
}

export interface UserPreferences {
  notifications_enabled: boolean;
  email_notifications: boolean;
}

export interface PlatformPermissions {
  user_id: string;
  can_choose_appointment_date: boolean;
  can_submit_without_manager_approval: boolean;
  can_view_financial_details: boolean;
  can_cancel_requests: boolean;
  can_reject_prices: boolean;
  can_create_properties: boolean;
}

export const useUserSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        const { data: newProfile, error: createError } = await supabase
          .from("profiles")
          .insert({
            id: user.id,
            name: user.user_metadata?.name || "",
            email: user.email || "",
            role: "customer",
            first_name: user.user_metadata?.first_name || "",
            last_name: user.user_metadata?.last_name || ""
          })
          .select()
          .single();
        
        if (createError) throw createError;
        return newProfile as UserProfile;
      }
      
      return data as UserProfile;
    },
  });

  // Simple preferences (not from DB)
  const preferences: UserPreferences = {
    notifications_enabled: true,
    email_notifications: true
  };

  // Fetch platform permissions based on user role
  const { data: permissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ["platform-permissions"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      const role = roleData?.role || 'customer';
      const isAdmin = role === 'admin' || role === 'manager';
      
      const defaultPermissions: PlatformPermissions = {
        user_id: user.id,
        can_choose_appointment_date: true,
        can_submit_without_manager_approval: isAdmin,
        can_view_financial_details: isAdmin,
        can_cancel_requests: isAdmin,
        can_reject_prices: isAdmin,
        can_create_properties: isAdmin
      };
      
      return defaultPermissions;
    },
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<UserProfile>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      toast({
        title: "تم التحديث بنجاح",
        description: "تم تحديث بيانات الملف الشخصي",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async ({ newPassword }: { newPassword: string }) => {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "تم التحديث",
        description: "تم تغيير كلمة المرور بنجاح",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "خطأ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    profile,
    preferences,
    permissions,
    isLoading: profileLoading || permissionsLoading,
    updateProfile: updateProfileMutation.mutate,
    updatePreferences: () => {},
    updatePermissions: () => {},
    updatePassword: updatePasswordMutation.mutate,
  };
};
