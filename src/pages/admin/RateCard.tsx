import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";

const TRADE_NAMES: Record<number, string> = {
  1: "كهرباء عامة",
  2: "سباكة",
  3: "نجارة",
  4: "ألمونيوم وزجاج",
  5: "تكييف وتبريد",
  6: "غسالات/ثلاجات",
  7: "مولدات وUPS",
  8: "أنظمة أمنية",
  9: "أسقف معلقة",
  10: "دهانات",
  11: "أرضيات",
  12: "حدادة",
  13: "لافتات إعلانية",
  14: "تشطيبات",
  15: "أعمال مدنية",
  16: "عزل مائي وحراري",
  17: "أبواب أوتوماتيك",
  18: "السلامة والحريق",
  19: "هاند مان",
  20: "صيانة وقائية",
};

export default function RateCard() {
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["rate-items"],
    queryFn: async () => {
      const { data, error } = await supabase.from("rate_items").select("*").order("trade_id");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <DollarSign className="h-8 w-8 text-primary" />
          بطاقة الأسعار
        </h1>
        <p className="text-muted-foreground mt-1">أسعار الخدمات حسب التخصص</p>
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
                  <TableRow className="bg-muted/50">
                    <TableHead>#</TableHead>
                    <TableHead>التخصص</TableHead>
                    <TableHead>ملاحظات</TableHead>
                    <TableHead className="text-center">سعر الساعة</TableHead>
                    <TableHead className="text-center">بعد الدوام</TableHead>
                    <TableHead className="text-center">أقل ساعات</TableHead>
                    <TableHead className="text-center">رسم الانتقال</TableHead>
                    <TableHead className="text-center">أقل فاتورة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-muted-foreground">{item.trade_id}</TableCell>
                      <TableCell className="font-medium whitespace-nowrap">
                        {TRADE_NAMES[item.trade_id] || `تخصص ${item.trade_id}`}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{item.notes}</TableCell>
                      <TableCell className="text-center font-mono font-bold text-primary">{item.normal_hourly} ج.م</TableCell>
                      <TableCell className="text-center font-mono text-amber-600">{item.after_hours_hourly} ج.م</TableCell>
                      <TableCell className="text-center">{item.min_billable_hours} ساعة</TableCell>
                      <TableCell className="text-center font-mono">{item.trip_charge} ج.م</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-mono">{item.min_invoice} ج.م</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
