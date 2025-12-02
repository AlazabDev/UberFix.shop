import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { QuickRequestForm } from "@/components/forms/QuickRequestForm";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function QuickRequest() {
  const { propertyId } = useParams();
  const [searchParams] = useSearchParams();
  const locale = searchParams.get("locale") || "ar";
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      if (!propertyId) {
        toast.error(locale === "ar" ? "معرف العقار مفقود" : "Property ID is missing");
        setLoading(false);
        return;
      }

      try {
        const functionUrl = `https://zrrffsjbfkphridqyais.supabase.co/functions/v1/get-property-for-qr?propertyId=${propertyId}`;
        
        console.log('Fetching property from:', functionUrl);
        
        const response = await fetch(functionUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response error:', errorText);
          throw new Error(`Failed to fetch property: ${response.status}`);
        }

        const data = await response.json();
        console.log('Property data:', data);
        
        if (data.error) {
          throw new Error(data.error);
        }

        if (!data.property) {
          throw new Error('Property not found');
        }

        setProperty(data.property);
      } catch (err) {
        console.error("Error fetching property:", err);
        toast.error(locale === "ar" ? "خطأ في تحميل بيانات العقار" : "Error loading property data");
        setProperty(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId, locale]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-background">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {locale === "ar" ? "عقار غير موجود" : "Property Not Found"}
            </h2>
            <p className="text-muted-foreground">
              {locale === "ar" 
                ? "لم يتم العثور على العقار المطلوب" 
                : "The requested property was not found"}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <QuickRequestForm property={property} locale={locale} />
      </div>
    </div>
  );
}
