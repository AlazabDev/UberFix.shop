import { memo, useMemo } from 'react';
import { Star, MapPin } from 'lucide-react';
import { TechnicianLocation } from './types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ServiceListProps {
  technicians: TechnicianLocation[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  specializationFilter?: string;
}

export const ServiceList = memo(({
  technicians,
  selectedId,
  onSelect,
  specializationFilter,
}: ServiceListProps) => {
  const filteredTechnicians = useMemo(() => {
    if (!specializationFilter) return technicians;
    return technicians.filter(t => t.specialization === specializationFilter);
  }, [technicians, specializationFilter]);

  const getSpecializationLabel = (spec: string) => {
    const labels: Record<string, string> = {
      plumber: 'سباك',
      carpenter: 'نجار',
      electrician: 'كهربائي',
      painter: 'دهان',
    };
    return labels[spec] || spec;
  };

  const getStatusColor = (status: TechnicianLocation['status']) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'busy':
        return 'bg-red-500';
      case 'soon':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="absolute top-20 right-4 w-80 bg-background border border-border rounded-xl shadow-xl z-[500] max-h-[calc(100vh-8rem)]">
      <div className="p-4 border-b border-border">
        <h3 className="text-lg font-bold text-foreground">الفنيين المتاحين</h3>
        <p className="text-sm text-muted-foreground">اختر فني لرؤية التفاصيل</p>
      </div>
      
      <ScrollArea className="h-[calc(100vh-16rem)]">
        <div className="p-2 space-y-2">
          {filteredTechnicians.map((tech) => (
            <button
              key={tech.id}
              onClick={() => onSelect(tech.id)}
              className={cn(
                "w-full p-4 rounded-lg border transition-all text-right",
                selectedId === tech.id
                  ? "bg-primary/10 border-primary"
                  : "bg-card border-border hover:border-primary/50"
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-bold text-foreground text-sm">{tech.name}</h4>
                  <p className="text-xs text-muted-foreground">
                    {getSpecializationLabel(tech.specialization)}
                  </p>
                </div>
                <div className={cn(
                  "w-2 h-2 rounded-full flex-shrink-0 mt-1",
                  getStatusColor(tech.status)
                )} />
              </div>

              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={cn(
                      "w-3 h-3",
                      i < Math.floor(tech.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    )}
                  />
                ))}
                <span className="text-xs text-muted-foreground mr-1">
                  ({tech.total_reviews})
                </span>
              </div>

              {tech.hourly_rate && (
                <p className="text-xs text-muted-foreground">
                  {tech.hourly_rate} جنيه/ساعة
                </p>
              )}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
});

ServiceList.displayName = 'ServiceList';
