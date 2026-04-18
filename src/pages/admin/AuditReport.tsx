import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShieldAlert,
  AlertTriangle,
  Info,
  FileSearch,
  Download,
  Filter,
} from "lucide-react";
import {
  AUDIT_FINDINGS,
  AUDIT_AREA_LABELS,
  AUDIT_SEVERITY_LABELS,
  API_CONTRACTS,
  type AuditSeverity,
  type AuditFinding,
} from "@/lib/audit/auditFindings";
import { cn } from "@/lib/utils";

const SEVERITY_STYLES: Record<
  AuditSeverity,
  { badge: string; icon: typeof ShieldAlert; ring: string }
> = {
  critical: {
    badge: "bg-destructive/10 text-destructive border-destructive/30",
    icon: ShieldAlert,
    ring: "border-r-4 border-r-destructive",
  },
  major: {
    badge: "bg-warning/10 text-warning border-warning/30",
    icon: AlertTriangle,
    ring: "border-r-4 border-r-warning",
  },
  minor: {
    badge: "bg-muted text-muted-foreground border-border",
    icon: Info,
    ring: "border-r-4 border-r-muted-foreground/40",
  },
};

const CONTRACT_STATUS_STYLES = {
  ok: "bg-success/10 text-success border-success/30",
  weak: "bg-warning/10 text-warning border-warning/30",
  deprecated: "bg-destructive/10 text-destructive border-destructive/30",
} as const;

export default function AuditReport() {
  const [severityFilter, setSeverityFilter] = useState<AuditSeverity | "all">(
    "all"
  );

  const counts = useMemo(() => {
    return AUDIT_FINDINGS.reduce(
      (acc, f) => {
        acc[f.severity]++;
        acc.total++;
        return acc;
      },
      { critical: 0, major: 0, minor: 0, total: 0 } as Record<
        AuditSeverity | "total",
        number
      >
    );
  }, []);

  const filtered: AuditFinding[] = useMemo(() => {
    if (severityFilter === "all") return AUDIT_FINDINGS;
    return AUDIT_FINDINGS.filter((f) => f.severity === severityFilter);
  }, [severityFilter]);

  const exportJson = () => {
    const blob = new Blob(
      [JSON.stringify({ findings: AUDIT_FINDINGS, contracts: API_CONTRACTS }, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `uberfix-audit-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <FileSearch className="h-7 w-7 text-primary" />
            تقرير التدقيق الداخلي — UberFix
          </h1>
          <p className="text-sm text-muted-foreground">
            مراجعة ما قبل الإنتاج. كل ملاحظة مرتبطة بمسار ملف حقيقي في الكود
            الحالي مع سبب الخطورة وطريقة الإصلاح داخل المشروع نفسه.
          </p>
        </div>
        <Button variant="outline" onClick={exportJson} className="gap-2 self-start">
          <Download className="h-4 w-4" />
          تصدير JSON
        </Button>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard
          label="إجمالي الملاحظات"
          value={counts.total}
          tone="muted"
        />
        <SummaryCard
          label="حرجة"
          value={counts.critical}
          tone="critical"
          onClick={() => setSeverityFilter("critical")}
          active={severityFilter === "critical"}
        />
        <SummaryCard
          label="كبيرة"
          value={counts.major}
          tone="major"
          onClick={() => setSeverityFilter("major")}
          active={severityFilter === "major"}
        />
        <SummaryCard
          label="بسيطة"
          value={counts.minor}
          tone="minor"
          onClick={() => setSeverityFilter("minor")}
          active={severityFilter === "minor"}
        />
      </div>

      <Tabs defaultValue="findings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="findings">الملاحظات</TabsTrigger>
          <TabsTrigger value="contracts">عقود الـ API</TabsTrigger>
        </TabsList>

        {/* Findings */}
        <TabsContent value="findings" className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            {(["all", "critical", "major", "minor"] as const).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={severityFilter === s ? "default" : "outline"}
                onClick={() => setSeverityFilter(s)}
              >
                {s === "all" ? "الكل" : AUDIT_SEVERITY_LABELS[s]}
              </Button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                لا توجد ملاحظات بهذا التصنيف حالياً.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((f) => (
                <FindingCard key={f.id} finding={f} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Contracts */}
        <TabsContent value="contracts" className="space-y-3">
          {API_CONTRACTS.map((c) => (
            <Card key={c.name}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2 flex-wrap">
                  <CardTitle className="text-base font-mono">
                    {c.method} /{c.name}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={cn(CONTRACT_STATUS_STYLES[c.contractStatus])}
                  >
                    {c.contractStatus === "ok"
                      ? "متوافق"
                      : c.contractStatus === "weak"
                      ? "ضعيف"
                      : "مهجور"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <ContractRow label="Payload" value={c.expectedPayload} mono />
                <ContractRow label="Response" value={c.expectedResponse} mono />
                <ContractRow
                  label="Callers"
                  value={c.callers.join(" • ")}
                  mono
                />
                <ContractRow label="ملاحظات" value={c.notes} />
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
  onClick,
  active,
}: {
  label: string;
  value: number;
  tone: "critical" | "major" | "minor" | "muted";
  onClick?: () => void;
  active?: boolean;
}) {
  const toneClass =
    tone === "critical"
      ? "text-destructive"
      : tone === "major"
      ? "text-warning"
      : tone === "minor"
      ? "text-muted-foreground"
      : "text-foreground";
  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer transition-colors",
        onClick && "hover:bg-muted/50",
        active && "ring-2 ring-primary"
      )}
    >
      <CardContent className="py-4 text-center">
        <div className={cn("text-3xl font-bold", toneClass)}>{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{label}</div>
      </CardContent>
    </Card>
  );
}

function FindingCard({ finding }: { finding: AuditFinding }) {
  const style = SEVERITY_STYLES[finding.severity];
  const Icon = style.icon;
  return (
    <Card className={style.ring}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-start gap-2">
            <Icon className="h-5 w-5 mt-0.5 shrink-0 text-muted-foreground" />
            <div>
              <CardTitle className="text-base leading-snug">
                {finding.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Badge variant="outline" className={style.badge}>
                  {AUDIT_SEVERITY_LABELS[finding.severity]}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {AUDIT_AREA_LABELS[finding.area]}
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  {finding.id}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <Section label="أين">
          <ul className="space-y-1">
            {finding.locations.map((l) => (
              <li
                key={l}
                className="font-mono text-xs bg-muted/50 px-2 py-1 rounded"
              >
                {l}
              </li>
            ))}
          </ul>
        </Section>
        <Section label="لماذا تُعد خطراً">
          <p className="leading-relaxed">{finding.risk}</p>
        </Section>
        <Section label="كيف تُصلَح في هذا المشروع">
          <p className="leading-relaxed text-foreground">
            {finding.recommendation}
          </p>
        </Section>
      </CardContent>
    </Card>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs font-semibold text-muted-foreground mb-1">
        {label}
      </div>
      {children}
    </div>
  );
}

function ContractRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="grid grid-cols-[90px_1fr] gap-3">
      <div className="text-xs font-semibold text-muted-foreground pt-0.5">
        {label}
      </div>
      <div
        className={cn(
          "text-sm leading-relaxed break-words",
          mono && "font-mono text-xs bg-muted/50 px-2 py-1 rounded"
        )}
      >
        {value}
      </div>
    </div>
  );
}
