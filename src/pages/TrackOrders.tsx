import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, MapPin, Phone, Clock, CheckCircle, Clock3, AlertCircle } from 'lucide-react';

interface Order {
  id: string;
  serviceType: string;
  providerName: string;
  address: string;
  phone: string;
  status: 'pending' | 'accepted' | 'in-progress' | 'completed';
  requestDate: string;
  scheduledDate: string;
  scheduledTime: string;
  description: string;
  price?: number;
}

const MOCK_ORDERS: Order[] = [
  {
    id: '1',
    serviceType: 'سباك',
    providerName: 'أحمد حسين',
    address: 'في سياق المقطم',
    phone: '+20 100 123 4567',
    status: 'in-progress',
    requestDate: '2025-11-06',
    scheduledDate: '2025-11-07',
    scheduledTime: '10:00',
    description: 'إصلاح تسرب الماء في المطبخ',
    price: 250
  },
  {
    id: '2',
    serviceType: 'كهربائي',
    providerName: 'محمد علي',
    address: 'الجيزة',
    phone: '+20 100 234 5678',
    status: 'accepted',
    requestDate: '2025-11-05',
    scheduledDate: '2025-11-08',
    scheduledTime: '14:00',
    description: 'إصلاح مفتاح الضوء في غرفة النوم',
    price: 150
  },
  {
    id: '3',
    serviceType: 'نجار',
    providerName: 'سامي محمود',
    address: 'مشهد البكاري',
    phone: '+20 100 345 6789',
    status: 'completed',
    requestDate: '2025-11-01',
    scheduledDate: '2025-11-03',
    scheduledTime: '09:00',
    description: 'إصلاح باب الخزانة',
    price: 300
  }
];

const STATUS_CONFIG = {
  pending: {
    label: 'قيد الانتظار',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    icon: Clock3
  },
  accepted: {
    label: 'تم القبول',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    icon: CheckCircle
  },
  'in-progress': {
    label: 'قيد التنفيذ',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100',
    icon: AlertCircle
  },
  completed: {
    label: 'مكتمل',
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
    icon: CheckCircle
  }
};

const getStatusColor = (status: string) => {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
  return config ? config.color : 'bg-muted text-muted-foreground';
};

const getStatusLabel = (status: string) => {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
  return config ? config.label : status;
};

export default function TrackOrders() {
  const navigate = useNavigate();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredOrders = filterStatus === 'all' 
    ? MOCK_ORDERS 
    : MOCK_ORDERS.filter(order => order.status === filterStatus);

  const handleBack = () => {
    navigate('/dashboard');
  };

  const getStatusConfig = (status: Order['status']) => {
    return STATUS_CONFIG[status];
  };

  return (
    <div className="min-h-screen bg-background p-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-0 h-auto"
          >
            <ArrowRight size={24} className="text-primary" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">تتبع الطلبات</h1>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
          >
            الكل ({MOCK_ORDERS.length})
          </Button>
          <Button
            variant={filterStatus === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('pending')}
          >
            قيد الانتظار
          </Button>
          <Button
            variant={filterStatus === 'accepted' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('accepted')}
          >
            مقبول
          </Button>
          <Button
            variant={filterStatus === 'in-progress' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('in-progress')}
          >
            قيد التنفيذ
          </Button>
          <Button
            variant={filterStatus === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('completed')}
          >
            مكتمل
          </Button>
        </div>

        <div className="space-y-4">
          {filteredOrders.map(order => {
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;

            return (
              <Card
                key={order.id}
                className="p-6 cursor-pointer hover:shadow-lg transition-all"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center">
                      <span className="text-xl">
                        {order.serviceType === 'سباك' && '🔧'}
                        {order.serviceType === 'كهربائي' && '⚡'}
                        {order.serviceType === 'نجار' && '🪛'}
                        {order.serviceType === 'دهان' && '🎨'}
                      </span>
                    </div>
                    <div className="text-right">
                      <h3 className="font-bold text-lg text-foreground">{order.description}</h3>
                      <p className="text-sm text-muted-foreground">{order.serviceType}</p>
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(order.status)} border-0`}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex gap-2 text-sm">
                    <MapPin size={16} className="text-muted-foreground flex-shrink-0" />
                    <span className="text-foreground text-right">{order.address}</span>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <Phone size={16} className="text-muted-foreground flex-shrink-0" />
                    <a href={`tel:${order.phone}`} className="text-primary hover:underline text-right">
                      {order.phone}
                    </a>
                  </div>
                  <div className="flex gap-2 text-sm">
                    <Clock size={16} className="text-muted-foreground flex-shrink-0" />
                    <span className="text-foreground text-right">
                      {order.scheduledDate} - {order.scheduledTime}
                    </span>
                  </div>
                  {order.price && (
                    <div className="text-sm font-semibold text-foreground text-right">
                      السعر: {order.price} ج.م
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    تواصل
                  </Button>
                  <Button size="sm" className="flex-1">
                    التفاصيل
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>

        {filteredOrders.length === 0 && (
          <Card className="p-12 text-center">
            <Clock3 size={48} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">لا توجد طلبات في هذه الفئة</p>
          </Card>
        )}

        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">تفاصيل الطلب</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedOrder(null)}
                  className="p-0 h-auto"
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">رقم الطلب</p>
                  <p className="font-semibold text-foreground">{selectedOrder.id}</p>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">مزود الخدمة</p>
                  <p className="font-semibold text-foreground">{selectedOrder.providerName}</p>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">الوصف</p>
                  <p className="text-foreground">{selectedOrder.description}</p>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">الحالة</p>
                  <div className="text-sm font-semibold">{getStatusLabel(selectedOrder.status)}</div>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSelectedOrder(null)}
              >
                إغلاق
              </Button>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
