import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  MessageSquare, 
  Wrench, 
  Building2, 
  FileText, 
  Clock, 
  CheckCircle,
  Send,
  Loader2,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

interface StatusButtonProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  statusType: string;
  bgColor: string;
}

const WhatsAppStatusPage = () => {
  const [phone, setPhone] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [loading, setLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const sendWhatsAppStatus = async (statusType: string, message: string) => {
    if (!phone) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رقم الهاتف",
        variant: "destructive",
      });
      return;
    }

    setLoading(statusType);
    try {
      const { data, error } = await supabase.functions.invoke("send-twilio-message", {
        body: {
          to: phone,
          message,
          type: "whatsapp",
        },
      });

      if (error) throw error;

      toast({
        title: "تم الإرسال بنجاح",
        description: "تم إرسال الرسالة عبر WhatsApp",
      });
    } catch (error) {
      console.error("Error sending WhatsApp:", error);
      toast({
        title: "خطأ في الإرسال",
        description: "فشل في إرسال الرسالة. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const statusButtons: StatusButtonProps[] = [
    {
      icon: <Wrench className="h-8 w-8" />,
      title: "متابعة طلب الصيانة",
      description: "إرسال حالة طلب الصيانة للعميل",
      statusType: "maintenance",
      bgColor: "bg-blue-500 hover:bg-blue-600",
    },
    {
      icon: <Building2 className="h-8 w-8" />,
      title: "حالة العقار",
      description: "إرسال تحديث حالة العقار",
      statusType: "property",
      bgColor: "bg-emerald-500 hover:bg-emerald-600",
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "الفواتير",
      description: "إرسال تفاصيل الفاتورة",
      statusType: "invoice",
      bgColor: "bg-purple-500 hover:bg-purple-600",
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: "موعد الزيارة",
      description: "إرسال تذكير بموعد الزيارة",
      statusType: "appointment",
      bgColor: "bg-orange-500 hover:bg-orange-600",
    },
    {
      icon: <CheckCircle className="h-8 w-8" />,
      title: "اكتمال الخدمة",
      description: "إشعار باكتمال الخدمة",
      statusType: "completed",
      bgColor: "bg-green-600 hover:bg-green-700",
    },
  ];

  const getStatusMessage = (statusType: string): string => {
    const messages: Record<string, string> = {
      maintenance: `مرحباً من UberFix 🔧

نود إعلامكم بآخر تحديثات طلب الصيانة الخاص بكم.
يمكنكم متابعة حالة الطلب من خلال التطبيق.

للاستفسار: تواصلوا معنا`,
      property: `مرحباً من UberFix 🏢

إليكم تحديث حالة العقار الخاص بكم.
تم تحديث البيانات في النظام.

للاستفسار يرجى التواصل معنا.`,
      invoice: `مرحباً من UberFix 📄

تم إصدار فاتورة جديدة لكم.
يمكنكم الاطلاع على التفاصيل والدفع عبر التطبيق.

شكراً لثقتكم بنا.`,
      appointment: `تذكير من UberFix ⏰

لديكم موعد زيارة صيانة قادم.
يرجى التأكد من توفركم في الموعد المحدد.

للتعديل أو الإلغاء: تواصلوا معنا`,
      completed: `تم بنجاح ✅

اكتملت خدمة الصيانة الخاصة بكم!
نتمنى أن تكون الخدمة قد نالت رضاكم.

شكراً لثقتكم بـ UberFix
نتطلع لخدمتكم مجدداً.`,
    };
    return messages[statusType] || "رسالة من UberFix";
  };

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-green-500/10">
              <MessageSquare className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                إرسال حالات الخدمات
              </h1>
              <p className="text-muted-foreground">
                إرسال إشعارات للعملاء عبر WhatsApp
              </p>
            </div>
          </div>
          <Button variant="ghost" asChild>
            <Link to="/dashboard" className="flex items-center gap-2">
              <ArrowRight className="h-4 w-4" />
              العودة
            </Link>
          </Button>
        </div>

        {/* Phone Input Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">رقم الهاتف</CardTitle>
            <CardDescription>
              أدخل رقم هاتف العميل المراد إرسال الإشعار له
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="tel"
                  placeholder="+201234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="text-left text-lg"
                  dir="ltr"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Buttons Grid */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">اختر نوع الإشعار</CardTitle>
            <CardDescription>
              اضغط على الزر لإرسال الإشعار المناسب
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {statusButtons.map((btn) => (
                <Button
                  key={btn.statusType}
                  onClick={() => sendWhatsAppStatus(btn.statusType, getStatusMessage(btn.statusType))}
                  disabled={loading !== null || !phone}
                  className={`${btn.bgColor} text-white h-auto py-6 flex flex-col items-center gap-3 transition-all duration-200 hover:scale-[1.02]`}
                >
                  {loading === btn.statusType ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : (
                    btn.icon
                  )}
                  <span className="font-bold text-base">{btn.title}</span>
                  <span className="text-xs opacity-90 text-center">{btn.description}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Custom Message Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">رسالة مخصصة</CardTitle>
            <CardDescription>
              أو أرسل رسالة مخصصة للعميل
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="customMessage">نص الرسالة</Label>
              <Textarea
                id="customMessage"
                placeholder="اكتب رسالتك هنا..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
            <Button
              onClick={() => sendWhatsAppStatus("custom", customMessage)}
              disabled={loading !== null || !phone || !customMessage}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              {loading === "custom" ? (
                <Loader2 className="h-5 w-5 animate-spin ml-2" />
              ) : (
                <Send className="h-5 w-5 ml-2" />
              )}
              إرسال رسالة مخصصة
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WhatsAppStatusPage;
