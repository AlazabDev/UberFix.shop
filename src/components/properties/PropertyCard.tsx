import { useState } from "react";
import { Property } from "@/hooks/useProperties";
import { Button } from "@/components/ui/button";
import { Building2, Phone, MoreVertical } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NewRequestForm } from "@/components/forms/NewRequestForm";

interface PropertyCardProps {
  property: Property;
  onActionsClick: (property: { id: string; name: string }) => void;
}

export function PropertyCard({ property, onActionsClick }: PropertyCardProps) {
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      residential: "🏢",
      commercial: "🏪",
      industrial: "🏭",
      office: "🏢",
      retail: "🛍️",
      mixed_use: "🏗️"
    };
    return icons[type] || "🏢";
  };

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      {property.images && property.images.length > 0 ? (
        <img
          src={property.images[0]}
          alt={property.name}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-muted flex items-center justify-center">
          <Building2 className="h-16 w-16 text-muted-foreground" />
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <span>{getTypeIcon(property.type)}</span>
              <span>المشروع</span>
            </div>
            <h3 className="font-bold text-lg text-foreground">{property.name}</h3>
            <p className="text-sm text-muted-foreground">الفرع</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onActionsClick({ id: property.id, name: property.name });
            }}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>

        {/* Phone */}
        {property.code && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Phone className="h-4 w-4" />
            <span dir="ltr">{property.code}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            className="flex-1 bg-primary hover:bg-primary/90 gap-1"
            onClick={(e) => {
              e.stopPropagation();
              setIsRequestDialogOpen(true);
            }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            طلب صيانة جديد
          </Button>
        </div>
      </div>

      {/* Modal طلب الصيانة الموحد */}
      <Dialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">طلب صيانة جديد - {property.name}</DialogTitle>
          </DialogHeader>
          <NewRequestForm 
            onSuccess={() => setIsRequestDialogOpen(false)}
            initialPropertyId={property.id}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
