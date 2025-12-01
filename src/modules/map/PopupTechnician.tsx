import { memo } from 'react';
import { X, Star, Phone, MessageSquare, Clock } from 'lucide-react';
import { TechnicianLocation } from './types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PopupTechnicianProps {
  technician: TechnicianLocation;
  position: { x: number; y: number };
  onClose: () => void;
  onRequestService?: (technicianId: string) => void;
  onContact?: (technicianId: string) => void;
}

export const PopupTechnician = memo(({
  technician,
  position,
  onClose,
  onRequestService,
  onContact,
}: PopupTechnicianProps) => {
  const getSpecializationLabel = (spec: string) => {
    const labels: Record<string, string> = {
      plumber: 'سباك',
      carpenter: 'نجار',
      electrician: 'كهربائي',
      painter: 'دهان',
    };
    return labels[spec] || spec;
  };

  const getStatusLabel = (status: TechnicianLocation['status']) => {
    const labels: Record<string, string> = {
      available: 'متاح الآن',
      busy: 'مشغول',
      soon: 'متاح بعد 40 دقيقة',
    };
    return labels[status] || status;
  };

  return (
    <div
      className="fixed z-[1000] bg-background border border-border rounded-2xl shadow-2xl p-6 w-80"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -120%)',
      }}
    >
      <button
        onClick={onClose}
        className="absolute top-4 left-4 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="space-y-4 mt-2">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-foreground mb-1">{technician.name}</h3>
          <p className="text-sm text-muted-foreground">{getSpecializationLabel(technician.specialization)}</p>
        </div>

        <div className="flex items-center justify-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "w-4 h-4",
                i < Math.floor(technician.rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-200"
              )}
            />
          ))}
          <span className="text-xs text-muted-foreground mr-1">
            ({technician.total_reviews})
          </span>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className={cn(
            "font-medium",
            technician.status === 'available' ? "text-green-600" :
            technician.status === 'busy' ? "text-red-600" : "text-yellow-600"
          )}>
            {getStatusLabel(technician.status)}
          </span>
        </div>

        <div className="bg-muted rounded-lg p-3 text-center">
          <p className="text-xs text-muted-foreground mb-1">قرب الزيارة</p>
          <p className="text-sm font-medium text-foreground">
            {technician.available_from && technician.available_to
              ? `${technician.available_from} - ${technician.available_to}`
              : 'حسب التوفر'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => onRequestService?.(technician.id)}
            className="bg-[hsl(var(--warning))] text-[#111] hover:bg-[hsl(var(--warning))]/90 font-bold"
          >
            طلب الخدمة
          </Button>
          <Button
            onClick={() => onContact?.(technician.id)}
            variant="outline"
            className="border-border"
          >
            <MessageSquare className="w-4 h-4 ml-2" />
            تواصل
          </Button>
        </div>

        {technician.phone && (
          <a
            href={`tel:${technician.phone}`}
            className="flex items-center justify-center gap-2 text-sm text-primary hover:underline"
          >
            <Phone className="w-4 h-4" />
            اتصل الآن
          </a>
        )}
      </div>
    </div>
  );
});

PopupTechnician.displayName = 'PopupTechnician';
