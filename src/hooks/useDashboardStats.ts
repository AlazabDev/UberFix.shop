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

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: requests, error: fetchError } = await supabase
        .from('maintenance_requests')
        .select('status, priority, created_at, estimated_cost, actual_cost, workflow_stage');

      if (fetchError) throw fetchError;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const requestsArray = requests || [];

      setStats({
        total_requests: requestsArray.length,
        pending_requests: requestsArray.filter(r => 
          r.status === 'Open' || r.status === 'Waiting' || r.workflow_stage === 'submitted'
        ).length,
        today_requests: requestsArray.filter(r => 
          new Date(r.created_at) >= today
        ).length,
        completed_requests: requestsArray.filter(r => 
          r.status === 'Completed' || r.workflow_stage === 'completed'
        ).length,
        this_month_requests: requestsArray.filter(r => 
          new Date(r.created_at) >= monthStart
        ).length,
        total_budget: requestsArray.reduce((sum, r) => sum + (Number(r.estimated_cost) || 0), 0),
        actual_cost: requestsArray.reduce((sum, r) => sum + (Number(r.actual_cost) || 0), 0),
        completion_rate: requestsArray.length > 0 
          ? (requestsArray.filter(r => r.status === 'Completed').length / requestsArray.length) * 100 
          : 0,
        avg_completion_days: 0,
        high_priority_count: requestsArray.filter(r => r.priority === 'high' || r.priority === 'urgent').length,
        medium_priority_count: requestsArray.filter(r => r.priority === 'medium').length,
        low_priority_count: requestsArray.filter(r => r.priority === 'low').length,
        submitted_count: requestsArray.filter(r => r.workflow_stage === 'submitted').length,
        assigned_count: requestsArray.filter(r => r.workflow_stage === 'assigned').length,
        in_progress_count: requestsArray.filter(r => r.workflow_stage === 'in_progress').length,
        workflow_completed_count: requestsArray.filter(r => r.workflow_stage === 'completed').length,
        last_updated: new Date().toISOString(),
      });

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

    const channel = supabase
      .channel('dashboard-stats-updates')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'maintenance_requests' },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}
