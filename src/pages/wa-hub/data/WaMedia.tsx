import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Copy, Download, Trash2, Image as ImageIcon } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

const timeFilters = ["كل الزمن", "اليوم", "آخر 7 أيام", "آخر 30 يوماً"];

export default function WaMedia() {
  const [timeFilter, setTimeFilter] = useState("كل الزمن");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const perPage = 50;

  const { data, isLoading } = useQuery({
    queryKey: ["wa-media", timeFilter, typeFilter, page],
    queryFn: async () => {
      let query = supabase
        .from("wa_media")
        .select("*", { count: "exact" })
        .is("deleted_at", null)
        .order("received_at", { ascending: false })
        .range((page - 1) * perPage, page * perPage - 1);

      if (typeFilter !== "all") {
        query = query.eq("media_type", typeFilter);
      }

      const { data, count } = await query;
      return { media: data || [], total: count || 0 };
    },
  });

  const totalPages = Math.ceil((data?.total || 0) / perPage);

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} بايت`;
    return `${(bytes / 1024).toFixed(1)} كيلوبايت`;
  };

  const getTypeBadge = (type: string | null) => {
    switch (type) {
      case "image": return <Badge className="bg-green-600 text-white">صورة</Badge>;
      case "video": return <Badge className="bg-blue-600 text-white">الفيديو</Badge>;
      case "audio": return <Badge className="bg-purple-600 text-white">صوت</Badge>;
      case "document": return <Badge className="bg-orange-600 text-white">مستند</Badge>;
      default: return <Badge variant="outline">{type || "—"}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">واتساب ميديا</h1>
        <p className="text-sm text-muted-foreground mt-1">
          تصفح المرفقات الإعلامية عبر جميع المحادثات. قم بتنزيل أو إزالة الوسائط دون حذف الرسالة الأصلية.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="جميع الأنواع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الأنواع</SelectItem>
            <SelectItem value="image">صورة</SelectItem>
            <SelectItem value="video">فيديو</SelectItem>
            <SelectItem value="audio">صوت</SelectItem>
            <SelectItem value="document">مستند</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">مجموعة مخصصة</Button>
        <div className="flex gap-1">
          {timeFilters.map(f => (
            <Button
              key={f}
              variant={timeFilter === f ? "default" : "ghost"}
              size="sm"
              onClick={() => { setTimeFilter(f); setPage(1); }}
            >
              {f}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الرسالة</TableHead>
                <TableHead>الملف</TableHead>
                <TableHead>الحجم</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>تم الاستلام</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : !data?.media.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p>لا توجد وسائط</p>
                  </TableCell>
                </TableRow>
              ) : (
                data.media.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-mono">{item.id.slice(0, 8)}</p>
                        <p className="text-xs text-green-600">{item.phone_number_id || "—"}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{item.filename || "—"}</p>
                        <p className="text-xs text-muted-foreground">{item.mime_type || "—"}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{formatSize(item.size_bytes)}</TableCell>
                    <TableCell>{getTypeBadge(item.media_type)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.received_at ? new Date(item.received_at).toLocaleString("ar-EG") : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Copy className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7"><Download className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                {((page - 1) * perPage) + 1} - {Math.min(page * perPage, data?.total || 0)} من أصل {data?.total} مشاركة
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(1)}>«</Button>
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</Button>
                {Array.from({ length: Math.min(totalPages, 6) }, (_, i) => i + 1).map(p => (
                  <Button key={p} variant={p === page ? "default" : "outline"} size="sm" onClick={() => setPage(p)}>{p}</Button>
                ))}
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>›</Button>
                <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>»</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
