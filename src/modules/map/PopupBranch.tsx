import { memo } from 'react';
import { X, MapPin, CheckCircle } from 'lucide-react';
import { BranchLocation } from './types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PopupBranchProps {
  branch: BranchLocation;
  position: { x: number; y: number };
  onClose: () => void;
}

export const PopupBranch = memo(({ branch, position, onClose }: PopupBranchProps) => {
  const getStatusColor = (status: BranchLocation['status']) => {
    switch (status) {
      case 'Active':
        return 'text-green-600';
      case 'Closed':
        return 'text-red-600';
      case 'UnderMaintenance':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div
      className="fixed z-[1000] bg-background border border-border rounded-xl shadow-2xl p-6 w-80"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -120%)',
      }}
    >
      <button
        onClick={onClose}
        className="absolute top-3 left-3 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="space-y-4 mt-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-muted-foreground">{branch.id}</span>
            <CheckCircle className={cn("w-4 h-4", getStatusColor(branch.status))} />
          </div>
          <h3 className="text-xl font-bold text-foreground">{branch.branch}</h3>
        </div>

        {branch.address && (
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">{branch.address}</p>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">الحالة:</span>
          <span className={cn("text-sm font-medium", getStatusColor(branch.status))}>
            {branch.status === 'Active' ? 'نشط' : branch.status === 'Closed' ? 'مغلق' : 'تحت الصيانة'}
          </span>
        </div>

        {branch.link && (
          <Button
            onClick={() => window.open(branch.link!, '_blank')}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            عرض التفاصيل
          </Button>
        )}
      </div>
    </div>
  );
});

PopupBranch.displayName = 'PopupBranch';
