import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Mail, MapPin, Star, Send } from 'lucide-react';
import { VendorLocation } from '@/hooks/useVendorLocations';

interface VendorMarkerInfoProps {
  vendor: VendorLocation;
  onRequestService: (vendorId: string) => void;
  onClose: () => void;
}

export const VendorMarkerInfo = ({ vendor, onRequestService, onClose }: VendorMarkerInfoProps) => {
  const vendorData = vendor.vendor;
  
  if (!vendorData) return null;

  return (
    <Card className="w-80 shadow-xl">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{vendorData.name}</CardTitle>
            {vendorData.company_name && (
              <p className="text-sm text-muted-foreground mt-1">{vendorData.company_name}</p>
            )}
          </div>
          {vendorData.profile_image && (
            <img 
              src={vendorData.profile_image} 
              alt={vendorData.name}
              className="w-12 h-12 rounded-full object-cover"
            />
          )}
        </div>
        
        {vendorData.rating && (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{vendorData.rating.toFixed(1)}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* التخصصات */}
        {vendorData.specialization && vendorData.specialization.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {vendorData.specialization.map((spec, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {spec}
              </Badge>
            ))}
          </div>
        )}

        {/* معلومات الاتصال */}
        <div className="space-y-2">
          {vendorData.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${vendorData.phone}`} className="hover:underline">
                {vendorData.phone}
              </a>
            </div>
          )}
          
          {vendorData.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${vendorData.email}`} className="hover:underline truncate">
                {vendorData.email}
              </a>
            </div>
          )}
          
          {vendor.address && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{vendor.address}</span>
            </div>
          )}
        </div>

        {/* أزرار الإجراءات */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={() => onRequestService(vendorData.id)}
            className="flex-1"
            size="sm"
          >
            <Send className="h-4 w-4 mr-2" />
            طلب خدمة
          </Button>
          <Button 
            onClick={onClose}
            variant="outline"
            size="sm"
          >
            إغلاق
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
