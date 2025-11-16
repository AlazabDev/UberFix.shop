import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MapPin, Building2, Phone } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!property) {
    return <div>العقار غير موجود</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Button
        variant="default"
        onClick={() => navigate("/properties")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 ml-2" />
        الرجوع إلى القائمة
      </Button>

      <Card>
        <CardContent className="pt-6">
          {property.images && property.images[0] && (
            <img
              src={property.images[0]}
              alt={property.name}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}

          <h1 className="text-2xl font-bold mb-4">{property.name}</h1>

          <div className="space-y-4">
            <div className="flex items-start gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">النوع</p>
                <p className="text-muted-foreground">{property.type}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">العنوان</p>
                <p className="text-muted-foreground">{property.address}</p>
              </div>
            </div>

            {property.code && (
              <div>
                <p className="font-medium">رمز العقار</p>
                <p className="text-muted-foreground">{property.code}</p>
              </div>
            )}

            {property.description && (
              <div>
                <p className="font-medium">الوصف</p>
                <p className="text-muted-foreground">{property.description}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
