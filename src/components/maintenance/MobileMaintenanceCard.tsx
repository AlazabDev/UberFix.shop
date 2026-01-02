import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Calendar, 
  Phone, 
  DollarSign, 
  MapPin, 
  Star,
  User,
  Wrench,
  MoreHorizontal
} from "lucide-react";
import { MaintenanceRequestActions } from "./MaintenanceRequestActions";
import { RequestStatusBadge } from "./RequestStatusBadge";
import { RequestPriorityBadge } from "./RequestPriorityBadge";
import { getServiceTypeLabel } from "@/constants/maintenanceStatusConstants";

interface MaintenanceRequest {
  id: string;
  title?: string;
  status: string;
  workflow_stage?: string;
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
              <RequestStatusBadge 
                status={request.status} 
                workflowStage={request.workflow_stage}
              />
              <RequestPriorityBadge priority={request.priority} />
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
          <span className="text-sm text-muted-foreground">
            {getServiceTypeLabel(request.service_type)}
          </span>
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
                <MoreHorizontal className="h-4 w-4 mr-1" />
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
