import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, Plus, ExternalLink, Trash2, HelpCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

export default function WaNumbersSandbox() {
  const { data: numbers, isLoading } = useQuery({
    queryKey: ["wa-numbers-sandbox"],
    queryFn: async () => {
      const { data } = await supabase
        .from("wa_numbers")
        .select("*")
        .eq("number_type", "sandbox")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">رقم صندوق الرمل</h1>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <HelpCircle className="h-4 w-4 ml-1" />ما هذا؟
          </Button>
        </div>
        <Badge variant="outline">اختبر رسائل واتساب في بيئة صندوق رمل</Badge>
      </div>

      {/* Sandbox info card */}
      <Card className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-green-600" />
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">صندوق الرمل: +56920403095</span>
              <span className="text-muted-foreground">|</span>
              <a href="#" className="text-green-600 text-sm flex items-center gap-1">
                رسالة على واتساب <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            أضف رقم هاتفك أدناه لتبدأ في إرسال الرسائل النصية برقم صندوق الرمل
          </p>
        </CardContent>
      </Card>

      {/* Start test session */}
      <Button className="bg-green-600 hover:bg-green-700">
        <Plus className="h-4 w-4 ml-2" />
        ابدأ جلسة الاختبار
      </Button>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الإجراءات</TableHead>
                <TableHead>تأسيس</TableHead>
                <TableHead>تم تفعيله</TableHead>
                <TableHead>رمز التفعيل</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>التكوين</TableHead>
                <TableHead>رقم الهاتف</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-12 text-muted-foreground">جاري التحميل...</TableCell></TableRow>
              ) : !numbers?.length ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    لم يتم العثور على جلسات صندوق مفتوح. أضف رقم هاتفك لتبدأ في إرسال الرسائل النصية برقم صندوق الرمل.
                  </TableCell>
                </TableRow>
              ) : (
                numbers.map(num => (
                  <TableRow key={num.id}>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(num.created_at), { locale: ar, addSuffix: true })}
                    </TableCell>
                    <TableCell>{num.activated_at ? "نعم" : "ليس بعد"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">{num.activation_code || "—"}</span>
                        <a href="#" className="text-green-600 text-xs flex items-center gap-1">
                          مفتوح <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">قيد التفعيل</Badge>
                    </TableCell>
                    <TableCell>صندوق الرمل</TableCell>
                    <TableCell className="font-mono">{num.display_number}</TableCell>
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
