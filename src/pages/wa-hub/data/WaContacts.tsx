import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Phone, Users } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

export default function WaContacts() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 20;

  const { data, isLoading } = useQuery({
    queryKey: ["wa-contacts", search, page],
    queryFn: async () => {
      let query = supabase
        .from("wa_contacts")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * perPage, page * perPage - 1);

      if (search) {
        query = query.or(`phone.ilike.%${search}%,display_name.ilike.%${search}%`);
      }

      const { data, count } = await query;
      return { contacts: data || [], total: count || 0 };
    },
  });

  const totalPages = Math.ceil((data?.total || 0) / perPage);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <h1 className="text-2xl font-bold">جهات اتصال واتساب</h1>
        </div>
        <Badge variant="outline">إدارة جهات الاتصال</Badge>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="ابحث بالهاتف أو بالاسم..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="pr-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الهاتف</TableHead>
                <TableHead>معرف واتساب</TableHead>
                <TableHead>اسم العرض</TableHead>
                <TableHead>تأسيس</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    جاري التحميل...
                  </TableCell>
                </TableRow>
              ) : !data?.contacts.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    لا توجد جهات اتصال
                  </TableCell>
                </TableRow>
              ) : (
                data.contacts.map(contact => (
                  <TableRow key={contact.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-sm">{contact.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{contact.display_name || "—"}</p>
                        <p className="text-xs text-green-600">واتساب: {contact.wa_id || contact.display_name || "—"}</p>
                      </div>
                    </TableCell>
                    <TableCell>{contact.display_name || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {contact.created_at
                        ? formatDistanceToNow(new Date(contact.created_at), { locale: ar, addSuffix: true })
                        : "—"}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t">
              <p className="text-sm text-muted-foreground">
                {((page - 1) * perPage) + 1} - {Math.min(page * perPage, data?.total || 0)} من أصل {data?.total} مشاركة
              </p>
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground ml-2">لكل صفحة</span>
                <Badge variant="outline">{perPage}</Badge>
                <div className="flex gap-1 mr-4">
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(1)}>«</Button>
                  <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>‹</Button>
                  {Array.from({ length: Math.min(totalPages, 6) }, (_, i) => i + 1).map(p => (
                    <Button
                      key={p}
                      variant={p === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  ))}
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>›</Button>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(totalPages)}>»</Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
