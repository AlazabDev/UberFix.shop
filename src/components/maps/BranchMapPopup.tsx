import { MapPin, Building, CheckCircle, Clock, Phone, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BranchMapPopupProps {
  id: string;
  name: string;
  address: string;
  area?: string;
  status?: "Active" | "Closed";
  phone?: string;
  workingHours?: string;
  onGetDirections?: () => void;
  onCall?: () => void;
}

export const BranchMapPopup = ({ 
  id, 
  name, 
  address, 
  area, 
  status = "Active",
  phone,
  workingHours,
  onGetDirections,
  onCall
}: BranchMapPopupProps) => {
  const isActive = status === "Active";
  
  return (
    <div 
      className="min-w-[220px] max-w-[280px] rounded-xl shadow-2xl overflow-hidden"
      style={{ 
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0'
      }}
    >
      {/* Header */}
      <div 
        className="px-4 py-2.5 border-b"
        style={{ 
          backgroundColor: '#f1f5f9',
          borderColor: '#e2e8f0'
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4" style={{ color: '#3b82f6' }} />
            <h3 className="font-bold text-sm" style={{ color: '#0f172a' }}>{name}</h3>
          </div>
          <span 
            className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ 
              backgroundColor: isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: isActive ? '#22c55e' : '#ef4444'
            }}
          >
            <CheckCircle className="w-3 h-3" />
            {isActive ? "مفتوح" : "مغلق"}
          </span>
        </div>
        <p className="text-xs mt-0.5 font-mono" style={{ color: '#64748b' }}>#{id.slice(0, 8)}</p>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2">
        {/* Address */}
        <div className="flex items-start gap-2">
          <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#f5bf23' }} />
          <p className="text-xs" style={{ color: '#475569' }}>{area || address}</p>
        </div>

        {/* Working Hours */}
        {workingHours && (
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" style={{ color: '#64748b' }} />
            <p className="text-xs" style={{ color: '#64748b' }}>{workingHours}</p>
          </div>
        )}

        {/* Phone */}
        {phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5" style={{ color: '#64748b' }} />
            <p className="text-xs font-mono" style={{ color: '#64748b' }}>{phone}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t flex gap-2" style={{ borderColor: '#e2e8f0', backgroundColor: '#ffffff' }}>
        {onGetDirections && (
          <Button
            onClick={onGetDirections}
            className="flex-1 font-semibold text-xs gap-1.5"
            style={{
              backgroundColor: '#f5bf23',
              color: '#0f172a'
            }}
            size="sm"
          >
            <Navigation className="w-3.5 h-3.5" />
            الاتجاهات
          </Button>
        )}
        {onCall && phone && (
          <Button
            onClick={onCall}
            variant="outline"
            size="sm"
            className="px-3"
            style={{ borderColor: '#e2e8f0' }}
          >
            <Phone className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
};
