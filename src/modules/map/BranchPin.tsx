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
        "relative flex items-center justify-center w-11 h-11 rounded-full cursor-pointer transition-all",
        "bg-[hsl(var(--warning))] border-2 border-[hsl(var(--primary))]",
        isSelected && "border-[#111] shadow-lg scale-110"
      )}
    >
      <Store className="w-5 h-5 text-white" />
    </div>
  );
});

BranchPin.displayName = 'BranchPin';
