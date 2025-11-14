import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Lock, Unlock, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function MaintenanceLockControl() {
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current lock status
  const { data: lockStatus, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['maintenance-lock-status'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_control')
        .select('*')
        .eq('id', 'global')
        .single();

      if (error) throw error;
      return data;
    },
  });

  // Lock history removed - table deleted
  const lockHistory = [];

  // Toggle lock mutation
  const toggleLockMutation = useMutation({
    mutationFn: async ({ isLocked, message }: { isLocked: boolean; message: string }) => {
      const { error } = await supabase
        .from('app_control')
        .update({
          is_locked: isLocked,
          message: message || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 'global');

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance-lock-status'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance-lock-history'] });
      toast({
        title: variables.isLocked ? 'تم تفعيل القفل' : 'تم إلغاء القفل',
        description: variables.isLocked ? 'النظام الآن في وضع الصيانة' : 'النظام متاح للاستخدام',
      });
      setMessage('');
    },
    onError: (error: any) => {
      toast({
        title: 'خطأ',
        description: error.message || 'فشل في تغيير حالة القفل',
        variant: 'destructive',
      });
    },
  });

  const handleToggleLock = () => {
    const isCurrentlyLocked = lockStatus?.is_locked || false;
    
    if (!isCurrentlyLocked && !message.trim()) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال رسالة القفل للمستخدمين',
        variant: 'destructive',
      });
      return;
    }

    toggleLockMutation.mutate({
      isLocked: !isCurrentlyLocked,
      message: !isCurrentlyLocked ? message : '',
    });
  };

  if (isLoadingStatus) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isLocked = lockStatus?.is_locked || false;

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="border rounded-lg p-4 bg-card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {isLocked ? (
              <Lock className="h-6 w-6 text-destructive" />
            ) : (
              <Unlock className="h-6 w-6 text-green-600" />
            )}
            <div>
              <h3 className="font-semibold">حالة النظام الحالية</h3>
              <Badge variant={isLocked ? 'destructive' : 'default'} className="mt-1">
                {isLocked ? 'مقفل - وضع الصيانة' : 'نشط - متاح للاستخدام'}
              </Badge>
            </div>
          </div>
          {lockStatus?.updated_at && (
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              آخر تحديث: {new Date(lockStatus.updated_at).toLocaleString('ar-EG')}
            </div>
          )}
        </div>

        {isLocked && lockStatus?.message && (
          <div className="bg-muted p-3 rounded-md">
            <p className="text-sm font-medium mb-1">رسالة القفل الحالية:</p>
            <p className="text-sm text-muted-foreground">{lockStatus.message}</p>
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="border rounded-lg p-4 bg-card">
        <h3 className="font-semibold mb-4">التحكم في القفل</h3>
        
        {!isLocked && (
          <div className="mb-4">
            <label className="text-sm font-medium mb-2 block">
              رسالة الصيانة للمستخدمين
            </label>
            <Textarea
              placeholder="مثال: نقوم الآن بصيانة مجدولة لتحسين أداء النظام. ستعود الخدمة خلال 60 دقيقة بإذن الله. لأي طارئ: 0227047955"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        )}

        <Button
          onClick={handleToggleLock}
          disabled={toggleLockMutation.isPending}
          variant={isLocked ? 'default' : 'destructive'}
          className="w-full"
          size="lg"
        >
          {toggleLockMutation.isPending ? (
            <Loader2 className="ml-2 h-5 w-5 animate-spin" />
          ) : isLocked ? (
            <Unlock className="ml-2 h-5 w-5" />
          ) : (
            <Lock className="ml-2 h-5 w-5" />
          )}
          {isLocked ? 'إلغاء القفل وفتح النظام' : 'تفعيل القفل ووضع الصيانة'}
        </Button>
      </div>

      {/* Lock History */}
      <div className="border rounded-lg p-4 bg-card">
        <h3 className="font-semibold mb-4">سجل تاريخ القفل</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>التاريخ والوقت</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الرسالة</TableHead>
                <TableHead>تم بواسطة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lockHistory && lockHistory.length > 0 ? (
                lockHistory.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="text-sm">
                      {new Date(record.created_at).toLocaleString('ar-EG')}
                    </TableCell>
                    <TableCell>
                      <Badge variant={record.is_locked ? 'destructive' : 'default'}>
                        {record.is_locked ? 'مقفل' : 'مفتوح'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm max-w-md truncate">
                      {record.message || '-'}
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      {record.changed_by?.substring(0, 8) || 'غير معروف'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                    لا يوجد سجل سابق
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
