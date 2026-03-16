import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { MaintenanceRequest, MrStatus } from "@/types/maintenance";

// Re-export for backward compat
export type { MaintenanceRequest } from "@/types/maintenance";

interface UsePaginatedRequestsOptions {
  pageSize?: number;
  initialPage?: number;
  filters?: {
    status?: string | null;
    priority?: string | null;
    workflow_stage?: string | null;
    search?: string;
  };
}

interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Hook محسّن لجلب طلبات الصيانة مع Pagination
 * يدعم: Cursor-based pagination, Filters, Real-time updates
 */
export function usePaginatedRequests(options: UsePaginatedRequestsOptions = {}) {
  const { pageSize = 20, initialPage = 1, filters = {} } = options;
  
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: initialPage,
    pageSize,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const { toast } = useToast();

  const fetchRequests = async (page: number = pagination.currentPage) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setRequests([]);
        setLoading(false);
        return;
      }

      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from('maintenance_requests')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      // تطبيق الفلاتر باستخدام الأنواع الصحيحة
      if (filters.status) {
        query = query.eq('status', filters.status as MrStatus);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters.workflow_stage) {
        query = query.eq('workflow_stage', filters.workflow_stage);
      }
      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      const totalCount = count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);

      setRequests((data as MaintenanceRequest[]) || []);
      setPagination({
        currentPage: page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      });
    } catch (err) {
      console.error('Error fetching paginated requests:', err);
      setError(err as Error);
      toast({
        title: "خطأ في تحميل الطلبات",
        description: err instanceof Error ? err.message : "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchRequests(page);
    }
  };

  const nextPage = () => {
    if (pagination.hasNextPage) {
      goToPage(pagination.currentPage + 1);
    }
  };

  const previousPage = () => {
    if (pagination.hasPreviousPage) {
      goToPage(pagination.currentPage - 1);
    }
  };

  const firstPage = () => goToPage(1);
  const lastPage = () => goToPage(pagination.totalPages);

  const refetch = () => fetchRequests(pagination.currentPage);

  useEffect(() => {
    fetchRequests(initialPage);

    const channel = supabase
      .channel('maintenance-requests-paginated')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'maintenance_requests' },
        () => {
          fetchRequests(pagination.currentPage);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe().then(() => {
        supabase.removeChannel(channel);
      });
    };
  }, [filters.status, filters.priority, filters.workflow_stage, filters.search]);

  return {
    requests,
    loading,
    error,
    pagination,
    goToPage,
    nextPage,
    previousPage,
    firstPage,
    lastPage,
    refetch,
  };
}
