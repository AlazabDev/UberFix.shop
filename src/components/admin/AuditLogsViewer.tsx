import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, FileText } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export function AuditLogsViewer() {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data;
    },
  });

  const filteredLogs = auditLogs?.filter((log) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      log.table_name.toLowerCase().includes(searchLower) ||
      log.action.toLowerCase().includes(searchLower) ||
      log.record_id?.toLowerCase().includes(searchLower)
    );
  });

  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'INSERT': return 'default';
      case 'UPDATE': return 'secondary';
      case 'DELETE': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ابحث في سجل المراجعة..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10"
        />
      </div>

      {/* Logs Table */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto max-h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التاريخ والوقت</TableHead>
                  <TableHead>الجدول</TableHead>
                  <TableHead>العملية</TableHead>
                  <TableHead>معرف السجل</TableHead>
                  <TableHead>المستخدم</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs && filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs">
                        {new Date(log.created_at).toLocaleString('ar-EG')}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                          {log.table_name}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionColor(log.action)} className="text-xs">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {log.record_id?.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="text-xs">
                        {log.user_id?.substring(0, 8) || 'النظام'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <div>لا توجد سجلات مراجعة</div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Stats */}
      {filteredLogs && filteredLogs.length > 0 && (
        <div className="text-sm text-muted-foreground text-center">
          عرض {filteredLogs.length} من {auditLogs?.length} سجل
        </div>
      )}
    </div>
  );
}
