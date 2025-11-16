import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PropertyForm } from "@/components/forms/PropertyForm";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";

export default function EditProperty() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [propertyData, setPropertyData] = useState<any>(null);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        toast.error("فشل تحميل بيانات العقار");
        navigate("/properties");
        return;
      }

      setPropertyData(data);
      setIsLoading(false);
    };

    fetchProperty();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-foreground">تعديل بيانات العقار</h1>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <PropertyForm
            initialData={propertyData}
            propertyId={id}
          />
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
