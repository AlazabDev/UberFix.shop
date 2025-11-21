import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { CheckCircle, Circle, Clock } from "lucide-react";

interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  type: 'completed' | 'current' | 'pending';
}

interface MaintenanceTimelineProps {
  events: TimelineEvent[];
}

export function MaintenanceTimeline({ events }: MaintenanceTimelineProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'current':
        return <Clock className="h-5 w-5 text-warning" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'completed':
        return 'border-success bg-success/10';
      case 'current':
        return 'border-warning bg-warning/10';
      default:
        return 'border-border bg-muted/10';
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">الخط الزمني</h3>
      <div className="relative">
        {/* الخط الرأسي */}
        <div className="absolute right-[10px] top-0 bottom-0 w-[2px] bg-border" />
        
        <div className="space-y-6">
          {events.map((event) => (
            <div key={event.id} className="relative flex gap-4">
              {/* الأيقونة */}
              <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 ${getColor(event.type)}`}>
                {getIcon(event.type)}
              </div>
              
              {/* المحتوى */}
              <div className="flex-1 pb-4">
                <div className="bg-card border rounded-lg p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-foreground">{event.title}</h4>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(event.timestamp), 'dd MMM yyyy, HH:mm', { locale: ar })}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
