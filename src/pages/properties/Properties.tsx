import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProperties } from "@/hooks/useProperties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Building2, Loader2, MapPin, MoreVertical } from "lucide-react";
import { PropertyActionsDialog } from "@/components/properties/PropertyActionsDialog";
import { getPropertyTypeLabel } from "@/lib/propertyIcons";

export default function Properties() {
  const navigate = useNavigate();
  const { properties, loading } = useProperties();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedProperty, setSelectedProperty] = useState<{ id: string; name: string } | null>(null);

  const statusConfig = {
    active: { label: "نشط", class: "bg-success/10 text-success border-success/20" },
    inactive: { label: "غير نشط", class: "bg-muted text-muted-foreground border-border" },
    maintenance: { label: "تحت الصيانة", class: "bg-warning/10 text-warning border-warning/20" },
  };

  const typeConfig = {
    residential: { label: "سكني", class: "bg-primary/10 text-primary border-primary/20" },
    commercial: { label: "تجاري", class: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
    industrial: { label: "صناعي", class: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
    office: { label: "مكتبي", class: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
    retail: { label: "تجزئة", class: "bg-green-500/10 text-green-600 border-green-500/20" },
    mixed_use: { label: "متعدد الاستخدام", class: "bg-teal-500/10 text-teal-600 border-teal-500/20" },
  };

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.code?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || property.type === filterType;
    const matchesStatus = filterStatus === "all" || property.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const propertyTypeStats = properties.reduce(
    (acc, prop) => {
      acc[prop.type] = (acc[prop.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const propertyStatusStats = properties.reduce(
    (acc, prop) => {
      acc[prop.status] = (acc[prop.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">العقارات</h1>
          <p className="text-muted-foreground mt-1">إدارة ومتابعة جميع العقارات</p>
        </div>
        <Button onClick={() => navigate("/properties/add")}>
          <Plus className="h-4 w-4 ml-2" />
          إضافة عقار جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-foreground">{properties.length}</div>
            <p className="text-sm text-muted-foreground">إجمالي العقارات</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-success">{propertyStatusStats.active || 0}</div>
            <p className="text-sm text-muted-foreground">عقارات نشطة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-warning">{propertyStatusStats.maintenance || 0}</div>
            <p className="text-sm text-muted-foreground">تحت الصيانة</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-primary">{propertyTypeStats.residential || 0}</div>
            <p className="text-sm text-muted-foreground">عقارات سكنية</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="ابحث عن عقار..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="نوع العقار" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="residential">سكني</SelectItem>
                <SelectItem value="commercial">تجاري</SelectItem>
                <SelectItem value="industrial">صناعي</SelectItem>
                <SelectItem value="office">مكتبي</SelectItem>
                <SelectItem value="retail">تجزئة</SelectItem>
                <SelectItem value="mixed_use">متعدد الاستخدام</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
                <SelectItem value="maintenance">تحت الصيانة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {filteredProperties.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">لا توجد عقارات تطابق البحث</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <Card
              key={property.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/properties/${property.id}`)}
            >
              <CardContent className="p-0">
                {property.images && property.images.length > 0 ? (
                  <img
                    src={property.images[0]}
                    alt={property.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                ) : (
                  <div className="w-full h-48 bg-muted flex items-center justify-center rounded-t-lg">
                    <Building2 className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-foreground">{property.name}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedProperty({ id: property.id, name: property.name });
                      }}
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  {property.code && (
                    <p className="text-sm text-muted-foreground mb-2">كود: {property.code}</p>
                  )}
                  <div className="flex gap-2 mb-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${
                        statusConfig[property.status as keyof typeof statusConfig]?.class
                      }`}
                    >
                      {statusConfig[property.status as keyof typeof statusConfig]?.label}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full border ${
                        typeConfig[property.type as keyof typeof typeConfig]?.class
                      }`}
                    >
                      {getPropertyTypeLabel(property.type)}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                    <p className="line-clamp-2">{property.address}</p>
                  </div>
                  {property.area && (
                    <p className="text-sm text-muted-foreground mt-2">المساحة: {property.area} م²</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedProperty && (
        <PropertyActionsDialog
          propertyId={selectedProperty.id}
          propertyName={selectedProperty.name}
          open={!!selectedProperty}
          onOpenChange={(open) => !open && setSelectedProperty(null)}
        />
      )}
    </div>
  );
}
