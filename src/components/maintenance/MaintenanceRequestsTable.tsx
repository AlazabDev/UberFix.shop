import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Archive, FileText } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface MaintenanceRequest {
  id: string;
  title: string;
  status: string;
  priority: string;
  created_at: string;
  client_name?: string;
  location?: string;
  assigned_vendor_id?: string;
}

interface MaintenanceRequestsTableProps {
  requests: MaintenanceRequest[];
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onArchive?: (id: string) => void;
  onCreateInvoice?: (id: string) => void;
}

export function MaintenanceRequestsTable({
  requests,
  onView,
  onEdit,
  onArchive,
  onCreateInvoice
}: MaintenanceRequestsTableProps) {
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'Open': 'bg-blue-100 text-blue-800 border-blue-200',
      'Assigned': 'bg-purple-100 text-purple-800 border-purple-200',
      'In Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Completed': 'bg-green-100 text-green-800 border-green-200',
      'Archived': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return statusColors[status] || 'bg-muted/10 text-muted-foreground border-border';
  };

  const getPriorityColor = (priority: string) => {
    const priorityColors: Record<string, string> = {
      'high': 'bg-red-100 text-red-800',
      'medium': 'bg-orange-100 text-orange-800',
      'low': 'bg-green-100 text-green-800',
    };
    return priorityColors[priority] || 'bg-muted/10 text-muted-foreground';
  };

  const getStatusText = (status: string) => {
    const statusTexts: Record<string, string> = {
      'Open': 'مفتوح',
      'Assigned': 'معيّن',
      'In Progress': 'قيد التنفيذ',
      'Completed': 'مكتمل',
      'Archived': 'مؤرشف',
    };
    return statusTexts[status] || status;
  };

  const getPriorityText = (priority: string) => {
    const priorityTexts: Record<string, string> = {
      'high': 'عالية',
      'medium': 'متوسطة',
      'low': 'منخفضة',
    };
    return priorityTexts[priority] || priority;
  };

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">العنوان</TableHead>
            <TableHead className="text-right">العميل</TableHead>
            <TableHead className="text-right">الموقع</TableHead>
            <TableHead className="text-right">الأولوية</TableHead>
            <TableHead className="text-right">الحالة</TableHead>
            <TableHead className="text-right">التاريخ</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">{request.title}</TableCell>
              <TableCell>{request.client_name || '-'}</TableCell>
              <TableCell>{request.location || '-'}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority || '')}`}>
                  {getPriorityText(request.priority || '')}
                </span>
              </TableCell>
              <TableCell>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(request.status)}`}>
                  {getStatusText(request.status)}
                </span>
              </TableCell>
              <TableCell>
                {format(new Date(request.created_at), 'dd/MM/yyyy', { locale: ar })}
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView?.(request.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit?.(request.id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onArchive?.(request.id)}
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onCreateInvoice?.(request.id)}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
