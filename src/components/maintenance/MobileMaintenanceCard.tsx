import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Eye, 
  Calendar, 
  Phone, 
  DollarSign, 
  MapPin, 
  Star,
  User,
  Wrench,
  AlertCircle
} from "lucide-react";
import { MaintenanceRequestActions } from "./MaintenanceRequestActions";

interface MaintenanceRequest {
  id: string;
  title?: string;
  status: string;
  priority?: string;
  client_name?: string;
  client_phone?: string;
  service_type?: string;
  location?: string;
  created_at: string;
  actual_cost?: number;
  estimated_cost?: number;
  rating?: number;
}

interface MobileMaintenanceCardProps {
  request: MaintenanceRequest;
}

export function MobileMaintenanceCard({ request }: MobileMaintenanceCardProps) {
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: "bg-warning/10 text-warning border-warning/20",
      in_progress: "bg-info/10 text-info border-info/20",
      completed: "bg-success/10 text-success border-success/20",
      cancelled: "bg-destructive/10 text-destructive border-destructive/20"
    };

    const labels = {
      pending: "في الانتظار",
      in_progress: "قيد التنفيذ", 
      completed: "مكتمل",
      cancelled: "ملغي"
    };

    return (
      <Badge variant="outline" className={statusClasses[status] || statusClasses.pending}>
        {labels[status] || status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityClasses = {
      low: "bg-muted text-muted-foreground border-muted",
      medium: "bg-warning/10 text-warning border-warning/20",
      high: "bg-destructive/10 text-destructive border-destructive/20"
    };

    const labels = {
      low: "منخفضة",
      medium: "متوسطة",
      high: "عالية"
    };

    return (
      <Badge variant="outline" className={priorityClasses[priority] || priorityClasses.medium}>
        {labels[priority] || priority}
      </Badge>
    );
  };

  const handleCallClient = () => {
    if (request.client_phone) {
      window.location.href = `tel:${request.client_phone}`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="w-full shadow-sm hover:shadow-md transition-shadow duration-200 border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base text-foreground truncate mb-1">
              {request.title}
            </h3>
            <div className="flex items-center gap-2 mb-2">
              {getStatusBadge(request.status)}
              {getPriorityBadge(request.priority)}
            </div>
          </div>
          <div className="text-xs text-muted-foreground text-right">
            #{request.id?.slice(0, 8)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* العميل */}
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm font-medium">{request.client_name}</span>
          {request.client_phone && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCallClient}
              className="mr-auto p-1 h-7 w-7 hover:bg-primary/10"
            >
              <Phone className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* نوع الخدمة */}
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm text-muted-foreground">{request.service_type}</span>
        </div>

        {/* الموقع */}
        {request.location && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm text-muted-foreground truncate">{request.location}</span>
          </div>
        )}

        {/* التاريخ */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-xs text-muted-foreground">{formatDate(request.created_at)}</span>
        </div>

        {/* التكلفة والتقييم */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              {request.actual_cost || request.estimated_cost || "غير محدد"}
              {(request.actual_cost || request.estimated_cost) && " ج.م"}
            </span>
          </div>
          
          {request.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-warning fill-warning" />
              <span className="text-sm font-medium">{request.rating}</span>
            </div>
          )}
        </div>

        {/* الإجراءات */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => navigate(`/requests/${request.id}`)}
          >
            <Eye className="h-4 w-4 mr-1" />
            التفاصيل
          </Button>

          <Dialog open={showActions} onOpenChange={setShowActions}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm" className="flex-1">
                <AlertCircle className="h-4 w-4 mr-1" />
                الإجراءات
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl text-right">إجراءات الطلب</DialogTitle>
              </DialogHeader>
              <MaintenanceRequestActions 
                request={request} 
              />
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
