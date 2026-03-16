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
import { getStatusConfig, getPriorityConfig } from "@/constants/maintenanceStatusConstants";

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
          {requests.map((request) => {
            const statusConfig = getStatusConfig(request.status);
            const priorityConfig = getPriorityConfig(request.priority);
            return (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.title}</TableCell>
                <TableCell>{request.client_name || '-'}</TableCell>
                <TableCell>{request.location || '-'}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityConfig.color} ${priorityConfig.bgColor}`}>
                    {priorityConfig.label}
                  </span>
                </TableCell>
                <TableCell>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color} ${statusConfig.bgColor}`}>
                    {statusConfig.label}
                  </span>
                </TableCell>
                <TableCell>
                  {format(new Date(request.created_at), 'dd/MM/yyyy', { locale: ar })}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onView?.(request.id)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onEdit?.(request.id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onArchive?.(request.id)}>
                      <Archive className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onCreateInvoice?.(request.id)}>
                      <FileText className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
