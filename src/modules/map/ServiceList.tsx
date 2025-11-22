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

  const getSpecializationLabel = (spec: string) => {
    const labels: Record<string, string> = {
      plumber: 'سباك',
      carpenter: 'نجار',
      electrician: 'كهربائي',
      painter: 'دهان',
      ac_technician: 'فني تكييف',
      general_maintenance: 'صيانة عامة',
    };
    return labels[spec] || spec;
  };

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
    <div className="absolute top-20 right-4 w-80 bg-background/95 backdrop-blur-sm border border-border rounded-xl shadow-2xl z-[500] max-h-[calc(100vh-8rem)] overflow-hidden">
      <div className="p-4 border-b border-border bg-gradient-to-r from-primary/10 to-transparent">
        <h3 className="text-lg font-bold text-foreground">الفنيين المتاحين</h3>
        <p className="text-sm text-muted-foreground">
          {filteredTechnicians.length} فني {specializationFilter ? `(${getSpecializationLabel(specializationFilter)})` : ''}
        </p>
      </div>
      
      <ScrollArea className="h-[calc(100vh-16rem)]">
        <div className="p-3 space-y-2">
          {filteredTechnicians.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">لا يوجد فنيين متاحين حالياً</p>
            </div>
          ) : (
            filteredTechnicians.map((tech) => (
              <button
                key={tech.id}
                onClick={() => onSelect(tech.id)}
                className={cn(
                  "w-full p-4 rounded-lg border transition-all text-right hover:shadow-lg",
                  selectedId === tech.id
                    ? "bg-primary/15 border-primary shadow-md ring-2 ring-primary/30"
                    : "bg-card border-border hover:border-primary/50 hover:bg-card/80"
                )}
              >
                <div className="flex items-start gap-3 mb-2">
                  {/* أيقونة التخصص */}
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-white shadow-md"
                    style={{ backgroundColor: getSpecializationStyle(tech.specialization).color }}
                  >
                    <img
                      src={getSpecializationStyle(tech.specialization).icon}
                      alt={getSpecializationStyle(tech.specialization).label}
                      className="w-7 h-7 object-contain"
                      loading="lazy"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-bold text-foreground text-base truncate">{tech.name}</h4>
                      <div className="flex flex-col items-end gap-1 flex-shrink-0 mr-2">
                        <div className={cn(
                          "w-2.5 h-2.5 rounded-full flex-shrink-0 animate-pulse",
                          getStatusColor(tech.status)
                        )} />
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {getStatusLabel(tech.status)}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {getSpecializationStyle(tech.specialization).label}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "w-3.5 h-3.5",
                        i < Math.floor(tech.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200"
                      )}
                    />
                  ))}
                  <span className="text-xs font-bold text-foreground mr-1">
                    {tech.rating.toFixed(1)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    ({tech.total_reviews} تقييم)
                  </span>
                </div>

                {tech.hourly_rate && (
                  <div className="flex items-center justify-between text-xs mt-2 pt-2 border-t border-border/50">
                    <span className="text-muted-foreground">السعر:</span>
                    <span className="text-primary font-bold">{tech.hourly_rate} ج/ساعة</span>
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
