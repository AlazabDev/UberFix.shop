import { memo } from 'react';
import { cn } from '@/lib/utils';
import { TechnicianLocation } from './types';

interface TechnicianPinProps {
  technician: TechnicianLocation;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
}

const getStatusColor = (status: TechnicianLocation['status']) => {
  switch (status) {
    case 'available':
      return {
        border: 'border-green-500',
        bg: 'bg-green-500',
        glow: 'shadow-green-500/50'
      };
    case 'busy':
      return {
        border: 'border-red-500',
        bg: 'bg-red-500',
        glow: 'shadow-red-500/50'
      };
    case 'soon':
      return {
        border: 'border-yellow-500',
        bg: 'bg-yellow-500',
        glow: 'shadow-yellow-500/50'
      };
    default:
      return {
        border: 'border-gray-400',
        bg: 'bg-gray-400',
        glow: 'shadow-gray-400/50'
      };
  }
};

export const TechnicianPin = memo(({ technician, isSelected, onClick }: TechnicianPinProps) => {
  const statusColor = getStatusColor(technician.status);
  
  // استخدام icon_url من قاعدة البيانات أو أيقونة افتراضية
  const iconUrl = (technician as any).icon_url || '/icons/default-pin.png';

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center w-14 h-14 rounded-full cursor-pointer transition-all duration-300",
        "bg-white border-3 shadow-lg hover:shadow-2xl hover:scale-110",
        statusColor.border,
        isSelected && "border-primary shadow-2xl scale-125 z-50 ring-4 ring-primary/30"
      )}
    >
      {/* الأيقونة الرئيسية */}
      <img
        src={iconUrl}
        alt={technician.specialization}
        className="w-8 h-8 object-contain"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = '/icons/default-pin.png';
        }}
      />
      
      {/* Status indicator بتأثير نبض */}
      <div className={cn(
        "absolute -top-1 -right-1 w-5 h-5 rounded-full border-3 border-white",
        statusColor.bg,
        technician.status === 'available' && "animate-pulse"
      )}>
        {/* Inner glow effect */}
        <div className={cn(
          "absolute inset-0 rounded-full",
          statusColor.bg,
          "animate-ping opacity-75"
        )} />
      </div>

      {/* Pulse ring عند التحديد */}
      {isSelected && (
        <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-75" />
      )}
    </div>
  );
});

TechnicianPin.displayName = 'TechnicianPin';
