import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function RegistrationThankYou() {
  const navigate = useNavigate();

  useEffect(() => {
    // Prevent going back
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = () => {
      window.history.pushState(null, '', window.location.href);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full p-8">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-primary" />
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold text-foreground mb-3">
              شكراً على التسجيل!
            </h1>
            <p className="text-lg text-muted-foreground">
              تم استلام طلب التسجيل الخاص بك بنجاح
            </p>
          </div>

          <Card className="bg-muted/30 p-6 text-right">
            <p className="text-foreground leading-relaxed">
              طلبك قيد المراجعة من فريق UberFix. سيصلك بريد إلكتروني خلال <strong>3-5 أيام عمل</strong> يحتوي على:
            </p>
            <ul className="list-disc list-inside text-foreground mt-4 space-y-2">
              <li>حالة الموافقة على طلبك</li>
              <li>بيانات الدخول إلى حسابك (في حالة القبول)</li>
              <li>أي متطلبات إضافية قد تحتاج لاستكمالها</li>
            </ul>
          </Card>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-3">متطلبات هامة</h3>
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <p className="text-sm text-foreground text-right">
                يُرجى التأكد من تحميل شهادة التأمين (إن وُجدت) والمستندات المطلوبة في قسم "المرفقات"، حيث أن عدم توفرها قد يؤخر عملية الموافقة.
              </p>
            </div>
          </div>

          <div className="pt-4">
            <p className="text-sm text-muted-foreground mb-4">
              لأي استفسارات، يمكنك التواصل معنا عبر:{" "}
              <a href="mailto:support@uberfix.shop" className="text-primary hover:underline">
                support@uberfix.shop
              </a>
            </p>
            
            <Button
              onClick={() => navigate('/dashboard')}
              size="lg"
              className="w-full md:w-auto"
            >
              العودة إلى لوحة التحكم
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
