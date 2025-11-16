import { useNavigate } from "react-router-dom";
import { PropertyForm } from "@/components/forms/PropertyForm";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function AddProperty() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="mb-6">
        <Button
          variant="default"
          onClick={() => navigate("/properties")}
          className="mb-4 bg-primary hover:bg-primary/90"
        >
          <ArrowLeft className="h-4 w-4 ml-2" />
          الرجوع إلى القائمة
        </Button>

        <div className="text-right">
          <p className="text-sm text-muted-foreground mb-1">العقارات</p>
          <h1 className="text-2xl font-bold text-foreground">إضافة عقار جديد</h1>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <PropertyForm />
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-muted-foreground space-x-4 space-x-reverse">
        <a href="#" className="hover:text-primary">دليل المستخدم</a>
        <span>•</span>
        <a href="#" className="hover:text-primary">شروط الاستخدام</a>
        <span>•</span>
        <a href="#" className="hover:text-primary">سياسة الخصوصية</a>
        <div className="mt-2">
          جميع الحقوق محفوظة © 2025 بواسطة UberFix.shop - v2.0.0
        </div>
      </div>
    </div>
  );
}
