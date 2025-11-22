import { memo } from 'react';
import { cn } from '@/lib/utils';

interface BranchPinProps {
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
}

export const BranchPin = memo(({ isSelected, onClick }: BranchPinProps) => {
  // استخدام أيقونة الفروع المخصصة (pin-pro-24.svg)
  const branchColor = '#1E40AF'; // أزرق للفروع

  return (
    <div
      onClick={onClick}
      className={cn(
        "relative flex items-center justify-center w-14 h-14 rounded-full cursor-pointer transition-all duration-300",
        "bg-white border-4 shadow-xl hover:shadow-2xl hover:scale-110",
        isSelected && "scale-125 z-50"
      )}
      style={{
        borderColor: branchColor,
        boxShadow: isSelected 
          ? `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 4px ${branchColor}40`
          : `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 0 3px ${branchColor}20`
      }}
    >
      {/* أيقونة الفرع المخصصة */}
      <img
        src="/icons/pin-pro/pin-pro-24.svg"
        alt="فرع أبو عوف"
        className="w-9 h-9 object-contain"
        loading="lazy"
      />
      
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-full blur-md -z-10 opacity-40"
        style={{ backgroundColor: branchColor }}
      />
      
      {/* Pulse ring عند التحديد */}
      {isSelected && (
        <div 
          className="absolute inset-0 rounded-full border-2 animate-ping opacity-75"
          style={{ borderColor: branchColor }}
        />
      )}
    </div>
  );
});

BranchPin.displayName = 'BranchPin';
