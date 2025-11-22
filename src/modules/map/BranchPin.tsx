import { memo } from 'react';
import { Store } from 'lucide-react';
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
        "relative flex items-center justify-center w-12 h-12 rounded-full cursor-pointer transition-all duration-300",
        "bg-gradient-to-br from-primary to-primary/80",
        "border-3 border-white shadow-xl hover:shadow-2xl hover:scale-110",
        isSelected && "scale-125 z-50 ring-4 ring-primary/30"
      )}
    >
      <Store className="w-6 h-6 text-white drop-shadow-md" />
      
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl -z-10" />
      
      {/* Pulse ring عند التحديد */}
      {isSelected && (
        <div className="absolute inset-0 rounded-full border-2 border-white animate-ping opacity-75" />
      )}
    </div>
  );
});

BranchPin.displayName = 'BranchPin';
