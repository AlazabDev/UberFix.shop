import { Star, Phone, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface SimpleServiceCardProps {
  technicianId: string;
  name: string;
  specialization?: string;
  rating?: number;
  status?: 'available' | 'busy';
  onClose?: () => void;
}

export const SimpleServiceCard = ({ 
  technicianId,
  name, 
  specialization, 
  rating = 4.7,
  status = 'available',
  onClose
}: SimpleServiceCardProps) => {
  const navigate = useNavigate();

  const handleRequestService = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // إغلاق المنبثقة أولاً
    if (onClose) {
      onClose();
    }
    
    // الانتقال للصفحة
    setTimeout(() => {
      navigate(`/emergency-service/${technicianId}`, {
        state: { 
          technicianName: name,
          specialization,
          rating,
          status: status === 'available' ? 'available' : 'busy'
        }
      });
    }, 100);
  };

  return (
    <Card className="w-[280px] shadow-2xl border-0 rounded-xl overflow-hidden bg-card">
      <CardContent className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">{name}</h3>
            {specialization && (
              <p className="text-sm text-muted-foreground">{specialization}</p>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onClose) onClose();
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star 
              key={i} 
              className={`w-4 h-4 ${i < Math.floor(rating) ? 'fill-[#f5bf23] text-[#f5bf23]' : 'text-muted'}`} 
            />
          ))}
          <span className="text-sm font-semibold mr-2">{rating}</span>
        </div>

        {/* Action Button */}
        <Button 
          onClick={handleRequestService}
          className="w-full bg-[#f5bf23] hover:bg-[#f5bf23]/90 text-[#111] font-bold py-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          size="lg"
        >
          طلب صيانة طارئة
        </Button>
      </CardContent>
    </Card>
  );
};
