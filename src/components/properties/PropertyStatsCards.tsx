import { Property } from "@/hooks/useProperties";

interface PropertyStatsCardsProps {
  properties: Property[];
}

export function PropertyStatsCards({ properties }: PropertyStatsCardsProps) {
  const inactive = properties.filter(p => p.status === 'inactive').length;
  const maintenance = properties.filter(p => p.status === 'maintenance').length;
  const active = properties.filter(p => p.status === 'active').length;
  const total = properties.length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      <div className="flex flex-col items-center p-4 bg-card rounded-lg border border-border">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
          <div className="w-6 h-6 rounded-full bg-muted-foreground/30" />
        </div>
        <div className="text-2xl font-bold text-foreground">{inactive}</div>
        <div className="text-sm text-muted-foreground">غير نشطة</div>
      </div>

      <div className="flex flex-col items-center p-4 bg-card rounded-lg border border-border">
        <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mb-2">
          <div className="w-6 h-6 rounded-full bg-warning" />
        </div>
        <div className="text-2xl font-bold text-warning">{maintenance}</div>
        <div className="text-sm text-muted-foreground">تحت الصيانة</div>
      </div>

      <div className="flex flex-col items-center p-4 bg-card rounded-lg border border-border">
        <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mb-2">
          <div className="w-6 h-6 rounded-full bg-success" />
        </div>
        <div className="text-2xl font-bold text-success">{active}</div>
        <div className="text-sm text-muted-foreground">النشطة</div>
      </div>

      <div className="flex flex-col items-center p-4 bg-card rounded-lg border border-border">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div className="text-2xl font-bold text-primary">{total}</div>
        <div className="text-sm text-muted-foreground">كافة العقارات</div>
      </div>
    </div>
  );
}
