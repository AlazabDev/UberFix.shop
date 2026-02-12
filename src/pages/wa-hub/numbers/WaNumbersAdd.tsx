import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, ArrowRight, Smartphone, Wifi } from "lucide-react";
import { useNavigate } from "react-router-dom";

const options = [
  {
    title: "إعداد فوري باستخدام رقم رقمي أمريكي",
    desc: "لا SIM ولا رمز تحقق مطلوب. الإعداد الأسرع.",
    icon: Wifi,
    recommended: true,
  },
  {
    title: "وصل شريحة SIM الخاصة بي",
    desc: "استخدم رقم هاتفك الحالي مع التحقق عبر SMS.",
    icon: Smartphone,
    recommended: false,
  },
  {
    title: "Connect WhatsApp Business تطبيق",
    desc: "ربط حساب WhatsApp Business الحالي. (غير مستقر)",
    icon: Phone,
    recommended: false,
  },
];

export default function WaNumbersAdd() {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowRight className="h-4 w-4 ml-2" />
          رجوع
        </Button>
        <h1 className="text-2xl font-bold">رقم الاتصال بواتساب</h1>
        <p className="text-muted-foreground mt-1">اختر طريقة ربط رقم واتساب الخاص بك</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        <div className="h-2 w-16 bg-green-600 rounded-full" />
        <div className="h-2 w-16 bg-muted rounded-full" />
        <div className="h-2 w-16 bg-muted rounded-full" />
      </div>

      <div className="space-y-4">
        {options.map((opt, i) => (
          <Card
            key={i}
            className="cursor-pointer hover:shadow-md hover:border-green-300 transition-all"
          >
            <CardContent className="p-6 flex items-start gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <opt.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{opt.title}</h3>
                  {opt.recommended && (
                    <Badge className="bg-green-600 text-white">موصى به</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{opt.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
