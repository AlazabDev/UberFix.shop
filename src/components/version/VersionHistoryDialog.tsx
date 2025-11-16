import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useVersionHistory } from '@/hooks/useVersionHistory';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, RotateCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface VersionHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: string;
  recordId: string;
  onRollback?: () => void;
}

export function VersionHistoryDialog({
  open,
  onOpenChange,
  table,
  recordId,
  onRollback,
}: VersionHistoryDialogProps) {
  const { history, isLoading } = useVersionHistory(table, recordId);
  const { toast } = useToast();
  const [isRollingBack, setIsRollingBack] = useState(false);

  const handleRollback = async (version: number) => {
    if (!confirm(`هل تريد الرجوع إلى الإصدار ${version}؟ سيؤدي هذا إلى التراجع عن جميع التغييرات اللاحقة.`)) {
      return;
    }

    setIsRollingBack(true);

    try {
      const { data, error } = await supabase.functions.invoke('rollback-version', {
        body: {
          table,
          id: recordId,
          version,
        },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Rollback failed');
      }

      toast({
        title: 'تم التراجع بنجاح',
        description: `تم الرجوع إلى الإصدار ${version}`,
      });

      onRollback?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Rollback error:', error);
      toast({
        title: 'فشل التراجع',
        description: error instanceof Error ? error.message : 'حدث خطأ أثناء التراجع',
        variant: 'destructive',
      });
    } finally {
      setIsRollingBack(false);
    }
  };

  const getOperationBadge = (operation: string) => {
    const variants: Record<string, any> = {
      INSERT: 'default',
      UPDATE: 'secondary',
      DELETE: 'destructive',
    };

    const labels: Record<string, string> = {
      INSERT: 'إنشاء',
      UPDATE: 'تحديث',
      DELETE: 'حذف',
    };

    return (
      <Badge variant={variants[operation] || 'default'}>
        {labels[operation] || operation}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            سجل الإصدارات
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">لا يوجد سجل للإصدارات</div>
          ) : (
            <div className="space-y-4">
              {history.map((entry, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getOperationBadge(entry.operation)}
                      <span className="text-sm font-medium">الإصدار {entry.version}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRollback(entry.version)}
                      disabled={isRollingBack || index === 0}
                      className="gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      التراجع إلى هذا الإصدار
                    </Button>
                  </div>

                  <div className="space-y-1 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>التاريخ:</span>
                      <span>{format(new Date(entry.changed_at), 'PPp', { locale: ar })}</span>
                    </div>

                    {entry.changed_by_name && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <span>بواسطة:</span>
                        <span>{entry.changed_by_name}</span>
                      </div>
                    )}

                    {entry.change_summary && (
                      <div className="mt-2 p-2 bg-muted rounded text-xs">
                        <div className="font-medium mb-1">التغييرات:</div>
                        <pre className="whitespace-pre-wrap font-mono">
                          {entry.change_summary}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
