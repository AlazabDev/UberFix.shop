import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, 
  Send, 
  Clock, 
  UserCheck, 
  Car, 
  CheckCircle2,
  XCircle,
  Loader2 
} from 'lucide-react';
import { useWhatsAppNotifications } from '@/hooks/useWhatsAppNotifications';

interface NotificationActionsProps {
  requestId: string;
  currentStatus: string;
  clientPhone?: string;
  technicianName?: string;
  onNotificationSent?: () => void;
}

/**
 * أزرار إرسال إشعارات WhatsApp السريعة
 * تُستخدم في صفحة تفاصيل طلب الصيانة
 */
export function NotificationActions({
  requestId,
  currentStatus,
  clientPhone,
  technicianName,
  onNotificationSent
}: NotificationActionsProps) {
  const { sendStatusNotification, sendTechnicianOnWay, loading } = useWhatsAppNotifications();

  const handleSendNotification = async (
    status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'
  ) => {
    await sendStatusNotification(requestId, status, { technicianName });
    onNotificationSent?.();
  };

  const handleTechnicianOnWay = async () => {
    if (technicianName) {
      await sendTechnicianOnWay(requestId, technicianName);
      onNotificationSent?.();
    }
  };

  if (!clientPhone) {
    return (
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <MessageCircle className="h-4 w-4" />
        <span>لا يوجد رقم هاتف للعميل</span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* زر إشعار الاستلام */}
      {currentStatus === 'pending' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSendNotification('pending')}
          disabled={loading}
          className="gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
          <span>إشعار الاستلام</span>
        </Button>
      )}

      {/* زر إشعار التعيين */}
      {(currentStatus === 'pending' || currentStatus === 'assigned') && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSendNotification('assigned')}
          disabled={loading}
          className="gap-2"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCheck className="h-4 w-4" />}
          <span>إشعار التعيين</span>
        </Button>
      )}

      {/* زر الفني في الطريق */}
      {currentStatus === 'assigned' && technicianName && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleTechnicianOnWay}
          disabled={loading}
          className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Car className="h-4 w-4" />}
          <span>الفني في الطريق</span>
        </Button>
      )}

      {/* زر جاري العمل */}
      {(currentStatus === 'assigned' || currentStatus === 'in_progress') && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSendNotification('in_progress')}
          disabled={loading}
          className="gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          <span>جاري العمل</span>
        </Button>
      )}

      {/* زر الإتمام */}
      {currentStatus !== 'completed' && currentStatus !== 'cancelled' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSendNotification('completed')}
          disabled={loading}
          className="gap-2 text-green-600 border-green-200 hover:bg-green-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          <span>إشعار الإتمام</span>
        </Button>
      )}

      {/* زر الإلغاء */}
      {currentStatus !== 'completed' && currentStatus !== 'cancelled' && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSendNotification('cancelled')}
          disabled={loading}
          className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
          <span>إشعار الإلغاء</span>
        </Button>
      )}
    </div>
  );
}
