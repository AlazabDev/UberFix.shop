import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle2, 
  Clock, 
  Truck, 
  Wrench, 
  FileText, 
  Calendar,
  Phone,
  MessageCircle,
  Star,
  ArrowRight,
  Loader2,
  AlertCircle,
  Home
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface TrackingStage {
  key: string;
  label: string;
  icon: React.ElementType;
  status: 'completed' | 'current' | 'pending';
  timestamp?: string;
}

interface RequestData {
  id: string;
  title: string;
  description?: string;
  status: string;
  workflow_stage: string;
  created_at: string;
  updated_at?: string;
  client_name?: string;
  client_phone?: string;
  location?: string;
  priority?: string;
  service_type?: string;
  sla_due_date?: string;
  assigned_technician_id?: string;
  rating?: number;
}

const TRACKING_STAGES: { key: string; label: string; icon: React.ElementType }[] = [
  { key: 'received', label: 'تم الاستلام', icon: FileText },
  { key: 'reviewed', label: 'تمت المراجعة', icon: CheckCircle2 },
  { key: 'scheduled', label: 'تم تحديد الموعد', icon: Calendar },
  { key: 'on_the_way', label: 'الفني في الطريق', icon: Truck },
  { key: 'in_progress', label: 'جاري التنفيذ', icon: Wrench },
  { key: 'completed', label: 'تم الانتهاء', icon: CheckCircle2 },
  { key: 'closed', label: 'تم الإغلاق', icon: Star },
];

const workflowToTrackingStage = (stage: string): string => {
  const mapping: Record<string, string> = {
    'draft': 'received',
    'submitted': 'received',
    'acknowledged': 'reviewed',
    'assigned': 'reviewed',
    'scheduled': 'scheduled',
    'in_progress': 'in_progress',
    'inspection': 'in_progress',
    'completed': 'completed',
    'billed': 'completed',
    'paid': 'closed',
    'closed': 'closed',
  };
  return mapping[stage] || 'received';
};

export default function TrackOrder() {
  const { orderId } = useParams<{ orderId: string }>();
  const [request, setRequest] = useState<RequestData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequest = async () => {
      if (!orderId) {
        setError('رقم الطلب غير صحيح');
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('maintenance_requests')
          .select('*')
          .eq('id', orderId)
          .single();

        if (fetchError) {
          if (fetchError.code === 'PGRST116') {
            setError('لم يتم العثور على الطلب');
          } else {
            setError('حدث خطأ في تحميل البيانات');
          }
          return;
        }

        setRequest(data);
      } catch (err) {
        setError('حدث خطأ غير متوقع');
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();

    // Real-time subscription
    const channel = supabase
      .channel(`track-${orderId}`)
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'maintenance_requests', filter: `id=eq.${orderId}` },
        (payload) => {
          setRequest(payload.new as RequestData);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [orderId]);

  const getTrackingStages = (): TrackingStage[] => {
    if (!request) return [];

    const currentStage = workflowToTrackingStage(request.workflow_stage || 'submitted');
    const currentIndex = TRACKING_STAGES.findIndex(s => s.key === currentStage);

    return TRACKING_STAGES.map((stage, index) => ({
      ...stage,
      status: index < currentIndex ? 'completed' : index === currentIndex ? 'current' : 'pending',
      timestamp: index <= currentIndex ? request.updated_at || request.created_at : undefined,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">جاري تحميل بيانات الطلب...</p>
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">خطأ</h2>
            <p className="text-muted-foreground mb-6">{error || 'لم يتم العثور على الطلب'}</p>
            <Link to="/">
              <Button>
                <Home className="ml-2 h-4 w-4" />
                العودة للرئيسية
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stages = getTrackingStages();
  const shortOrderId = request.id.substring(0, 8).toUpperCase();

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-primary mb-2">UberFix</h1>
          <p className="text-muted-foreground">نظام تتبع طلبات الصيانة</p>
        </div>

        {/* Order Summary */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">رقم الطلب</p>
                <CardTitle className="text-lg">{shortOrderId}</CardTitle>
              </div>
              <Badge 
                variant={
                  request.workflow_stage === 'completed' || request.workflow_stage === 'closed' 
                    ? 'default' 
                    : 'secondary'
                }
                className="text-sm"
              >
                {stages.find(s => s.status === 'current')?.label || 'قيد المعالجة'}
              </Badge>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="pt-4">
            <h3 className="font-semibold mb-2">{request.title}</h3>
            {request.description && (
              <p className="text-sm text-muted-foreground">{request.description}</p>
            )}
            {request.location && (
              <p className="text-sm text-muted-foreground mt-2">
                📍 {request.location}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">مسار الطلب</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              {stages.map((stage, index) => {
                const Icon = stage.icon;
                const isLast = index === stages.length - 1;
                
                return (
                  <div key={stage.key} className="flex gap-4 mb-6 last:mb-0">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div 
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          stage.status === 'completed' 
                            ? 'bg-green-500 text-white' 
                            : stage.status === 'current'
                            ? 'bg-primary text-primary-foreground animate-pulse'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      {!isLast && (
                        <div 
                          className={`w-0.5 h-full min-h-[24px] ${
                            stage.status === 'completed' ? 'bg-green-500' : 'bg-muted'
                          }`} 
                        />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2">
                        <span 
                          className={`font-medium ${
                            stage.status === 'pending' ? 'text-muted-foreground' : ''
                          }`}
                        >
                          {stage.label}
                        </span>
                        {stage.status === 'current' && (
                          <Badge variant="outline" className="text-xs">
                            الحالة الحالية
                          </Badge>
                        )}
                      </div>
                      {stage.timestamp && stage.status !== 'pending' && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(stage.timestamp), 'dd MMMM yyyy - hh:mm a', { locale: ar })}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-3">
              {request.client_phone && (
                <a href={`tel:${request.client_phone}`}>
                  <Button variant="outline" className="w-full">
                    <Phone className="ml-2 h-4 w-4" />
                    اتصل بنا
                  </Button>
                </a>
              )}
              <a href="https://wa.me/201234567890" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full">
                  <MessageCircle className="ml-2 h-4 w-4" />
                  واتساب
                </Button>
              </a>
            </div>

            {(request.workflow_stage === 'completed' || request.workflow_stage === 'closed') && !request.rating && (
              <div className="mt-4">
                <Button className="w-full" variant="default">
                  <Star className="ml-2 h-4 w-4" />
                  تقييم الخدمة
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground">
          <p>شكراً لثقتك في UberFix</p>
          <Link to="/" className="text-primary hover:underline inline-flex items-center gap-1 mt-2">
            <ArrowRight className="h-4 w-4" />
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
