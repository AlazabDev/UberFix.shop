import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Search, Plus, Edit, MapPin, Maximize } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QRCodeSVG } from "qrcode.react";
import { useProperties } from "@/hooks/useProperties";
import { useNavigate } from "react-router-dom";
import { PropertyActionsDialog } from "@/components/properties/PropertyActionsDialog";
import { getPropertyIcon } from "@/lib/propertyIcons";


export default function Properties() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedProperty, setSelectedProperty] = useState<{id: string, name: string} | null>(null);
  const navigate = useNavigate();
  
  const { properties, loading, error } = useProperties();

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || property.type === typeFilter;
    const matchesStatus = statusFilter === "all" || property.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const statusConfig = {
    active: { label: "نشط", className: "bg-green-500 text-white" },
    maintenance: { label: "تحت الصيانة", className: "bg-yellow-500 text-white" },
    inactive: { label: "غير نشط", className: "bg-gray-500 text-white" }
  };

  const typeConfig = {
    commercial: { label: "تجاري", className: "bg-blue-500 text-white" },
    residential: { label: "سكني", className: "bg-green-500 text-white" },
    industrial: { label: "صناعي", className: "bg-orange-500 text-white" },
    office: { label: "مكتبي", className: "bg-purple-500 text-white" },
    retail: { label: "تجزئة", className: "bg-teal-500 text-white" }
  };

  const propertyTypeStats = {
    all: properties.length,
    commercial: properties.filter(p => p.type === "commercial").length,
    residential: properties.filter(p => p.type === "residential").length,
    industrial: properties.filter(p => p.type === "industrial").length,
    office: properties.filter(p => p.type === "office").length,
  };

  const propertyStatusStats = {
    all: properties.length,
    active: properties.filter(p => p.status === "active").length,
    maintenance: properties.filter(p => p.status === "maintenance").length,
    inactive: properties.filter(p => p.status === "inactive").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">جاري تحميل العقارات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-destructive">خطأ في تحميل العقارات: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">نظام إدارة العقارات</h1>
          <p className="text-muted-foreground">إدارة ومتابعة العقارات والممتلكات</p>
        </div>
        <Button 
          className="bg-primary hover:bg-primary/90"
          onClick={() => navigate("/properties/add")}
        >
          <Plus className="h-4 w-4 ml-2" />
          عقار جديد
        </Button>
      </div>

      {/* Statistics Cards - Horizontal */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setTypeFilter("all")}>
          <CardContent className="p-4 text-center">
            <Building2 className="h-8 w-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">{propertyTypeStats.all}</p>
            <p className="text-sm text-muted-foreground">كافة العقارات</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setStatusFilter("active")}>
          <CardContent className="p-4 text-center">
            <div className="h-8 w-8 rounded-full bg-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{propertyStatusStats.active}</p>
            <p className="text-sm text-muted-foreground">النشطة</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setStatusFilter("maintenance")}>
          <CardContent className="p-4 text-center">
            <div className="h-8 w-8 rounded-full bg-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{propertyStatusStats.maintenance}</p>
            <p className="text-sm text-muted-foreground">تحت الصيانة</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setStatusFilter("inactive")}>
          <CardContent className="p-4 text-center">
            <div className="h-8 w-8 rounded-full bg-gray-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-foreground">{propertyStatusStats.inactive}</p>
            <p className="text-sm text-muted-foreground">غير نشطة</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ابحث عن عقار بالاسم أو العنوان..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="كل الأنواع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الأنواع</SelectItem>
                <SelectItem value="commercial">تجاري</SelectItem>
                <SelectItem value="residential">سكني</SelectItem>
                <SelectItem value="industrial">صناعي</SelectItem>
                <SelectItem value="office">مكتبي</SelectItem>
                <SelectItem value="retail">تجزئة</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="كل الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="maintenance">تحت الصيانة</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900">
              {property.images && property.images.length > 0 ? (
                <img 
                  src={property.images[0]} 
                  alt={property.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center">
                        <img src="${property.icon_url || getPropertyIcon(property.type)}" alt="${property.name}" class="w-24 h-24 object-contain opacity-30" />
                      </div>
                    `;
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <img 
                    src={property.icon_url || getPropertyIcon(property.type)} 
                    alt={property.name}
                    className="w-24 h-24 object-contain opacity-30"
                  />
                </div>
              )}
              <div className="absolute top-3 right-3 flex gap-2">
                <Badge className={statusConfig[property.status as keyof typeof statusConfig]?.className}>
                  {statusConfig[property.status as keyof typeof statusConfig]?.label}
                </Badge>
              </div>
              <div className="absolute top-3 left-3">
                <Badge className={typeConfig[property.type as keyof typeof typeConfig]?.className}>
                  {typeConfig[property.type as keyof typeof typeConfig]?.label}
                </Badge>
              </div>
            </div>

            <CardHeader className="pb-3 px-4">
              <CardTitle className="text-lg flex items-start justify-between gap-3">
                <span className="line-clamp-2 flex-1 text-right leading-tight">{property.name}</span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 shrink-0">
                      <Maximize className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-sm">
                    <DialogHeader>
                      <DialogTitle>رمز QR للعقار</DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col items-center gap-4 p-4">
                      <QRCodeSVG
                        id={`qr-${property.id}`}
                        value={property.qr_code_data || `${window.location.origin}/quick-request/property-${property.code}`}
                        size={256}
                        level="H"
                      />
                      <p className="text-sm text-center text-muted-foreground">{property.name}</p>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <div className="flex items-start gap-2 text-sm text-muted-foreground mt-2">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="line-clamp-2 flex-1 text-right leading-relaxed">{property.address}</span>
              </div>
            </CardHeader>

            <CardContent className="pt-0 px-4 pb-4">
              <div className="flex gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 min-w-0"
                  onClick={() => navigate(`/properties/edit/${property.id}`)}
                >
                  <Edit className="h-4 w-4 ml-1 shrink-0" />
                  <span className="truncate">تعديل</span>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="flex-1 min-w-0"
                  onClick={() => setSelectedProperty({id: property.id, name: property.name})}
                >
                  <span className="truncate">طلب صيانة</span>
                </Button>
              </div>

              {property.area && (
                <p className="text-xs text-muted-foreground text-right">
                  المساحة: {property.area} م²
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">لا توجد عقارات مطابقة للبحث</p>
          </CardContent>
        </Card>
      )}

      {/* Property Actions Dialog */}
      {selectedProperty && (
        <PropertyActionsDialog
          open={!!selectedProperty}
          onOpenChange={(open) => !open && setSelectedProperty(null)}
          propertyId={selectedProperty.id}
          propertyName={selectedProperty.name}
        />
      )}
    </div>
  );
}
