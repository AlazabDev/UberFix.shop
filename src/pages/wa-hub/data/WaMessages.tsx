import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MessageSquare } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function WaMessages() {
  const [page, setPage] = useState(1);
  const perPage = 20;

  const { data, isLoading } = useQuery({
    queryKey: ["wa-messages-data", page],
    queryFn: async () => {
      const { data, count } = await supabase
        .from("wa_messages")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * perPage, page * perPage - 1);
      return { messages: data || [], total: count || 0 };
    },
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold">الرسائل</h1>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الهاتف</TableHead>
                <TableHead>الاتجاه</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>المحتوى</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الزمن</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12">جاري التحميل...</TableCell></TableRow>
              ) : !data?.messages.length ? (
                <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-30" />لا توجد رسائل
                </TableCell></TableRow>
              ) : (
                data.messages.map(msg => (
                  <TableRow key={msg.id}>
                    <TableCell className="font-mono text-sm">{msg.phone || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={msg.direction === "in" ? "default" : "secondary"}>
                        {msg.direction === "in" ? "وارد" : "خارج"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{msg.msg_type}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-sm">{msg.body || "—"}</TableCell>
                    <TableCell className="text-sm">{msg.status}</TableCell>
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
