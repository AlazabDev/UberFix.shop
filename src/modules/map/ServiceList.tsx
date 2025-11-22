import { memo, useMemo } from 'react';
import { Star, MapPin } from 'lucide-react';
import { TechnicianLocation } from './types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { getSpecializationStyle } from '@/lib/technicianIcons';

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

  const getStatusLabel = (status: TechnicianLocation['status']) => {
    switch (status) {
      case 'available':
        return 'متاح الآن';
      case 'busy':
        return 'مشغول';
      case 'soon':
        return 'متاح قريباً';
      default:
        return 'غير متاح';
    }
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
    <div className="absolute top-20 left-4 w-52 bg-background/95 backdrop-blur-sm border border-border rounded-xl shadow-2xl z-[500] max-h-[calc(100vh-8rem)] overflow-hidden">
      <div className="p-1.5 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
        <h3 className="text-xs font-bold text-foreground">الفنيين المتاحين</h3>
        <p className="text-[9px] text-muted-foreground">
          {filteredTechnicians.length} فني {specializationFilter ? `(${getSpecializationStyle(specializationFilter).label})` : ''}
        </p>
      </div>
      
      <ScrollArea className="h-[calc(100vh-16rem)]">
        <div className="p-1 space-y-1">
          {filteredTechnicians.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <MapPin className="w-6 h-6 mx-auto mb-1.5 opacity-50" />
              <p className="text-[9px]">لا يوجد فنيين متاحين حالياً</p>
            </div>
          ) : (
            filteredTechnicians.map((tech) => (
              <button
                key={tech.id}
                onClick={() => onSelect(tech.id)}
                className={cn(
                  "w-full p-1.5 rounded-lg border transition-all text-right hover:shadow-lg",
                  selectedId === tech.id
                    ? "bg-primary/15 border-primary shadow-md ring-1 ring-primary/30"
                    : "bg-card border-border hover:border-primary/50 hover:bg-card/80"
                )}
              >
                <div className="flex items-start gap-1 mb-1">
                  {/* أيقونة التخصص */}
                  <div 
                    className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border border-white shadow-sm"
                    style={{ backgroundColor: getSpecializationStyle(tech.specialization).color }}
                  >
                    <img
                      src={getSpecializationStyle(tech.specialization).icon}
                      alt={getSpecializationStyle(tech.specialization).label}
                      className="w-4 h-4 object-contain"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-0.5">
                      <h4 className="font-bold text-foreground text-[11px] truncate">{tech.name}</h4>
                      <div className="flex flex-col items-end gap-0.5 flex-shrink-0 mr-0.5">
                        <div className={cn(
                          "w-1.5 h-1.5 rounded-full flex-shrink-0 animate-pulse",
                          getStatusColor(tech.status)
                        )} />
                        <span className="text-[7px] text-muted-foreground whitespace-nowrap">
                          {getStatusLabel(tech.status)}
                        </span>
                      </div>
                    </div>
                    <p className="text-[8px] text-muted-foreground">
                      {getSpecializationStyle(tech.specialization).label}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 mb-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-2 h-2",
                        i < Math.floor(tech.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200"
                      )}
                    />
                  ))}
                  <span className="text-[9px] font-bold text-foreground mr-0.5">
                    {tech.rating.toFixed(1)}
                  </span>
                  <span className="text-[7px] text-muted-foreground">
                    ({tech.total_reviews})
                  </span>
                </div>

                {tech.hourly_rate && (
                  <div className="flex items-center justify-between text-xs mt-0.5 pt-0.5 border-t border-border/50">
                    <span className="text-muted-foreground text-[8px]">السعر:</span>
                    <span className="text-primary font-bold text-[9px]">{tech.hourly_rate} ج/س</span>
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
});

ServiceList.displayName = 'ServiceList';
