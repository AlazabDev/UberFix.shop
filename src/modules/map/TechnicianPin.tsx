import { memo } from 'react';
import { cn } from '@/lib/utils';
import { TechnicianLocation } from './types';
import { getSpecializationStyle } from '@/lib/technicianIcons';

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
  const specializationStyle = getSpecializationStyle(technician.specialization);
  
  // استخدام الأيقونة من النظام المخصص
  const iconUrl = specializationStyle.icon;
  const pinColor = specializationStyle.color;

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center w-14 h-14 rounded-full cursor-pointer transition-all duration-300",
        "bg-white border-4 shadow-xl hover:shadow-2xl hover:scale-110",
        isSelected && "shadow-2xl scale-125 z-50 ring-4 ring-primary/30"
      )}
      style={{
        borderColor: pinColor,
        boxShadow: isSelected 
          ? `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 4px ${pinColor}40`
          : `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 3px ${pinColor}20`
      }}
    >
      {/* الأيقونة الرئيسية */}
      <img
        src={iconUrl}
        alt={specializationStyle.label}
        className="w-9 h-9 object-contain"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = '/icons/default-pin.png';
        }}
      />
      
      {/* Status indicator بتأثير نبض */}
      <div className={cn(
        "absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
        statusColor.bg,
        technician.status === 'available' && "animate-pulse"
      )} />

      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-full blur-md -z-10 opacity-40"
        style={{ backgroundColor: pinColor }}
      />

      {/* Pulse ring عند التحديد */}
      {isSelected && (
        <div 
          className="absolute inset-0 rounded-full border-2 animate-ping opacity-75"
          style={{ borderColor: pinColor }}
        />
      )}
    </div>
  );
});

TechnicianPin.displayName = 'TechnicianPin';
