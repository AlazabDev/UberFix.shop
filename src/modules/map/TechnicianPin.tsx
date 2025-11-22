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

const getSpecializationEmoji = (specialization: TechnicianLocation['specialization']) => {
  switch (specialization) {
    case 'plumber':
      return '🔧';
    case 'carpenter':
      return '🪵';
    case 'electrician':
      return '⚡';
    case 'painter':
      return '🎨';
    default:
      return '🔨';
  }
};

export const TechnicianPin = memo(({ technician, isSelected, onClick }: TechnicianPinProps) => {
  const borderClass = getStatusBorder(technician.status);
  const emoji = getSpecializationEmoji(technician.specialization);

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center w-12 h-12 rounded-full cursor-pointer transition-all",
        "bg-white border-3 shadow-md hover:shadow-xl",
        borderClass,
        isSelected && "border-[#111] shadow-xl scale-125 z-10"
      )}
    >
      <span className="text-2xl">{emoji}</span>
      {/* Status indicator */}
      <div className={cn(
        "absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
        technician.status === 'available' && "bg-green-500",
        technician.status === 'busy' && "bg-red-500",
        technician.status === 'soon' && "bg-yellow-500"
      )} />
    </div>
  );
});

TechnicianPin.displayName = 'TechnicianPin';
