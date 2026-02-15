import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { PageContainer } from '@/components/layout/PageContainer';
import {
  MessageSquare,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Send,
  Mail,
  Eye,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface MessageLog {
  id: string;
  recipient: string;
  message_type: 'sms' | 'whatsapp' | 'email';
  message_content: string;
  provider: string;
  status: string;
  external_id: string | null;
  sent_at: string;
  delivered_at: string | null;
  error_message: string | null;
  metadata: any;
  request_id: string | null;
  created_at: string;
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  delivered: { label: 'تم التسليم', color: 'bg-green-500' },
  sent: { label: 'تم الإرسال', color: 'bg-green-500' },
  read: { label: 'تمت القراءة', color: 'bg-blue-500' },
  queued: { label: 'في الانتظار', color: 'bg-yellow-500' },
  sending: { label: 'جاري الإرسال', color: 'bg-blue-400' },
  failed: { label: 'فشل', color: 'bg-red-500' },
  undelivered: { label: 'لم يتم التسليم', color: 'bg-red-500' },
};

const TYPE_ICONS: Record<string, { icon: typeof MessageSquare; color: string }> = {
  whatsapp: { icon: MessageSquare, color: 'text-green-600' },
  sms: { icon: MessageSquare, color: 'text-blue-600' },
  email: { icon: Mail, color: 'text-purple-600' },
};

export default function WhatsAppMessageLogsPage() {
  const [logs, setLogs] = useState<MessageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('whatsapp');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedLog, setSelectedLog] = useState<MessageLog | null>(null);
  const limit = 25;

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);

      let query = supabase
        .from('message_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (typeFilter !== 'all') {
        query = query.eq('message_type', typeFilter);
      }
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (searchTerm) {
        query = query.or(
          `recipient.ilike.%${searchTerm}%,message_content.ilike.%${searchTerm}%`
        );
      }

      const { data, error, count } = await query;
      if (error) throw error;

      setLogs((data || []) as MessageLog[]);
      setTotal(count || 0);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('فشل في تحميل سجل الرسائل');
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, statusFilter, searchTerm]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('message-logs-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'message_logs' },
        () => fetchLogs()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLogs]);

  const totalPages = Math.ceil(total / limit);

  // Stats
  const stats = {
    total: total,
    delivered: logs.filter((l) => l.status === 'delivered' || l.status === 'read').length,
    pending: logs.filter((l) => l.status === 'queued' || l.status === 'sending').length,
    failed: logs.filter((l) => l.status === 'failed' || l.status === 'undelivered').length,
  };

  return (
    <PageContainer maxWidth="7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">سجل المراسلات</h1>
          <p className="text-muted-foreground text-sm mt-1">
            متابعة جميع الرسائل المرسلة والمستلمة عبر WhatsApp و SMS
          </p>
        </div>
        <Button onClick={fetchLogs} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 ml-2 ${loading ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'إجمالي الرسائل', value: stats.total, icon: MessageSquare, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'تم التسليم', value: stats.delivered, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
          { label: 'قيد الانتظار', value: stats.pending, icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-100' },
          { label: 'فشلت', value: stats.failed, icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${kpi.bg}`}>
                <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 p-4 bg-muted/30 rounded-lg">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالرقم أو المحتوى..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            className="pr-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأنواع</SelectItem>
            <SelectItem value="whatsapp">واتساب</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
            <SelectItem value="email">بريد إلكتروني</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            <SelectItem value="delivered">تم التسليم</SelectItem>
            <SelectItem value="sent">تم الإرسال</SelectItem>
            <SelectItem value="read">تمت القراءة</SelectItem>
            <SelectItem value="failed">فشل</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="text-right">النوع</TableHead>
              <TableHead className="text-right">المستلم</TableHead>
              <TableHead className="text-right">المحتوى</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">التاريخ</TableHead>
              <TableHead className="text-right">التسليم</TableHead>
              <TableHead className="text-center w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {[...Array(7)].map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <Send className="h-12 w-12 mx-auto mb-4 opacity-30" />
                  <p className="text-muted-foreground">لا توجد رسائل</p>
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => {
                const typeInfo = TYPE_ICONS[log.message_type] || TYPE_ICONS.whatsapp;
                const statusInfo = STATUS_MAP[log.status] || { label: log.status, color: 'bg-muted' };
                const TypeIcon = typeInfo.icon;

                return (
                  <TableRow key={log.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedLog(log)}>
                    <TableCell>
                      <TypeIcon className={`h-4 w-4 ${typeInfo.color}`} />
                    </TableCell>
                    <TableCell className="font-mono text-sm" dir="ltr">
                      {log.recipient}
                    </TableCell>
                    <TableCell className="max-w-[250px]">
                      <p className="text-sm truncate">{log.message_content}</p>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${statusInfo.color} text-white text-xs`}>
                        {statusInfo.label}
                      </Badge>
                      {log.error_message && (
                        <p className="text-[10px] text-destructive mt-1 truncate max-w-[120px]">
                          {log.error_message}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {format(new Date(log.created_at), 'dd/MM HH:mm', { locale: ar })}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {log.delivered_at
                        ? format(new Date(log.delivered_at), 'HH:mm', { locale: ar })
                        : '-'}
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSelectedLog(log)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            {total} رسالة · صفحة {page} من {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Message Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="sm:max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>تفاصيل الرسالة</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">المستلم</p>
                  <p className="font-mono" dir="ltr">{selectedLog.recipient}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">النوع</p>
                  <p>{selectedLog.message_type === 'whatsapp' ? 'واتساب' : selectedLog.message_type === 'sms' ? 'SMS' : 'بريد'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">الحالة</p>
                  <Badge className={`${STATUS_MAP[selectedLog.status]?.color || 'bg-muted'} text-white`}>
                    {STATUS_MAP[selectedLog.status]?.label || selectedLog.status}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">المزود</p>
                  <p>{selectedLog.provider}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">تاريخ الإرسال</p>
                  <p>{format(new Date(selectedLog.created_at), 'dd/MM/yyyy HH:mm:ss', { locale: ar })}</p>
                </div>
                {selectedLog.delivered_at && (
                  <div>
                    <p className="text-muted-foreground text-xs">تاريخ التسليم</p>
                    <p>{format(new Date(selectedLog.delivered_at), 'dd/MM/yyyy HH:mm:ss', { locale: ar })}</p>
                  </div>
                )}
              </div>

              {/* Message Content */}
              <div>
                <p className="text-muted-foreground text-xs mb-1">محتوى الرسالة</p>
                <div className="bg-[#efeae2] rounded-lg p-4">
                  <div className="bg-white rounded-lg shadow-sm p-3">
                    <p className="text-sm whitespace-pre-wrap">{selectedLog.message_content}</p>
                  </div>
                </div>
              </div>

              {selectedLog.error_message && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
                  <p className="font-medium text-xs mb-1">خطأ</p>
                  {selectedLog.error_message}
                </div>
              )}

              {selectedLog.external_id && (
                <div>
                  <p className="text-muted-foreground text-xs">معرف خارجي</p>
                  <p className="font-mono text-xs" dir="ltr">{selectedLog.external_id}</p>
                </div>
              )}

              {selectedLog.request_id && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.location.href = `/requests/${selectedLog.request_id}`}
                >
                  عرض طلب الصيانة المرتبط
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
