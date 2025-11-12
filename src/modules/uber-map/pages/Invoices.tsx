import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Download, Eye, CreditCard } from 'lucide-react';

interface Invoice {
  id: string;
  orderNumber: string;
  serviceType: string;
  providerName: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  description: string;
  details: {
    servicePrice: number;
    tax: number;
    discount: number;
    total: number;
  };
}

const MOCK_INVOICES: Invoice[] = [
  {
    id: '1',
    orderNumber: '001',
    serviceType: 'سباك',
    providerName: 'أحمد حسين',
    date: '2025-11-07',
    amount: 250,
    status: 'paid',
    description: 'إصلاح تسرب الماء في المطبخ',
    details: {
      servicePrice: 250,
      tax: 0,
      discount: 0,
      total: 250
    }
  },
  {
    id: '2',
    orderNumber: '002',
    serviceType: 'كهربائي',
    providerName: 'محمد علي',
    date: '2025-11-08',
    amount: 150,
    status: 'pending',
    description: 'إصلاح مفتاح الضوء في غرفة النوم',
    details: {
      servicePrice: 150,
      tax: 0,
      discount: 0,
      total: 150
    }
  },
  {
    id: '3',
    orderNumber: '003',
    serviceType: 'نجار',
    providerName: 'سامي محمود',
    date: '2025-11-03',
    amount: 300,
    status: 'paid',
    description: 'إصلاح باب الخزانة',
    details: {
      servicePrice: 300,
      tax: 0,
      discount: 0,
      total: 300
    }
  }
];

const STATUS_CONFIG = {
  paid: {
    label: 'مدفوع',
    color: 'bg-green-100 text-green-800'
  },
  pending: {
    label: 'قيد الانتظار',
    color: 'bg-yellow-100 text-yellow-800'
  },
  overdue: {
    label: 'متأخر',
    color: 'bg-red-100 text-red-800'
  }
};

export default function Invoices() {
  const [, setLocation] = useLocation();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredInvoices = filterStatus === 'all'
    ? MOCK_INVOICES
    : MOCK_INVOICES.filter(invoice => invoice.status === filterStatus);

  const handleBack = () => {
    setLocation('/');
  };

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = filteredInvoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = filteredInvoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4" dir="rtl">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-0 h-auto"
          >
            <ArrowRight size={24} className="text-blue-600" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">الفواتير</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
            <p className="text-sm text-gray-600 mb-2">إجمالي الفواتير</p>
            <p className="text-3xl font-bold text-blue-900">{totalAmount} ج.م</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
            <p className="text-sm text-gray-600 mb-2">المدفوع</p>
            <p className="text-3xl font-bold text-green-900">{paidAmount} ج.م</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-yellow-50 to-yellow-100">
            <p className="text-sm text-gray-600 mb-2">قيد الانتظار</p>
            <p className="text-3xl font-bold text-yellow-900">{pendingAmount} ج.م</p>
          </Card>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('all')}
            className="text-sm"
          >
            الكل ({MOCK_INVOICES.length})
          </Button>
          <Button
            variant={filterStatus === 'paid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('paid')}
            className="text-sm"
          >
            مدفوع
          </Button>
          <Button
            variant={filterStatus === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilterStatus('pending')}
            className="text-sm"
          >
            قيد الانتظار
          </Button>
        </div>

        {/* Invoices List */}
        <div className="space-y-4">
          {filteredInvoices.map(invoice => (
            <Card key={invoice.id} className="p-6 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="text-right">
                  <h3 className="font-bold text-lg text-gray-900">
                    فاتورة #{invoice.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-600">{invoice.serviceType} - {invoice.providerName}</p>
                </div>
                <Badge className={STATUS_CONFIG[invoice.status].color}>
                  {STATUS_CONFIG[invoice.status].label}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">التاريخ</p>
                  <p className="font-semibold text-gray-900">{invoice.date}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">الوصف</p>
                  <p className="font-semibold text-gray-900">{invoice.description}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">المبلغ</p>
                  <p className="text-2xl font-bold text-blue-600">{invoice.amount} ج.م</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedInvoice(invoice)}
                  className="flex-1"
                >
                  <Eye size={16} className="mr-2" />
                  عرض التفاصيل
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Download size={16} className="mr-2" />
                  تحميل PDF
                </Button>
                {invoice.status === 'pending' && (
                  <Button
                    size="sm"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <CreditCard size={16} className="mr-2" />
                    دفع الآن
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredInvoices.length === 0 && (
          <Card className="p-12 text-center">
            <CreditCard size={48} className="text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">لا توجد فواتير في هذه الفئة</p>
          </Card>
        )}

        {/* Detail Modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">تفاصيل الفاتورة</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedInvoice(null)}
                  className="p-0 h-auto"
                >
                  ✕
                </Button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="border-b pb-4">
                  <p className="text-sm text-gray-600 mb-1">رقم الفاتورة</p>
                  <p className="font-semibold text-gray-900">#{selectedInvoice.orderNumber}</p>
                </div>

                <div className="border-b pb-4">
                  <p className="text-sm text-gray-600 mb-1">مزود الخدمة</p>
                  <p className="font-semibold text-gray-900">{selectedInvoice.providerName}</p>
                </div>

                <div className="border-b pb-4">
                  <p className="text-sm text-gray-600 mb-1">الخدمة</p>
                  <p className="text-gray-900">{selectedInvoice.description}</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">سعر الخدمة</span>
                    <span className="font-semibold text-gray-900">{selectedInvoice.details.servicePrice} ج.م</span>
                  </div>
                  {selectedInvoice.details.discount > 0 && (
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">الخصم</span>
                      <span className="font-semibold text-green-600">-{selectedInvoice.details.discount} ج.م</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-bold text-gray-900">الإجمالي</span>
                    <span className="font-bold text-blue-600 text-lg">{selectedInvoice.details.total} ج.م</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-1">الحالة</p>
                  <Badge className={STATUS_CONFIG[selectedInvoice.status].color}>
                    {STATUS_CONFIG[selectedInvoice.status].label}
                  </Badge>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedInvoice(null)}
                >
                  إغلاق
                </Button>
                {selectedInvoice.status === 'pending' && (
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    دفع الآن
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
