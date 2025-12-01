import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Clock, AlertCircle, FileText } from "lucide-react";

interface MaintenanceStatsProps {
  stats: {
    total: number;
    open: number;
    inProgress: number;
    completed: number;
    overdue: number;
  };
}

export function MaintenanceStats({ stats }: MaintenanceStatsProps) {
  const statCards = [
    {
      title: "إجمالي الطلبات",
      value: stats.total,
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "طلبات مفتوحة",
      value: stats.open,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "قيد التنفيذ",
      value: stats.inProgress,
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      title: "مكتملة",
      value: stats.completed,
      icon: CheckCircle,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      title: "متأخرة",
      value: stats.overdue,
      icon: AlertCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {statCards.map((stat) => (
        <Card key={stat.title} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
            <p className="text-3xl font-bold text-foreground">{stat.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
