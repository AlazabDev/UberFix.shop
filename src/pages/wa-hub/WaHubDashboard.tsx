import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Phone, MessageSquare, AlertTriangle, Zap, ChevronLeft,
  Plus, Webhook, Key, Copy, ExternalLink
} from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const kpiCards = [
  { label: "الأرقام", icon: Phone, key: "numbers" },
  { label: "الرسائل", icon: MessageSquare, key: "messages" },
  { label: "السجلات", icon: AlertTriangle, key: "logs" },
  { label: "سير العمل", icon: Zap, key: "workflows" },
];

const quickActions = [
  { label: "أضف رقم الهاتف", desc: "نحن نوفره لك", icon: Phone, path: "/wa-hub/numbers/add" },
  { label: "إنشاء مفتاح API", desc: "التكامل عبر واجهة برمجة النظ...", icon: Key, path: "/wa-hub/api-keys" },
  { label: "إنشاء webhook", desc: "احصل على إشعارات بالرسائل", icon: Webhook, path: "/wa-hub/webhooks" },
  { label: "إنشاء سير العمل", desc: "وكلاء الذكاء الاصطناعي والأ...", icon: Zap, path: "/wa-hub/flows" },
];

export default function WaHubDashboard() {
  const navigate = useNavigate();
  const [dateRange] = useState("هذا الأسبوع");

  const { data: stats } = useQuery({
    queryKey: ["wa-hub-stats"],
    queryFn: async () => {
      const [numbers, messages] = await Promise.all([
        supabase.from("wa_numbers").select("id", { count: "exact", head: true }),
        supabase.from("wa_messages").select("id", { count: "exact", head: true }),
      ]);
      return {
        numbers: numbers.count || 0,
        messages: messages.count || 0,
        logs: 0,
        workflows: 0,
      };
    },
  });

  const { data: recentMessages } = useQuery({
    queryKey: ["wa-hub-recent-messages"],
    queryFn: async () => {
      const { data } = await supabase
        .from("wa_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      return data || [];
    },
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">لوحة المعلومات</h1>
          <Badge variant="outline">الترقية</Badge>
          <Badge variant="secondary">مجاني</Badge>
        </div>
        <div className="flex items-center gap-2">
          {["اليوم", "هذا الأسبوع", "هذا الشهر"].map(r => (
            <Button key={r} variant={dateRange === r ? "default" : "outline"} size="sm">{r}</Button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map(card => (
          <Card key={card.key} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-3xl font-bold mt-1">
                    {stats?.[card.key as keyof typeof stats] ?? 0}
                  </p>
                  {card.key === "numbers" && <p className="text-xs text-muted-foreground mt-1">{stats?.numbers || 0} التعايش</p>}
                  {card.key === "messages" && <p className="text-xs text-muted-foreground mt-1">↓ وارد / ↑ خارج</p>}
                </div>
                <ChevronLeft className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Messages Chart placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">الرسائل اليومية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg">
              <div className="text-center text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">مخطط الرسائل اليومية</p>
                <p className="text-xs">سيظهر هنا عند توفر بيانات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground text-left">إجراءات سريعة</p>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map(action => (
              <Card
                key={action.label}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(action.path)}
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <action.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{action.label}</p>
                    <p className="text-xs text-muted-foreground">{action.desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Docs card */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="h-4 w-4" />
                <span className="text-sm font-medium">الوثائق</span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                بالنسبة لوكلاء الذكاء الاصطناعي، قم بتثبيت مهارات:
              </p>
              <div className="bg-muted p-2 rounded text-xs font-mono flex items-center justify-between" dir="ltr">
                <code>npx skills add @kapso/agent-skills</code>
                <Button variant="ghost" size="icon" className="h-6 w-6"><Copy className="h-3 w-3" /></Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Messages Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">الرسائل الحديثة</CardTitle>
            <Button variant="link" size="sm" onClick={() => navigate("/wa-hub/inbox")}>
              عرض صندوق الوارد
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الهاتف</TableHead>
                <TableHead>الاتصال</TableHead>
                <TableHead>الإخراج</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>المحتوى</TableHead>
                <TableHead>الزمن</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!recentMessages || recentMessages.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-12">
                    لا توجد رسائل حديثة
                  </TableCell>
                </TableRow>
              ) : (
                recentMessages.map(msg => (
                  <TableRow key={msg.id}>
                    <TableCell className="font-mono text-sm">{msg.phone || "—"}</TableCell>
                    <TableCell>{msg.contact_name || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={msg.direction === "in" ? "default" : "secondary"}>
                        {msg.direction === "in" ? "الوارد" : "الخارج"}
                      </Badge>
                    </TableCell>
                    <TableCell>{msg.status || "—"}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{msg.body || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {msg.created_at ? new Date(msg.created_at).toLocaleString("ar-EG") : "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
