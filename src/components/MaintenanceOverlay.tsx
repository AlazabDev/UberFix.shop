import { AlertCircle, Wrench } from "lucide-react";
import { Card } from "@/components/ui/card";

interface MaintenanceOverlayProps {
  message?: string | null;
}

export const MaintenanceOverlay = ({ message }: MaintenanceOverlayProps) => {
  const defaultMessage =
    "نقوم حالياً بصيانة مجدولة لتحسين أداء النظام. ستعود الخدمة قريباً بإذن الله.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <Card className="max-w-2xl mx-4 p-8 shadow-2xl border-border bg-card">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* أيقونة الصيانة */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
            <div className="relative bg-primary/10 p-6 rounded-full">
              <Wrench className="w-16 h-16 text-primary animate-bounce" />
            </div>
          </div>

          {/* العنوان */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">
              صيانة مجدولة
            </h1>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">النظام غير متاح مؤقتاً</p>
            </div>
          </div>

          {/* رسالة الصيانة */}
          <div className="bg-muted/50 p-6 rounded-lg border border-border max-w-xl">
            <p className="text-lg leading-relaxed text-foreground">
              {message || defaultMessage}
            </p>
          </div>

          {/* معلومات التواصل */}
          <div className="pt-4 space-y-2 text-sm text-muted-foreground">
            <p>للاستفسار أو في حالات الطوارئ:</p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center items-center">
              <a
                href="tel:0227047955"
                className="text-primary hover:underline font-medium"
              >
                📞 0227047955
              </a>
              <span className="hidden sm:inline">|</span>
              <a
                href="mailto:admin@alazab.online"
                className="text-primary hover:underline font-medium"
              >
                📧 admin@alazab.online
              </a>
            </div>
          </div>

          {/* شريط التحميل المتحرك */}
          <div className="w-full max-w-md mt-6">
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-pulse" style={{ width: "60%" }} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              جاري العمل على تحسين الخدمة...
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
