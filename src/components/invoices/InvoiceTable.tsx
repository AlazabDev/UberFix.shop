import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Eye } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  amount: number;
  currency: string;
  issue_date: string;
  status: string;
}

interface InvoiceTableProps {
  invoices: Invoice[];
  onView?: (id: string) => void;
  onDownload?: (id: string) => void;
}

export function InvoiceTable({ invoices, onView, onDownload }: InvoiceTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-success/10 text-success border-success/20';
      case 'pending':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'overdue':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted/10 text-muted-foreground border-border';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'مدفوعة';
      case 'pending':
        return 'معلقة';
      case 'overdue':
        return 'متأخرة';
      default:
        return status;
    }
  };

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">رقم الفاتورة</TableHead>
            <TableHead className="text-right">العميل</TableHead>
            <TableHead className="text-right">المبلغ</TableHead>
            <TableHead className="text-right">تاريخ الإصدار</TableHead>
            <TableHead className="text-right">الحالة</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-medium">#{invoice.invoice_number}</TableCell>
              <TableCell>{invoice.customer_name}</TableCell>
              <TableCell className="font-semibold">
                {invoice.amount.toLocaleString('ar-EG')} {invoice.currency}
              </TableCell>
              <TableCell>
                {format(new Date(invoice.issue_date), 'dd/MM/yyyy', { locale: ar })}
              </TableCell>
              <TableCell>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(invoice.status)}`}>
                  {getStatusText(invoice.status)}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView?.(invoice.id)}
                  >
                    <Eye className="h-4 w-4 ml-1" />
                    عرض
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDownload?.(invoice.id)}
                  >
                    <Download className="h-4 w-4 ml-1" />
                    تحميل
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
