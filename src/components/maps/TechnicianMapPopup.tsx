import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TechnicianMapPopupProps {
  name: string;
  specialization: string;
  rating: number;
  status: "available" | "busy" | "soon";
  availableIn?: number;
  onRequestService?: () => void;
}

export const TechnicianMapPopup = ({
  name,
  specialization,
  rating,
  status,
  availableIn,
  onRequestService,
}: TechnicianMapPopupProps) => {
  const getStatusText = () => {
    if (status === "available") return "متاح الآن";
    if (status === "busy") return "مشغول اليوم";
    if (status === "soon" && availableIn) return `متاح بعد ${availableIn} دقيقة`;
    return "غير متاح";
  };

  return (
    <div 
      className="min-w-[200px] max-w-[260px] p-3 rounded-xl shadow-2xl"
      style={{ 
        backgroundColor: '#f5bf23',
        border: '3px solid #0b1e36'
      }}
    >
      {/* الاسم والتخصص */}
      <div className="text-center mb-2">
        <h3 className="font-bold text-base" style={{ color: '#0b1e36' }}>{name}</h3>
        <p className="text-sm" style={{ color: '#0b1e36', opacity: 0.8 }}>{specialization}</p>
      </div>

      {/* التقييم */}
      <div className="flex items-center justify-center gap-0.5 mb-2">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className="w-4 h-4"
            style={{
              fill: i < Math.floor(rating) ? '#0b1e36' : 'transparent',
              color: '#0b1e36'
            }}
          />
        ))}
      </div>

      {/* الحالة */}
      <p className="text-center text-sm font-medium mb-3" style={{ color: '#0b1e36' }}>
        {getStatusText()}
      </p>

      {/* زر طلب الخدمة */}
      <Button
        onClick={onRequestService}
        className="w-full font-bold"
        style={{
          backgroundColor: '#0b1e36',
          color: '#f5bf23'
        }}
        size="sm"
      >
        طلب الخدمة
      </Button>
    </div>
  );
};
