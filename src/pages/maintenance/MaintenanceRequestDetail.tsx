import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, MessageSquare, MapPin, Clock, DollarSign, FileText, Paperclip } from "lucide-react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface MaintenanceRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  service_type: string;
  estimated_cost: number;
  actual_cost: number;
  assigned_vendor_id: string;
  property_id: string;
  location: string;
}

export default function MaintenanceRequestDetail() {
  const { id } = useParams();
  const [request, setRequest] = useState<MaintenanceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [property, setProperty] = useState<any>(null);
  const [vendor, setVendor] = useState<any>(null);
  const [statusLog, setStatusLog] = useState<any[]>([]);
  const [financialTransactions, setFinancialTransactions] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchRequestDetails();
    }
  }, [id]);

  const fetchRequestDetails = async () => {
    try {
      setLoading(true);

      // Fetch main request
      const { data: requestData, error: requestError } = await supabase
        .from("maintenance_requests")
        .select("*")
        .eq("id", id)
        .single();

      if (requestError) throw requestError;
      setRequest(requestData);

      // Fetch property
      if (requestData.property_id) {
        const { data: propertyData } = await supabase
          .from("properties")
          .select("*")
          .eq("id", requestData.property_id)
          .single();
        setProperty(propertyData);
      }

      // Fetch vendor
      if (requestData.assigned_vendor_id) {
        const { data: vendorData } = await supabase
          .from("vendors")
          .select("*")
          .eq("id", requestData.assigned_vendor_id)
          .single();
        setVendor(vendorData);
      }

      // Fetch status log
      const { data: logData } = await supabase
        .from("request_lifecycle")
        .select("*")
        .eq("request_id", id)
        .order("created_at", { ascending: false });
      setStatusLog(logData || []);

      // Fetch financial transactions
      const { data: expensesData } = await supabase
        .from("expenses")
        .select("*")
        .eq("maintenance_request_id", id)
        .order("created_at", { ascending: false });
      setFinancialTransactions(expensesData || []);

    } catch (error: any) {
      toast.error("فشل تحميل تفاصيل الطلب");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      Open: "bg-blue-500",
      "In Progress": "bg-yellow-500",
      Completed: "bg-green-500",
      Cancelled: "bg-red-500",
      Archived: "bg-gray-500"
    };
    return colors[status] || "bg-gray-500";
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("ar-EG", {
      style: "currency",
      currency: "EGP"
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">لم يتم العثور على الطلب</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">تفاصيل طلب الصيانة</h1>
          <p className="text-muted-foreground">رقم الطلب: {request.id.slice(0, 8).toUpperCase()}</p>
        </div>
        <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-1 space-y-6">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">معلومات الاتصال</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">اسم العميل</p>
                <p className="font-semibold">{request.client_name || "غير محدد"}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">رقم الهاتف</p>
                <div className="flex gap-2 mt-1">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Phone className="h-4 w-4 ml-2" />
                    {request.client_phone || "غير متوفر"}
                  </Button>
                  <Button variant="outline" size="sm">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {request.client_email && (
                <div>
                  <p className="text-sm text-muted-foreground">البريد الإلكتروني</p>
                  <p className="font-semibold">{request.client_email}</p>
                </div>
              )}

              {vendor && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground">مزود الخدمة</p>
                  <p className="font-semibold">{vendor.name}</p>
                  <div className="flex gap-2 mt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Phone className="h-4 w-4 ml-2" />
                      {vendor.phone}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Property Details */}
          {property && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">تفاصيل العقار</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">اسم العقار</p>
                  <p className="font-semibold">{property.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">العنوان</p>
                  <p className="text-sm">{property.address}</p>
                </div>
                {property.latitude && property.longitude && (
                  <Button variant="outline" size="sm" className="w-full">
                    <MapPin className="h-4 w-4 ml-2" />
                    عرض الموقع على الخريطة
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">معلومات الطلب</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">نوع الطلب</p>
                  <p className="font-semibold">{request.service_type || "غير محدد"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">الأولوية</p>
                  <Badge variant="outline">{request.priority || "عادي"}</Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">تاريخ الإنشاء</p>
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {new Date(request.created_at).toLocaleString("ar-EG")}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">العنوان</p>
                <p className="font-semibold text-lg">{request.title}</p>
              </div>

              {request.description && (
                <div>
                  <p className="text-sm text-muted-foreground">الوصف</p>
                  <p className="text-sm">{request.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Invoice Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                ملخص الفاتورة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">رسوم الصيانة</span>
                  <span className="font-semibold">{formatCurrency(request.estimated_cost || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">تكلفة المواد</span>
                  <span className="font-semibold">{formatCurrency(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الضريبة (14%)</span>
                  <span className="font-semibold">
                    {formatCurrency((request.estimated_cost || 0) * 0.14)}
                  </span>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">الإجمالي</span>
                    <span className="font-bold text-primary">
                      {formatCurrency((request.estimated_cost || 0) * 1.14)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Log */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <FileText className="h-5 w-5" />
                سجل الحالات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statusLog.length > 0 ? (
                <div className="space-y-3">
                  {statusLog.map((log) => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                      <Badge className={getStatusColor(log.status)}>{log.status}</Badge>
                      <div className="flex-1">
                        {log.update_notes && (
                          <p className="text-sm">{log.update_notes}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(log.created_at).toLocaleString("ar-EG")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">لا توجد سجلات</p>
              )}
            </CardContent>
          </Card>

          {/* Financial Transactions */}
          {financialTransactions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">المعاملات المالية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right p-2">المبلغ</th>
                        <th className="text-right p-2">الفئة</th>
                        <th className="text-right p-2">التاريخ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financialTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b">
                          <td className="p-2">{formatCurrency(transaction.amount)}</td>
                          <td className="p-2">{transaction.category}</td>
                          <td className="p-2 text-sm text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString("ar-EG")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
