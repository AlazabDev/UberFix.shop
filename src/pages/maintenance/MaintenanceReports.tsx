import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, Calendar, Filter, RotateCcw, Eye } from "lucide-react";
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Link } from "react-router-dom";

interface StatsData {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
}

export default function MaintenanceReports() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0
  });
  const [recentRequests, setRecentRequests] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async (filterDates = false) => {
    try {
      setLoading(true);

      let query = supabase
        .from("maintenance_requests")
        .select("*");

      if (filterDates && dateFrom && dateTo) {
        query = query
          .gte("created_at", dateFrom)
          .lte("created_at", dateTo);
      }

      const { data: requests, error } = await query;

      if (error) throw error;

      // Calculate stats
      const total = requests?.length || 0;
      const completed = requests?.filter(r => r.status === "Completed").length || 0;
      const inProgress = requests?.filter(r => r.status === "InProgress").length || 0;
      const pending = requests?.filter(r => r.status === "Open").length || 0;

      setStats({ total, completed, inProgress, pending });

      // Set recent requests
      setRecentRequests(requests?.slice(0, 10) || []);

      // Calculate monthly data
      const monthlyMap = new Map();
      requests?.forEach(request => {
        const month = new Date(request.created_at).toLocaleDateString("ar-EG", { month: "short", year: "numeric" });
        monthlyMap.set(month, (monthlyMap.get(month) || 0) + 1);
      });

      const monthlyDataArray = Array.from(monthlyMap.entries()).map(([month, count]) => ({
        month,
        count
      }));

      setMonthlyData(monthlyDataArray);

    } catch (error) {
      toast.error("فشل تحميل البيانات");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = () => {
    fetchReportsData(true);
  };

  const handleResetFilter = () => {
    setDateFrom("");
    setDateTo("");
    fetchReportsData(false);
  };

  const statusColors: Record<string, string> = {
    "Completed": "#22c55e",
    "In Progress": "#3b82f6",
    "Open": "#f59e0b",
    "Cancelled": "#ef4444"
  };

  const pieData = [
    { name: "مكتمل", value: stats.completed, color: statusColors["Completed"] },
    { name: "قيد التنفيذ", value: stats.inProgress, color: statusColors["In Progress"] },
    { name: "في الانتظار", value: stats.pending, color: statusColors["Open"] },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      "Completed": "bg-green-500",
      "In Progress": "bg-blue-500",
      "Open": "bg-yellow-500",
      "Cancelled": "bg-red-500",
      "Archived": "bg-gray-500"
    };
    return <Badge className={variants[status] || "bg-gray-500"}>{status}</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">تقارير الصيانة</h1>
          <p className="text-muted-foreground">نظرة شاملة على طلبات الصيانة</p>
        </div>
        <Button>
          <FileText className="h-4 w-4 ml-2" />
          تصدير PDF
        </Button>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">من تاريخ</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">إلى تاريخ</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <Button onClick={handleApplyFilter}>
              <Filter className="h-4 w-4 ml-2" />
              تطبيق الفلتر
            </Button>
            <Button variant="outline" onClick={handleResetFilter}>
              <RotateCcw className="h-4 w-4 ml-2" />
              إعادة تعيين
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              الطلبات المكتملة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              قيد التنفيذ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.inProgress}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              في الانتظار
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              إجمالي الطلبات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">{stats.total}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>توزيع الحالات</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>عدد الطلبات الشهرية</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#8b5cf6" strokeWidth={2} name="عدد الطلبات" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>الطلبات الأخيرة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right p-3">رقم الطلب</th>
                  <th className="text-right p-3">التاريخ</th>
                  <th className="text-right p-3">الحالة</th>
                  <th className="text-right p-3">العقار</th>
                  <th className="text-right p-3">نوع الخدمة</th>
                  <th className="text-right p-3">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((request) => (
                  <tr key={request.id} className="border-b hover:bg-muted/50">
                    <td className="p-3 font-mono text-sm">
                      {request.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="p-3 text-sm">
                      {new Date(request.created_at).toLocaleDateString("ar-EG")}
                    </td>
                    <td className="p-3">{getStatusBadge(request.status)}</td>
                    <td className="p-3">{request.property_id ? "عقار محدد" : "-"}</td>
                    <td className="p-3">{request.service_type || "-"}</td>
                    <td className="p-3">
                      <Link to={`/maintenance/${request.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 ml-2" />
                          عرض
                        </Button>
                      </Link>
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
