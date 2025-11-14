import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface LifecycleEvent {
  id: string;
  request_id: string;
  status: string;
  update_type: string;
  updated_by?: string;
  update_notes?: string;
  metadata?: any;
  created_at: string;
}

export interface WorkTask {
  id: string;
  request_id: string;
  task_name: string;
  description?: string;
  status: string;
  assigned_to?: string;
  estimated_duration?: number;
  actual_duration?: number;
  materials_needed?: string[];
  completed_at?: string;
  notes?: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface RequestReview {
  id: string;
  request_id: string;
  reviewer_id?: string;
  reviewer_type: string;
  overall_rating?: number;
  service_quality?: number;
  timeliness?: number;
  professionalism?: number;
  feedback_text?: string;
  photos?: string[];
  would_recommend?: boolean;
  created_at: string;
}

export function useRequestLifecycle(requestId?: string) {
  const [lifecycleEvents, setLifecycleEvents] = useState<LifecycleEvent[]>([]);
  const [workTasks, setWorkTasks] = useState<WorkTask[]>([]);
  const [reviews, setReviews] = useState<RequestReview[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { toast } = useToast();

  const fetchLifecycleData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // جلب أحداث دورة الحياة
      const { data: lifecycleData, error: lifecycleError } = await supabase
        .from('request_lifecycle')
        .select('*')
        .eq('request_id', id)
        .order('created_at', { ascending: true });

      if (lifecycleError) throw lifecycleError;
      setLifecycleEvents(lifecycleData || []);

      // Tables deleted - work_tasks and request_reviews
      setWorkTasks([]);
      setReviews([]);

    } catch (err) {
      setError(err as Error);
      console.error('Error fetching lifecycle data:', err);
    } finally {
      setLoading(false);
    }
  };

  const addLifecycleEvent = async (
    requestId: string, 
    status: string, 
    updateType: string, 
    notes?: string,
    metadata?: any
  ) => {
    try {
      const { data, error } = await supabase
        .from('request_lifecycle')
        .insert([{
          request_id: requestId,
          status: status as any,
          update_type: updateType as any,
          update_notes: notes,
          metadata
        }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "تم التحديث",
        description: "تم إضافة حدث جديد لدورة الحياة",
      });

      if (requestId === requestId) {
        fetchLifecycleData(requestId);
      }

      return data;
    } catch (err) {
      toast({
        title: "خطأ",
        description: "فشل في إضافة حدث دورة الحياة",
        variant: "destructive",
      });
      throw err;
    }
  };

  const createWorkTask = async (taskData: Partial<WorkTask>) => {
    try {
      const { data, error } = await supabase
        .from('work_tasks')
        .insert([taskData as any])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "تم إنشاء المهمة",
        description: "تم إنشاء مهمة عمل جديدة بنجاح",
      });

      if (taskData.request_id && taskData.request_id === requestId) {
        fetchLifecycleData(taskData.request_id);
      }

      return data;
    } catch (err) {
      toast({
        title: "خطأ",
        description: "فشل في إنشاء مهمة العمل",
        variant: "destructive",
      });
      throw err;
    }
  };

  const updateWorkTask = async (taskId: string, updates: Partial<WorkTask>) => {
    try {
      const { data, error } = await supabase
        .from('work_tasks')
        .update(updates)
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "تم تحديث المهمة",
        description: "تم تحديث مهمة العمل بنجاح",
      });

      if (data.request_id === requestId) {
        fetchLifecycleData(data.request_id);
      }

      return data;
    } catch (err) {
      toast({
        title: "خطأ",
        description: "فشل في تحديث مهمة العمل",
        variant: "destructive",
      });
      throw err;
    }
  };

  const submitReview = async (reviewData: Partial<RequestReview>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('request_reviews')
        .insert([{
          ...reviewData,
          reviewer_id: user?.id
        } as any])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "تم إرسال التقييم",
        description: "شكراً لك على تقييم الخدمة",
      });

      if (reviewData.request_id === requestId) {
        fetchLifecycleData(reviewData.request_id);
      }

      return data;
    } catch (err) {
      toast({
        title: "خطأ",
        description: "فشل في إرسال التقييم",
        variant: "destructive",
      });
      throw err;
    }
  };

  useEffect(() => {
    if (requestId) {
      fetchLifecycleData(requestId);
    }
  }, [requestId]);

  return {
    lifecycleEvents,
    workTasks,
    reviews,
    loading,
    error,
    addLifecycleEvent,
    createWorkTask,
    updateWorkTask,
    submitReview,
    refetch: requestId ? () => fetchLifecycleData(requestId) : undefined
  };
}