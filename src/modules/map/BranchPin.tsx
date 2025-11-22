import { memo } from 'react';
import { cn } from '@/lib/utils';

interface BranchPinProps {
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
}

export const BranchPin = memo(({ isSelected, onClick }: BranchPinProps) => {
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
        src="/icons/pin-pro/pin-pro-24.svg"
        alt="فرع أبو عوف"
        className="w-full h-full object-contain"
        loading="lazy"
      />
    </div>
  );
});

BranchPin.displayName = 'BranchPin';
