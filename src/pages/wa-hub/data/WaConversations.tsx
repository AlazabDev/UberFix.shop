import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, MessageSquare } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

export default function WaConversations() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["wa-conversations-data", search],
    queryFn: async () => {
      const { data } = await supabase
        .from("wa_conversations")
        .select("*, wa_contacts(phone, display_name)")
        .order("last_message_at", { ascending: false });
      return data || [];
    },
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold">المحادثات</h1>
      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input placeholder="بحث..." value={search} onChange={e => setSearch(e.target.value)} className="pr-9" />
      </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>جهة الاتصال</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>آخر رسالة</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-12">جاري التحميل...</TableCell></TableRow>
              ) : !data?.length ? (
                <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-30" />لا توجد محادثات
                </TableCell></TableRow>
              ) : (
                data.map(conv => (
                  <TableRow key={conv.id}>
                    <TableCell>{conv.wa_contacts?.display_name || "—"}</TableCell>
                    <TableCell className="font-mono text-sm">{conv.wa_contacts?.phone || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={conv.status === "active" ? "default" : "secondary"}>{conv.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {conv.last_message_at ? formatDistanceToNow(new Date(conv.last_message_at), { locale: ar, addSuffix: true }) : "—"}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate("/wa-hub/inbox")}>
                        <Eye className="h-4 w-4" />
                      </Button>
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
