import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Loader2
} from "lucide-react";

interface StatusButtonProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  statusType: string;
  color: string;
}

const WhatsAppStatusButtons = () => {
  const [phone, setPhone] = useState("");
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
        title: "تم الإرسال",
        description: "تم إرسال الرسالة عبر WhatsApp بنجاح",
      });
    } catch (error) {
      console.error("Error sending WhatsApp:", error);
      toast({
        title: "خطأ",
        description: "فشل في إرسال الرسالة",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const statusButtons: StatusButtonProps[] = [
    {
      icon: <Wrench className="h-6 w-6" />,
      title: "متابعة طلب الصيانة",
      description: "إرسال حالة طلب الصيانة للعميل",
      statusType: "maintenance",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      icon: <Building2 className="h-6 w-6" />,
      title: "حالة العقار",
      description: "إرسال تحديث حالة العقار",
      statusType: "property",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "الفواتير",
      description: "إرسال تفاصيل الفاتورة",
      statusType: "invoice",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "موعد الزيارة",
      description: "إرسال تذكير بموعد الزيارة",
      statusType: "appointment",
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "اكتمال الخدمة",
      description: "إشعار باكتمال الخدمة",
      statusType: "completed",
      color: "bg-emerald-500 hover:bg-emerald-600",
    },
  ];

  const getStatusMessage = (statusType: string): string => {
    const messages: Record<string, string> = {
      maintenance: "مرحباً، نود إعلامكم بآخر تحديثات طلب الصيانة الخاص بكم. يرجى التواصل معنا لمزيد من التفاصيل.",
      property: "مرحباً، إليكم تحديث حالة العقار الخاص بكم. للاستفسار يرجى التواصل معنا.",
      invoice: "مرحباً، تم إصدار فاتورة جديدة. يمكنكم الاطلاع على التفاصيل عبر التطبيق.",
      appointment: "تذكير: لديكم موعد زيارة قادم. يرجى التأكد من توفركم في الموعد المحدد.",
      completed: "تم اكتمال الخدمة بنجاح! شكراً لثقتكم بنا. نتطلع لخدمتكم مجدداً.",
    };
    return messages[statusType] || "رسالة من UberFix";
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2 text-2xl">
          <MessageSquare className="h-7 w-7 text-green-500" />
          إرسال حالات الخدمات عبر WhatsApp
        </CardTitle>
        <CardDescription>
          اختر نوع الإشعار لإرساله للعميل عبر WhatsApp
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="phone">رقم الهاتف</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+201234567890"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="text-left"
            dir="ltr"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {statusButtons.map((btn) => (
            <Button
              key={btn.statusType}
              onClick={() => sendWhatsAppStatus(btn.statusType, getStatusMessage(btn.statusType))}
              disabled={loading !== null}
              className={`${btn.color} text-white h-auto py-4 flex flex-col items-center gap-2`}
            >
              {loading === btn.statusType ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                btn.icon
              )}
              <span className="font-semibold">{btn.title}</span>
              <span className="text-xs opacity-90">{btn.description}</span>
            </Button>
          ))}
        </div>

        <div className="pt-4 border-t">
          <Button
            onClick={() => sendWhatsAppStatus("custom", "رسالة مخصصة من UberFix")}
            disabled={loading !== null}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            {loading === "custom" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
            إرسال رسالة مخصصة
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WhatsAppStatusButtons;
