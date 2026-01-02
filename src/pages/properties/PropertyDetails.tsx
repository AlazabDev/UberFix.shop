import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MapPin, Building2, Edit, Loader2 } from "lucide-react";
import { InteractiveMap } from "@/components/maps/InteractiveMap";
import { Badge } from "@/components/ui/badge";
import { AppFooter } from "@/components/shared/AppFooter";
import { getPropertyTypeLabel, getPropertyStatusLabel, getPropertyStatusColor } from "@/constants/propertyConstants";
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
        .maybeSingle();

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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/properties")}
        >
          <ArrowLeft className="h-4 w-4 ml-2" />
          الرجوع إلى القائمة
        </Button>
        
        <Button
          onClick={() => navigate(`/properties/edit/${property.id}`)}
          className="bg-primary hover:bg-primary/90"
        >
          <Edit className="h-4 w-4 ml-2" />
          تعديل العقار
        </Button>
      </div>

      {/* Property Image */}
      {property.images && property.images[0] && (
        <Card className="mb-6">
          <CardContent className="p-0">
            <img
              src={property.images[0]}
              alt={property.name}
              className="w-full h-96 object-cover rounded-lg"
            />
          </CardContent>
        </Card>
      )}

      {/* Property Info */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-3xl font-bold text-foreground">{property.name}</h1>
            <Badge className={getPropertyStatusColor(property.status)}>
              {getPropertyStatusLabel(property.status)}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">نوع العقار</p>
                <p className="font-medium text-foreground">{getPropertyTypeLabel(property.type)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">العنوان</p>
                <p className="font-medium text-foreground">{property.address}</p>
              </div>
            </div>

            {property.code && (
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 flex items-center justify-center bg-primary/10 rounded mt-0.5">
                  <span className="text-xs font-bold text-primary">#</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">رمز العقار</p>
                  <p className="font-medium text-foreground">{property.code}</p>
                </div>
              </div>
            )}

            {property.description && (
              <div className="col-span-full">
                <p className="text-sm text-muted-foreground mb-1">الوصف</p>
                <p className="text-foreground">{property.description}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Map */}
      {property.latitude && property.longitude && (
        <InteractiveMap
          latitude={property.latitude}
          longitude={property.longitude}
          height="400px"
        />
      )}

      <AppFooter />
    </div>
  );
}
