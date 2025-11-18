import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Eye, FileText } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

interface InvoiceCardProps {
  invoice: {
    id: string;
    invoice_number: string;
    customer_name: string;
    amount: number;
    currency: string;
    issue_date: string;
    status: string;
  };
  onView?: (id: string) => void;
  onDownload?: (id: string) => void;
}

export function InvoiceCard({ invoice, onView, onDownload }: InvoiceCardProps) {
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
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-lg text-foreground">{invoice.customer_name}</p>
              <p className="text-sm text-muted-foreground">#{invoice.invoice_number}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(invoice.status)}`}>
            {getStatusText(invoice.status)}
          </span>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">المبلغ:</span>
            <span className="font-bold text-xl text-foreground">
              {invoice.amount.toLocaleString('ar-EG')} {invoice.currency}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">تاريخ الإصدار:</span>
            <span className="text-foreground">
              {format(new Date(invoice.issue_date), 'dd MMMM yyyy', { locale: ar })}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onView?.(invoice.id)}
          >
            <Eye className="h-4 w-4 ml-2" />
            عرض
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onDownload?.(invoice.id)}
          >
            <Download className="h-4 w-4 ml-2" />
            تحميل
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
