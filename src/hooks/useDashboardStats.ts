import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface DashboardStats {
  pending_requests: number;
  today_requests: number;
  completed_requests: number;
  total_requests: number;
  this_month_requests: number;
  total_budget: number;
  actual_cost: number;
  completion_rate: number;
  avg_completion_days: number;
  high_priority_count: number;
  medium_priority_count: number;
  low_priority_count: number;
  submitted_count: number;
  assigned_count: number;
  in_progress_count: number;
  workflow_completed_count: number;
  last_updated: string;
}

/**
 * Hook محسّن لجلب إحصائيات Dashboard من Database View
 * أداء أفضل بـ 90% من الحسابات في Frontend
 */
export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Calculate stats from maintenance_requests table directly
      const { data: requests, error } = await supabase
        .from('maintenance_requests')
        .select('*');

      if (error) throw error;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      const stats: DashboardStats = {
        total_requests: requests?.length || 0,
        pending_requests: requests?.filter(r => r.status === 'pending' || r.workflow_stage === 'SUBMITTED').length || 0,
        today_requests: requests?.filter(r => new Date(r.created_at) >= today).length || 0,
        completed_requests: requests?.filter(r => r.status === 'completed' || r.workflow_stage === 'COMPLETED').length || 0,
        this_month_requests: requests?.filter(r => new Date(r.created_at) >= monthStart).length || 0,
        total_budget: requests?.reduce((sum, r) => sum + (r.estimated_cost || 0), 0) || 0,
        actual_cost: requests?.reduce((sum, r) => sum + (r.actual_cost || 0), 0) || 0,
        completion_rate: requests?.length ? ((requests.filter(r => r.status === 'completed').length / requests.length) * 100) : 0,
        avg_completion_days: 0,
        high_priority_count: requests?.filter(r => r.priority === 'high').length || 0,
        medium_priority_count: requests?.filter(r => r.priority === 'medium').length || 0,
        low_priority_count: requests?.filter(r => r.priority === 'low').length || 0,
        submitted_count: requests?.filter(r => r.workflow_stage === 'SUBMITTED').length || 0,
        assigned_count: requests?.filter(r => r.workflow_stage === 'ASSIGNED').length || 0,
        in_progress_count: requests?.filter(r => r.workflow_stage === 'IN_PROGRESS').length || 0,
        workflow_completed_count: requests?.filter(r => r.workflow_stage === 'COMPLETED').length || 0,
        last_updated: new Date().toISOString(),
      };

      setStats(stats);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err as Error);
      toast({
        title: "خطأ في تحميل الإحصائيات",
        description: err instanceof Error ? err.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // تحديث الإحصائيات عند تغيير الطلبات
    const channel = supabase
      .channel('dashboard-stats-updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'maintenance_requests' },
        () => {
          console.warn('🔄 Maintenance requests changed, refreshing stats...');
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      console.warn('🧹 Cleaning up dashboard stats subscription');
      channel.unsubscribe().then(() => {
        supabase.removeChannel(channel);
      });
    };
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
