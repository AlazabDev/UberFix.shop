import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

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
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis width={50} className="text-xs" />
                <Tooltip 
                  formatter={(value: number) => [value.toLocaleString('ar-EG'), 'الطلبات']}
                  contentStyle={{ direction: 'rtl' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="requests" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  dot={{ fill: '#6366f1' }}
                />
              </LineChart>
            </ResponsiveContainer>
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
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [value.toString(), '']}
                  contentStyle={{ direction: 'rtl' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
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