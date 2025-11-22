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
  const specializationStyle = getSpecializationStyle(technician.specialization);
  const iconUrl = specializationStyle.icon;

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative cursor-pointer transition-all duration-200",
        "hover:scale-110 drop-shadow-lg",
        isSelected && "scale-125 z-50"
      )}
      style={{
        width: '50px',
        height: '50px',
        filter: isSelected ? 'drop-shadow(0 0 8px rgba(0,0,0,0.3))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
      }}
    >
      <img
        src={iconUrl}
        alt={specializationStyle.label}
        className="w-full h-full object-contain"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.src = '/icons/default-pin.png';
        }}
      />
    </div>
  );
});

TechnicianPin.displayName = 'TechnicianPin';
