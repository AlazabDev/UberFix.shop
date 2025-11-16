import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  Edit,
  MapPin,
  Building2,
  Maximize,
  Bed,
  Bath,
  Layers,
  Car,
  Calendar,
  Wrench,
  Loader2,
} from "lucide-react";
import { PropertyQRCode } from "@/components/properties/PropertyQRCode";
import { getPropertyTypeLabel } from "@/lib/propertyIcons";

export default function PropertyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: property, isLoading } = useQuery({
    queryKey: ["property", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select(`
          *,
          cities (name_ar),
          districts (name_ar)
        `)
        .eq("id", id!)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: maintenanceStats } = useQuery({
    queryKey: ["property-maintenance", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_requests")
        .select("status")
        .eq("property_id", id!);

      if (error) throw error;

      return {
        total: data.length,
        open: data.filter((r) => r.status === "Open").length,
        inProgress: data.filter((r) => r.status === "InProgress").length,
        completed: data.filter((r) => r.status === "Completed").length,
      };
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">العقار غير موجود</h1>
          <Button onClick={() => navigate("/properties")}>
            العودة إلى القائمة
          </Button>
        </div>
      </div>
    );
  }

  const statusConfig = {
    active: { label: "نشط", class: "bg-success" },
    inactive: { label: "غير نشط", class: "bg-muted" },
    maintenance: { label: "تحت الصيانة", class: "bg-warning" },
  };

  const typeConfig = {
    residential: { label: "سكني", class: "bg-primary" },
    commercial: { label: "تجاري", class: "bg-blue-500" },
    industrial: { label: "صناعي", class: "bg-orange-500" },
    office: { label: "مكتبي", class: "bg-purple-500" },
    retail: { label: "تجزئة", class: "bg-green-500" },
    mixed_use: { label: "متعدد الاستخدام", class: "bg-teal-500" },
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/properties")}
          className="mb-4"
        >
          <ArrowRight className="h-4 w-4 ml-2" />
          الرجوع إلى القائمة
        </Button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{property.name}</h1>
            <div className="flex gap-2">
              <Badge className={statusConfig[property.status as keyof typeof statusConfig]?.class}>
                {statusConfig[property.status as keyof typeof statusConfig]?.label}
              </Badge>
              <Badge className={typeConfig[property.type as keyof typeof typeConfig]?.class}>
                {getPropertyTypeLabel(property.type)}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate(`/properties/edit/${id}`)}>
              <Edit className="h-4 w-4 ml-2" />
              تعديل
            </Button>
            <Button onClick={() => navigate(`/requests/new?propertyId=${id}`)}>
              <Wrench className="h-4 w-4 ml-2" />
              طلب صيانة
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {property.images && property.images.length > 0 && (
            <Card>
              <CardContent className="p-0">
                <img
                  src={property.images[0]}
                  alt={property.name}
                  className="w-full h-96 object-cover rounded-lg"
                />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>المواصفات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {property.area && (
                  <div className="flex items-center gap-2">
                    <Maximize className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">المساحة</p>
                      <p className="font-semibold">{property.area} م²</p>
                    </div>
                  </div>
                )}
                {property.rooms && (
                  <div className="flex items-center gap-2">
                    <Bed className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">الغرف</p>
                      <p className="font-semibold">{property.rooms}</p>
                    </div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex items-center gap-2">
                    <Bath className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">دورات المياه</p>
                      <p className="font-semibold">{property.bathrooms}</p>
                    </div>
                  </div>
                )}
                {property.floors && (
                  <div className="flex items-center gap-2">
                    <Layers className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">الطوابق</p>
                      <p className="font-semibold">{property.floors}</p>
                    </div>
                  </div>
                )}
                {property.parking_spaces && (
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">مواقف السيارات</p>
                      <p className="font-semibold">{property.parking_spaces}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الموقع</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-2 mb-4">
                <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                <div>
                  <p className="font-semibold">{property.address}</p>
                  {property.cities && (
                    <p className="text-sm text-muted-foreground">
                      {property.cities.name_ar}
                      {property.districts && ` - ${property.districts.name_ar}`}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {property.description && (
            <Card>
              <CardHeader>
                <CardTitle>الوصف</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{property.description}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>معلومات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {property.code && (
                <div>
                  <p className="text-sm text-muted-foreground">الكود</p>
                  <p className="font-semibold">{property.code}</p>
                </div>
              )}
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">النوع</p>
                <p className="font-semibold">{getPropertyTypeLabel(property.type)}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">الحالة</p>
                <p className="font-semibold">
                  {statusConfig[property.status as keyof typeof statusConfig]?.label}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">تاريخ الإضافة</p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="font-semibold">
                    {new Date(property.created_at).toLocaleDateString("ar-SA")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {maintenanceStats && (
            <Card>
              <CardHeader>
                <CardTitle>إحصائيات الصيانة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">إجمالي الطلبات</span>
                  <span className="font-bold">{maintenanceStats.total}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">قيد التنفيذ</span>
                  <span className="font-bold text-warning">{maintenanceStats.inProgress}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">مفتوحة</span>
                  <span className="font-bold text-primary">{maintenanceStats.open}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">مكتملة</span>
                  <span className="font-bold text-success">{maintenanceStats.completed}</span>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>رمز الاستجابة السريع</CardTitle>
            </CardHeader>
            <CardContent>
              <PropertyQRCode propertyId={property.id} propertyName={property.name} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
