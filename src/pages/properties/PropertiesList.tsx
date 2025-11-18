import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProperties } from "@/hooks/useProperties";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { PropertyActionsDialog } from "@/components/properties/PropertyActionsDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PropertiesList() {
  const navigate = useNavigate();
  const { properties, loading } = useProperties();
  const [selectedProperty, setSelectedProperty] = useState<{ id: string; name: string } | null>(null);
  const [isActionsOpen, setIsActionsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleActionsClick = (property: { id: string; name: string }) => {
    setSelectedProperty(property);
    setIsActionsOpen(true);
  };

  const filteredProperties = properties.filter(property =>
    property.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    property.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-foreground">العقارات</h1>
            <Button
              onClick={() => navigate("/properties/create")}
              className="bg-primary hover:bg-primary/90 gap-2"
            >
              <Plus className="h-5 w-5" />
              إضافة عقار جديد
            </Button>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="ابحث عن..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 text-right"
            />
          </div>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[400px] rounded-xl" />
            ))}
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="text-center py-16">
            <div className="mb-4">
              <svg
                className="mx-auto h-24 w-24 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              لا توجد عقارات
            </h3>
            <p className="text-muted-foreground mb-6">
              ابدأ بإضافة عقار جديد لإدارة طلبات الصيانة
            </p>
            <Button
              onClick={() => navigate("/properties/create")}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 ml-2" />
              إضافة عقار جديد
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onActionsClick={handleActionsClick}
              />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border/50 text-center text-xs text-muted-foreground space-x-4 space-x-reverse">
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

      {/* Actions Dialog */}
      {selectedProperty && (
        <PropertyActionsDialog
          propertyId={selectedProperty.id}
          propertyName={selectedProperty.name}
          open={isActionsOpen}
          onOpenChange={setIsActionsOpen}
        />
      )}
    </div>
  );
}
