import { Star, Clock, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TechnicianMapPopupProps {
  name: string;
  specialization: string;
  rating: number;
  status: "available" | "busy" | "soon";
  availableIn?: number;
  distance?: string;
  onRequestService?: () => void;
  onCall?: () => void;
}

export const TechnicianMapPopup = ({
  name,
  specialization,
  rating,
  status,
  availableIn,
  distance,
  onRequestService,
  onCall,
}: TechnicianMapPopupProps) => {
  const getStatusConfig = () => {
    switch (status) {
      case "available":
        return { text: "متاح الآن", color: "#22c55e", bgColor: "rgba(34, 197, 94, 0.1)" };
      case "busy":
        return { text: "مشغول", color: "#ef4444", bgColor: "rgba(239, 68, 68, 0.1)" };
      case "soon":
        return { text: availableIn ? `متاح بعد ${availableIn} د` : "قريباً", color: "#f59e0b", bgColor: "rgba(245, 158, 11, 0.1)" };
      default:
        return { text: "غير متاح", color: "#6b7280", bgColor: "rgba(107, 114, 128, 0.1)" };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <div 
      className="min-w-[220px] max-w-[280px] rounded-xl shadow-2xl overflow-hidden"
      style={{ 
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0'
      }}
    >
      {/* Header with accent */}
      <div 
        className="px-4 py-2.5 border-b"
        style={{ 
          backgroundColor: '#f1f5f9',
          borderColor: '#e2e8f0'
        }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm" style={{ color: '#0f172a' }}>{name}</h3>
          <span 
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ 
              backgroundColor: statusConfig.bgColor,
              color: statusConfig.color
            }}
          >
            {statusConfig.text}
          </span>
        </div>
        <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{specialization}</p>
      </div>

      {/* Body */}
      <div className="px-4 py-3 space-y-2.5">
        {/* Rating */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-3.5 h-3.5"
                style={{
                  fill: i < Math.floor(rating) ? '#f5bf23' : 'transparent',
                  color: i < Math.floor(rating) ? '#f5bf23' : '#cbd5e1'
                }}
              />
            ))}
            <span className="text-xs font-medium mr-1" style={{ color: '#64748b' }}>
              ({rating.toFixed(1)})
            </span>
          </div>
          {distance && (
            <div className="flex items-center gap-1 text-xs" style={{ color: '#64748b' }}>
              <MapPin className="w-3 h-3" />
              <span>{distance}</span>
            </div>
          )}
        </div>

        {/* Time indicator */}
        {status === "soon" && availableIn && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: '#64748b' }}>
            <Clock className="w-3.5 h-3.5" style={{ color: '#f5bf23' }} />
            <span>الوقت المتوقع للوصول: {availableIn} دقيقة</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t flex gap-2" style={{ borderColor: '#e2e8f0', backgroundColor: '#ffffff' }}>
        <Button
          onClick={onRequestService}
          className="flex-1 font-semibold text-xs"
          style={{
            backgroundColor: '#f5bf23',
            color: '#0f172a'
          }}
          size="sm"
        >
          طلب الخدمة
        </Button>
        {onCall && (
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
