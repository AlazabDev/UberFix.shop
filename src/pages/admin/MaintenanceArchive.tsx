import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Archive, Calendar, DollarSign, CheckCircle2, Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function MaintenanceArchive() {
  const [search, setSearch] = useState("");

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["maintenance-archive"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_requests_archive")
        .select("*")
        .eq("is_deleted", false)
        .order("scheduled_date", { ascending: false })
        .limit(500);
      if (error) throw error;
      return data;
    },
  });

  const filtered = records.filter(
    (r: any) =>
      r.description?.toLowerCase().includes(search.toLowerCase()) ||
      r.title?.toLowerCase().includes(search.toLowerCase())
  );

  const totalCost = records.reduce((s: number, r: any) => s + (r.actual_cost || 0), 0);
  const completed = records.filter((r: any) => r.status === "completed").length;

  const priorityBadge = (p: string) => {
    const map: Record<string, string> = {
      high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      medium: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
      low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    };
    return map[p] || "bg-muted text-muted-foreground";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Archive className="h-8 w-8 text-primary" />
            أرشيف طلبات الصيانة
          </h1>
          <p className="text-muted-foreground mt-1">{records.length} طلب مؤرشف</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="بحث..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-9" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "إجمالي الطلبات", value: records.length, icon: Archive, color: "text-primary" },
          { label: "مكتملة", value: completed, icon: CheckCircle2, color: "text-green-600" },
          { label: "التكلفة الفعلية", value: `${totalCost.toLocaleString()} ج.م`, icon: DollarSign, color: "text-amber-600" },
          { label: "قيد الانتظار", value: records.length - completed, icon: Clock, color: "text-muted-foreground" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الفرع</TableHead>
                    <TableHead>الوصف</TableHead>
                    <TableHead>الأولوية</TableHead>
                    <TableHead>التكلفة</TableHead>
                    <TableHead>تاريخ الجدولة</TableHead>
                    <TableHead>الإتمام</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.slice(0, 100).map((r: any) => (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium whitespace-nowrap">{r.store_id?.substring(0, 8) || "-"}</TableCell>
                      <TableCell className="max-w-[350px] truncate">{r.description || r.title}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityBadge(r.priority)}`}>
                          {r.priority === "high" ? "عالية" : r.priority === "medium" ? "متوسطة" : "منخفضة"}
                        </span>
                      </TableCell>
                      <TableCell className="font-mono">{r.actual_cost?.toLocaleString() || 0} ج.م</TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {r.scheduled_date ? format(new Date(r.scheduled_date), "dd MMM yyyy", { locale: ar }) : "-"}
                      </TableCell>
                      <TableCell className="text-sm whitespace-nowrap">
                        {r.completion_date ? format(new Date(r.completion_date), "dd MMM yyyy", { locale: ar }) : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filtered.length > 100 && (
                <p className="p-3 text-sm text-muted-foreground text-center">عرض أول 100 من {filtered.length}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
