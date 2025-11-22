import { memo } from 'react';
import { cn } from '@/lib/utils';
import { TechnicianLocation } from './types';

interface TechnicianPinProps {
  technician: TechnicianLocation;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
}

const getStatusBorder = (status: TechnicianLocation['status']) => {
  switch (status) {
    case 'available':
      return 'border-green-500';
    case 'busy':
      return 'border-red-500';
    case 'soon':
      return 'border-yellow-500';
    default:
      return 'border-gray-400';
  }
};

const getIconPath = (specialization: TechnicianLocation['specialization']) => {
  return `/icons/pin-pro/${specialization}.png`;
};

export const TechnicianPin = memo(({ technician, isSelected, onClick }: TechnicianPinProps) => {
  const borderClass = getStatusBorder(technician.status);
  const iconPath = getIconPath(technician.specialization);

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center w-11 h-11 rounded-full cursor-pointer transition-all",
        "bg-white border-2",
        borderClass,
        isSelected && "border-[#111] shadow-lg scale-110"
      )}
    >
      <img
        src={iconPath}
        alt={technician.specialization}
        className="w-7 h-7 object-contain"
        onError={(e) => {
          e.currentTarget.src = '/placeholder.svg';
        }}
      />
    </div>
  );
});

TechnicianPin.displayName = 'TechnicianPin';
