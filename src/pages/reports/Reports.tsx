import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from "recharts";
import { TrendingUp, TrendingDown, Calendar, Download, FileText, BarChart3 } from "lucide-react";

const monthlyData = [
  { month: "يناير", requests: 45, completed: 40, revenue: 18500 },
  { month: "فبراير", requests: 52, completed: 48, revenue: 21200 },
  { month: "مارس", requests: 38, completed: 35, revenue: 16800 },
  { month: "أبريل", requests: 61, completed: 58, revenue: 24500 },
  { month: "مايو", requests: 73, completed: 68, revenue: 29200 },
  { month: "يونيو", requests: 67, completed: 62, revenue: 26800 },
];

const serviceData = [
  { name: "سباكة", value: 35 },
  { name: "كهرباء", value: 28 },
  { name: "تكييف", value: 20 },
  { name: "نجارة", value: 17 },
];

const COLORS = ["hsl(var(--primary))", "hsl(var(--warning))", "hsl(var(--chart-3))", "hsl(var(--destructive))"];

export default function Reports() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">التقارير والإحصائيات</h1>
          <p className="text-muted-foreground">تحليل شامل لأداء العمليات</p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="month">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">هذا الأسبوع</SelectItem>
              <SelectItem value="month">هذا الشهر</SelectItem>
              <SelectItem value="quarter">هذا الربع</SelectItem>
              <SelectItem value="year">هذا العام</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 ml-2" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-elegant">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-foreground">336</p>
                <p className="text-sm text-muted-foreground">إجمالي الطلبات</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-success" />
                  <span className="text-xs text-success">+12%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-success/10">
                <BarChart3 className="h-6 w-6 text-success" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-foreground">311</p>
                <p className="text-sm text-muted-foreground">طلبات مكتملة</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-success" />
                  <span className="text-xs text-success">+8%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-warning/10">
                <Calendar className="h-6 w-6 text-warning" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-foreground">25</p>
                <p className="text-sm text-muted-foreground">طلبات معلقة</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3 text-destructive" />
                  <span className="text-xs text-destructive">-5%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-2xl font-bold text-foreground">137,000</p>
                <p className="text-sm text-muted-foreground">إجمالي الإيرادات (ج.م)</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-success" />
                  <span className="text-xs text-success">+15%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance */}
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle>الأداء الشهري</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="requests" name="الطلبات" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="المكتملة" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Service Distribution */}
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle>توزيع الخدمات</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={serviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {serviceData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>اتجاه الإيرادات</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
                formatter={(value) => [`${value.toLocaleString()} ج.م`, 'الإيرادات']}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                name="الإيرادات"
                stroke="hsl(var(--warning))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--warning))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Performance Summary Table */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>ملخص الأداء التفصيلي</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-right py-3 px-4 font-medium text-foreground">الشهر</th>
                  <th className="text-right py-3 px-4 font-medium text-foreground">الطلبات</th>
                  <th className="text-right py-3 px-4 font-medium text-foreground">المكتملة</th>
                  <th className="text-right py-3 px-4 font-medium text-foreground">معدل الإنجاز</th>
                  <th className="text-right py-3 px-4 font-medium text-foreground">الإيرادات</th>
                  <th className="text-right py-3 px-4 font-medium text-foreground">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((item, index) => (
                  <tr key={index} className="border-b border-border/50">
                    <td className="py-3 px-4 text-foreground">{item.month}</td>
                    <td className="py-3 px-4 text-muted-foreground">{item.requests}</td>
                    <td className="py-3 px-4 text-muted-foreground">{item.completed}</td>
                    <td className="py-3 px-4">
                      <Badge className="bg-success/10 text-success">
                        {Math.round((item.completed / item.requests) * 100)}%
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-foreground font-medium">
                      {item.revenue.toLocaleString()} ج.م
                    </td>
                    <td className="py-3 px-4">
                      <Badge className="bg-primary/10 text-primary">
                        {item.completed === item.requests ? "مكتمل" : "جاري"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
