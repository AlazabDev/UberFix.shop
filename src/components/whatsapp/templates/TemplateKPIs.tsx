import { Card, CardContent } from '@/components/ui/card';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  PauseCircle,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import type { TemplateStats } from '@/hooks/useWhatsAppTemplates';
import { Skeleton } from '@/components/ui/skeleton';

interface TemplateKPIsProps {
  stats: TemplateStats;
  isLoading?: boolean;
}

export function TemplateKPIs({ stats, isLoading }: TemplateKPIsProps) {
  const kpis = [
    {
      label: 'إجمالي القوالب',
      value: stats.total,
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'معتمدة',
      value: stats.approved,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'قيد المراجعة',
      value: stats.pending + stats.submitted,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      label: 'مرفوضة',
      value: stats.rejected,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      label: 'موقوفة',
      value: stats.paused + stats.disabled,
      icon: PauseCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      label: 'مسودات',
      value: stats.draft,
      icon: FileText,
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    },
  ];

  const qualityKpis = [
    {
      label: 'جودة عالية',
      value: stats.quality_high,
      icon: TrendingUp,
      color: 'text-green-600',
    },
    {
      label: 'جودة متوسطة',
      value: stats.quality_medium,
      icon: Minus,
      color: 'text-yellow-600',
    },
    {
      label: 'جودة منخفضة',
      value: stats.quality_low,
      icon: TrendingDown,
      color: 'text-red-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 mb-6">
      {/* Main KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quality KPIs */}
      <div className="flex gap-4 flex-wrap">
        <span className="text-sm text-muted-foreground flex items-center">الجودة:</span>
        {qualityKpis.map((kpi) => (
          <div key={kpi.label} className="flex items-center gap-2 text-sm">
            <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
            <span className={kpi.color}>{kpi.value}</span>
            <span className="text-muted-foreground">{kpi.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
