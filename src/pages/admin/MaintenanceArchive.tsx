import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminDataTable, type ColumnDef, type FilterDef } from "@/components/admin/AdminDataTable";
import { Badge } from "@/components/ui/badge";
import { Archive, CheckCircle2, Clock, DollarSign, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { exportTablePdf, exportTableCsv } from "@/lib/exportUtils";

const priorityConfig: Record<string, { label: string; class: string }> = {
  high: { label: "عالية", class: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  medium: { label: "متوسطة", class: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
  low: { label: "منخفضة", class: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
};

const statusConfig: Record<string, { label: string; class: string }> = {
  completed: { label: "مكتمل", class: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  pending: { label: "قيد الانتظار", class: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400" },
  in_progress: { label: "قيد التنفيذ", class: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  cancelled: { label: "ملغي", class: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
};

export default function MaintenanceArchive() {
  const { data: records = [], isLoading } = useQuery({
    queryKey: ["maintenance-archive"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_requests_archive")
        .select("*")
        .eq("is_deleted", false)
        .order("scheduled_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const totalCost = records.reduce((s: number, r: any) => s + (r.actual_cost || 0), 0);
  const completed = records.filter((r: any) => r.status === "completed").length;
  const priorities = [...new Set(records.map((r: any) => r.priority).filter(Boolean))];
  const serviceTypes = [...new Set(records.map((r: any) => r.service_type).filter(Boolean))];

  const columns: ColumnDef<any>[] = [
    {
      key: "title",
      header: "العنوان / الوصف",
      sortable: true,
      render: (row) => (
        <div className="max-w-[300px]">
          <p className="font-semibold text-sm truncate">{row.title || row.description || "-"}</p>
          {row.description && row.title && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{row.description}</p>
          )}
        </div>
      ),
    },
    {
      key: "store_id",
      header: "الفرع",
      render: (row) => (
        <span className="text-xs font-mono text-muted-foreground">
          {row.store_id?.substring(0, 8) || "-"}
        </span>
      ),
    },
    {
      key: "status",
      header: "الحالة",
      render: (row) => {
        const cfg = statusConfig[row.status] || { label: row.status, class: "bg-muted text-muted-foreground" };
        return (
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.class}`}>
            {cfg.label}
          </span>
        );
      },
    },
    {
      key: "priority",
      header: "الأولوية",
      render: (row) => {
        const cfg = priorityConfig[row.priority] || { label: row.priority || "-", class: "bg-muted text-muted-foreground" };
        return (
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${cfg.class}`}>
            {cfg.label}
          </span>
        );
      },
    },
    {
      key: "service_type",
      header: "نوع الخدمة",
      render: (row) => <span className="text-xs">{row.service_type || "-"}</span>,
    },
    {
      key: "actual_cost",
      header: "التكلفة",
      sortable: true,
      className: "text-left",
      render: (row) => (
        <span className="font-mono text-sm font-medium">
          {row.actual_cost?.toLocaleString() || 0} <span className="text-xs text-muted-foreground">ج.م</span>
        </span>
      ),
    },
    {
      key: "scheduled_date",
      header: "تاريخ الجدولة",
      sortable: true,
      render: (row) => (
        <span className="text-xs whitespace-nowrap">
          {row.scheduled_date ? format(new Date(row.scheduled_date), "dd MMM yyyy", { locale: ar }) : "-"}
        </span>
      ),
    },
    {
      key: "completion_date",
      header: "تاريخ الإتمام",
      render: (row) => (
        <span className="text-xs whitespace-nowrap">
          {row.completion_date ? format(new Date(row.completion_date), "dd MMM yyyy", { locale: ar }) : "-"}
        </span>
      ),
    },
  ];

  const filters: FilterDef[] = [
    {
      key: "priority",
      label: "الأولوية",
      options: priorities.map((p) => ({
        value: p as string,
        label: priorityConfig[p as string]?.label || (p as string),
      })),
    },
    ...(serviceTypes.length > 1
      ? [{
          key: "service_type",
          label: "نوع الخدمة",
          options: serviceTypes.map((t) => ({ value: t as string, label: t as string })),
        }]
      : []),
  ];

  const statusTabs = [
    { key: "completed", label: "مكتمل", count: completed },
    { key: "pending", label: "قيد الانتظار", count: records.filter((r: any) => r.status === "pending").length },
    { key: "in_progress", label: "قيد التنفيذ", count: records.filter((r: any) => r.status === "in_progress").length },
  ].filter((t) => t.count > 0);

  const stats = [
    { label: "إجمالي الطلبات", value: records.length, color: "text-primary", icon: <Archive className="h-4 w-4 text-primary" /> },
    { label: "مكتملة", value: completed, color: "text-green-600", icon: <CheckCircle2 className="h-4 w-4 text-green-600" /> },
    { label: "التكلفة الفعلية", value: `${totalCost.toLocaleString()} ج.م`, color: "text-amber-600", icon: <DollarSign className="h-4 w-4 text-amber-600" /> },
    { label: "قيد الانتظار", value: records.length - completed, color: "text-muted-foreground", icon: <Clock className="h-4 w-4 text-muted-foreground" /> },
  ];

  const handleExportPdf = (data: any[]) => {
    const headers = ["العنوان", "الحالة", "الأولوية", "التكلفة", "تاريخ الجدولة", "تاريخ الإتمام"];
    const rows = data.map((r) => [
      r.title || r.description || "",
      statusConfig[r.status]?.label || r.status || "",
      priorityConfig[r.priority]?.label || r.priority || "",
      `${r.actual_cost || 0} ج.م`,
      r.scheduled_date ? format(new Date(r.scheduled_date), "dd/MM/yyyy") : "",
      r.completion_date ? format(new Date(r.completion_date), "dd/MM/yyyy") : "",
    ]);
    exportTablePdf("أرشيف طلبات الصيانة", headers, rows, "maintenance-archive.pdf");
  };

  const handleExportCsv = (data: any[]) => {
    const headers = ["العنوان", "الوصف", "الحالة", "الأولوية", "نوع الخدمة", "التكلفة", "تاريخ الجدولة", "تاريخ الإتمام"];
    const rows = data.map((r) => [
      r.title || "", r.description || "", r.status || "", r.priority || "",
      r.service_type || "", String(r.actual_cost || 0),
      r.scheduled_date || "", r.completion_date || "",
    ]);
    exportTableCsv(headers, rows, "maintenance-archive.csv");
  };

  return (
    <div className="container mx-auto p-6">
      <AdminDataTable
        data={records}
        columns={columns}
        isLoading={isLoading}
        title="أرشيف طلبات الصيانة"
        subtitle={`${records.length} طلب مؤرشف`}
        icon={<Archive className="h-5 w-5" />}
        searchPlaceholder="بحث بالعنوان أو الوصف..."
        searchKeys={["title", "description"]}
        filters={filters}
        statusTabs={statusTabs}
        statusKey="status"
        stats={stats}
        onExportPdf={handleExportPdf}
        onExportCsv={handleExportCsv}
      />
    </div>
  );
}
