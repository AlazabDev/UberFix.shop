import { useMemo, useState } from "react";
import Papa from "papaparse";
import { useMutation } from "@tanstack/react-query";

import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload } from "lucide-react";

type ParsedRow = Record<string, unknown>;

type NormalizedBranchRow = {
  name: string;
  address: string | null;
  city: string | null;
  code?: string | null;
  opening_hours?: string | null;
};

function normalizeHeader(h: string) {
  return h.trim().toLowerCase().replace(/\s+/g, "_");
}

function pickFirst(row: ParsedRow, keys: string[]): string | null {
  for (const k of keys) {
    const v = row[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

function toNormalizedRows(rows: ParsedRow[]): NormalizedBranchRow[] {
  return rows
    .map((raw) => {
      const name = pickFirst(raw, ["name", "branch", "branch_name", "branchname"]);
      if (!name) return null;

      const address = pickFirst(raw, ["address", "branch_address", "location", "street"]) ?? null;
      const city = pickFirst(raw, ["city", "governorate", "area"]) ?? null;
      const code = pickFirst(raw, ["code", "branch_code", "id"]) ?? undefined;
      const opening_hours = pickFirst(raw, ["opening_hours", "hours", "working_hours"]) ?? undefined;

      return { name, address, city, code, opening_hours } satisfies NormalizedBranchRow;
    })
    .filter(Boolean) as NormalizedBranchRow[];
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export default function CompanyBranchImport() {
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState("Abuauf");
  const [billingCycle, setBillingCycle] = useState<string>("");
  const [pricingModel, setPricingModel] = useState<string>("");
  const [csvFileName, setCsvFileName] = useState<string>("");
  const [rawRows, setRawRows] = useState<ParsedRow[]>([]);
  const [skipExisting, setSkipExisting] = useState(true);

  const normalizedRows = useMemo(() => toNormalizedRows(rawRows), [rawRows]);

  const importMutation = useMutation({
    mutationFn: async () => {
      if (!companyName.trim()) throw new Error("اسم العميل مطلوب");
      if (normalizedRows.length === 0) throw new Error("لا توجد صفوف صالحة في ملف CSV");

      // 1) Find or create company
      const { data: existingCompany, error: existingCompanyError } = await supabase
        .from("companies")
        .select("id,name")
        .ilike("name", companyName.trim())
        .limit(1)
        .maybeSingle();

      if (existingCompanyError) throw existingCompanyError;

      let companyId = existingCompany?.id;
      if (!companyId) {
        const { data: created, error: createError } = await supabase
          .from("companies")
          .insert([
            {
              name: companyName.trim(),
              billing_cycle: billingCycle.trim() || null,
              pricing_model: pricingModel.trim() || null,
            },
          ])
          .select("id")
          .single();
        if (createError) throw createError;
        companyId = created.id;
      }

      // 2) Optionally filter out existing branches by name
      let rowsToInsert = normalizedRows;
      if (skipExisting) {
        const { data: existingBranches, error: existingBranchesError } = await supabase
          .from("branches")
          .select("name")
          .eq("company_id", companyId);
        if (existingBranchesError) throw existingBranchesError;

        const existingNames = new Set(
          (existingBranches ?? [])
            .map((b) => (typeof b.name === "string" ? b.name.trim().toLowerCase() : ""))
            .filter(Boolean)
        );
        rowsToInsert = rowsToInsert.filter((r) => !existingNames.has(r.name.trim().toLowerCase()));
      }

      // 3) Insert in chunks (avoid request limits)
      const batches = chunk(rowsToInsert, 250);
      let inserted = 0;

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        const payload = batch.map((r, idx) => {
          const generatedCode = `ABU-${String(inserted + idx + 1).padStart(4, "0")}`;
          return {
            company_id: companyId,
            name: r.name,
            address: r.address,
            city: r.city,
            code: (r.code && r.code.trim()) || generatedCode,
            opening_hours: r.opening_hours || null,
          };
        });

        const { error: insertError } = await supabase.from("branches").insert(payload);
        if (insertError) throw insertError;
        inserted += payload.length;
      }

      return {
        companyId,
        companyCreated: !existingCompany,
        inserted,
        totalParsed: normalizedRows.length,
        skipped: normalizedRows.length - rowsToInsert.length,
      };
    },
    onSuccess: (res) => {
      toast({
        title: "✅ تم الاستيراد بنجاح",
        description: `تم إضافة ${res.inserted} فرع${res.skipped ? ` (تخطي ${res.skipped} موجود)` : ""}`,
      });
    },
    onError: (err: any) => {
      toast({
        title: "❌ فشل الاستيراد",
        description: err?.message || "حدث خطأ غير متوقع",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = async (file: File | null) => {
    if (!file) return;
    setCsvFileName(file.name);
    const text = await file.text();

    const result = Papa.parse<ParsedRow>(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => normalizeHeader(h),
    });

    if (result.errors?.length) {
      toast({
        title: "⚠️ مشكلة في CSV",
        description: result.errors[0]?.message || "تعذر قراءة الملف",
        variant: "destructive",
      });
    }

    setRawRows((result.data || []).filter(Boolean));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">استيراد عميل + فروع (دفعة واحدة)</CardTitle>
          <CardDescription>
            ارفع ملف CSV لإضافة شركة (مثلاً Abuauf) وفروعها إلى جدول الشركات/الفروع.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">اسم العميل *</Label>
              <Input
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Abuauf"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billingCycle">دورة الفوترة (اختياري)</Label>
              <Input
                id="billingCycle"
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value)}
                placeholder="monthly / quarterly ..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricingModel">نموذج التسعير (اختياري)</Label>
              <Input
                id="pricingModel"
                value={pricingModel}
                onChange={(e) => setPricingModel(e.target.value)}
                placeholder="subscription / per_request ..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="csv">ملف CSV *</Label>
            <Input
              id="csv"
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
            <div className="text-sm text-muted-foreground">
              الأعمدة المقبولة: name / branch / branch_name + (address) + (city) + (code اختياري)
              {csvFileName ? ` — الملف: ${csvFileName}` : ""}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="skipExisting"
              type="checkbox"
              checked={skipExisting}
              onChange={(e) => setSkipExisting(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="skipExisting">تخطي الفروع الموجودة لنفس العميل (حسب الاسم)</Label>
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="text-sm text-muted-foreground">
              صفوف مقروءة: {rawRows.length} — صفوف صالحة للاستيراد: {normalizedRows.length}
            </div>
            <Button
              onClick={() => importMutation.mutate()}
              disabled={importMutation.isPending || normalizedRows.length === 0 || !companyName.trim()}
              className="gap-2"
            >
              {importMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              تنفيذ الاستيراد
            </Button>
          </div>

          {normalizedRows.length > 0 && (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>المدينة</TableHead>
                    <TableHead>العنوان</TableHead>
                    <TableHead>الكود</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {normalizedRows.slice(0, 10).map((r, idx) => (
                    <TableRow key={`${r.name}-${idx}`}>
                      <TableCell className="font-medium">{r.name}</TableCell>
                      <TableCell>{r.city || "-"}</TableCell>
                      <TableCell className="max-w-[420px] truncate">{r.address || "-"}</TableCell>
                      <TableCell className="font-mono text-sm">{r.code || "(سيتم توليده)"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="p-3 text-sm text-muted-foreground">
                عرض أول 10 صفوف فقط للمعاينة.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
