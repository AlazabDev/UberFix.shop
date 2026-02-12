import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, RefreshCw, Send, MoreHorizontal } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function WaTemplates() {
  const [search, setSearch] = useState("");

  const { data: templates, isLoading } = useQuery({
    queryKey: ["wa-templates", search],
    queryFn: async () => {
      let query = supabase.from("wa_templates").select("*").order("created_at", { ascending: false });
      if (search) query = query.ilike("name", `%${search}%`);
      const { data } = await query;
      return data || [];
    },
  });

  const getCategoryBadge = (cat: string | null) => {
    switch (cat?.toUpperCase()) {
      case "UTILITY": return <Badge variant="outline">UTILITY</Badge>;
      case "MARKETING": return <Badge className="bg-blue-100 text-blue-700 border-blue-200">MARKETING</Badge>;
      case "AUTHENTICATION": return <Badge className="bg-purple-100 text-purple-700 border-purple-200">AUTH</Badge>;
      default: return <Badge variant="outline">{cat}</Badge>;
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status?.toUpperCase()) {
      case "APPROVED": return <Badge className="bg-green-100 text-green-700">تمت الموافقة</Badge>;
      case "PENDING": return <Badge className="bg-yellow-100 text-yellow-700">قيد المراجعة</Badge>;
      case "REJECTED": return <Badge className="bg-red-100 text-red-700">مرفوض</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">القوالب</h1>
        <div className="flex gap-2">
          <Button variant="outline"><RefreshCw className="h-4 w-4 ml-2" />مزامنة</Button>
          <Button className="bg-green-600 hover:bg-green-700"><Plus className="h-4 w-4 ml-2" />اصنع +</Button>
        </div>
      </div>

      {/* Phone number selector */}
      <Select defaultValue="all">
        <SelectTrigger className="w-64">
          <SelectValue placeholder="اختر رقم الهاتف" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">جميع الأرقام</SelectItem>
        </SelectContent>
      </Select>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="بحث القوالب" value={search} onChange={e => setSearch(e.target.value)} className="pr-9" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-40"><SelectValue placeholder="جميع الحالات" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="APPROVED">تمت الموافقة</SelectItem>
            <SelectItem value="PENDING">قيد المراجعة</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-40"><SelectValue placeholder="جميع الفئات" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الفئات</SelectItem>
            <SelectItem value="UTILITY">UTILITY</SelectItem>
            <SelectItem value="MARKETING">MARKETING</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الفئة</TableHead>
                <TableHead>اللغة</TableHead>
                <TableHead>معاينة</TableHead>
                <TableHead>إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12">جاري التحميل...</TableCell></TableRow>
              ) : !templates?.length ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">لا توجد قوالب. قم بالمزامنة من Meta.</TableCell></TableRow>
              ) : (
                templates.map(t => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.name}</TableCell>
                    <TableCell>{getStatusBadge(t.status)}</TableCell>
                    <TableCell>{getCategoryBadge(t.category)}</TableCell>
                    <TableCell><Badge variant="outline">{t.language}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">—</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Send className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                      </div>
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
