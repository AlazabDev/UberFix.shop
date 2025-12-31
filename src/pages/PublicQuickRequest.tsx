import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { PublicQuickRequestForm } from "@/components/forms/PublicQuickRequestForm";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function PublicQuickRequest() {
  const { propertyId } = useParams();
  const [searchParams] = useSearchParams();
  const locale = searchParams.get("locale") || "ar";
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isArabic = locale === "ar";

  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) {
        setError(isArabic ? "معرف العقار مفقود" : "Property ID is missing");
        setLoading(false);
        return;
      }

      try {
        const functionUrl = `https://zrrffsjbfkphridqyais.supabase.co/functions/v1/get-property-for-qr?propertyId=${propertyId}`;
        
        const response = await fetch(functionUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || `Failed to fetch property: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }

        if (!data.property) {
          throw new Error('Property not found');
        }

        setProperty(data.property);
      } catch (err: any) {
        console.error("Error fetching property:", err);
        setError(err.message || (isArabic ? "خطأ في تحميل بيانات العقار" : "Error loading property data"));
        toast.error(isArabic ? "خطأ في تحميل بيانات العقار" : "Error loading property data");
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId, locale, isArabic]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">
            {isArabic ? "جاري التحميل..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-destructive/5 via-background to-destructive/10 p-4">
        <Card className="max-w-md w-full shadow-xl border-destructive/20">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="bg-destructive/10 p-4 rounded-full inline-flex">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {isArabic ? "عقار غير موجود" : "Property Not Found"}
            </h2>
            <p className="text-muted-foreground">
              {error || (isArabic 
                ? "لم يتم العثور على العقار المطلوب. تأكد من صحة رمز QR." 
                : "The requested property was not found. Please check the QR code.")}
            </p>
            <a 
              href="https://uberfix.shop" 
              className="inline-block mt-4 text-primary hover:underline"
            >
              {isArabic ? "← العودة للموقع الرئيسي" : "← Back to main site"}
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/10 py-6 px-4"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="container max-w-lg mx-auto">
        <PublicQuickRequestForm property={property} locale={locale} />
        
        {/* Footer */}
        <div className="mt-6 text-center">
          <a 
            href="https://uberfix.shop" 
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Powered by <span className="font-semibold">UberFix.shop</span>
          </a>
        </div>
      </div>
    </div>
  );
}
