import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Plus, Eye, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

export default function WaNumbersConnected() {
  const navigate = useNavigate();

  const { data: numbers, isLoading } = useQuery({
    queryKey: ["wa-numbers-connected"],
    queryFn: async () => {
      const { data } = await supabase
        .from("wa_numbers")
        .select("*")
        .eq("number_type", "connected")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">الأرقام المتصلة</h1>
        <Button onClick={() => navigate("/wa-hub/numbers/add")} className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 ml-2" />
          أضف رقم الهاتف
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الهاتف</TableHead>
                <TableHead>معرف الرقم</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تأسيس</TableHead>
                <TableHead>الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">جاري التحميل...</TableCell></TableRow>
              ) : !numbers?.length ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16">
                    <Phone className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                    <p className="text-lg font-medium">لا أرقام متصلة</p>
                    <p className="text-sm text-muted-foreground mb-4">قم بتوصيل رقم هاتف للبدء</p>
                    <Button onClick={() => navigate("/wa-hub/numbers/add")} className="bg-green-600 hover:bg-green-700">
                      <Plus className="h-4 w-4 ml-2" />أضف رقمك الأول
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                numbers.map(num => (
                  <TableRow key={num.id}>
                    <TableCell className="font-mono">{num.display_number}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{num.phone_number_id || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={num.status === "active" ? "default" : "secondary"}>{num.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(num.created_at), { locale: ar, addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
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
