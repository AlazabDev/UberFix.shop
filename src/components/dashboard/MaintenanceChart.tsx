import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DonutChart, LineChart } from "@tremor/react";

const monthlyData = [
  { month: "مارس", requests: 0 },
  { month: "أبريل", requests: 0 },
  { month: "مايو", requests: 0 },
  { month: "يونيو", requests: 0 },
  { month: "يوليو", requests: 0 },
  { month: "أغسطس", requests: 2 }
];

const statusData = [
  { name: "في انتظار الموافقة", value: 0, color: "#F97316" },
  { name: "قيد التنفيذ", value: 1, color: "#1E40AF" },
  { name: "مكتملة", value: 0, color: "#059669" }
];

export const MaintenanceChart = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="maintenance-chart">
      {/* Line Chart */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">إحصائيات طلبات الصيانة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <LineChart
              className="h-full"
              data={monthlyData}
              index="month"
              categories={["requests"]}
              colors={["indigo"]}
              valueFormatter={(value) => value.toLocaleString('ar-EG')}
              yAxisWidth={50}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pie Chart */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">حالة الطلبات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <DonutChart
              className="h-full"
              data={statusData}
              index="name"
              category="value"
              colors={["amber", "indigo", "emerald"]}
              valueFormatter={(value) => value.toString()}
            />
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4">
            {statusData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
