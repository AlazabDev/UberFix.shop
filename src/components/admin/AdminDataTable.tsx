import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, Download, Filter, X, ChevronRight, ChevronLeft, 
  ChevronsRight, ChevronsLeft, SlidersHorizontal 
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ──
export interface ColumnDef<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
  sortable?: boolean;
}

export interface FilterDef {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  allLabel?: string;
}

export interface StatusTab {
  key: string;
  label: string;
  count?: number;
}

export interface RangeFilterDef {
  key: string;
  label: string;
  type: "date" | "number";
  placeholderFrom?: string;
  placeholderTo?: string;
}

interface AdminDataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  // Header
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  totalLabel?: string;
  // Search
  searchPlaceholder?: string;
  searchKeys?: string[];
  // Filters
  filters?: FilterDef[];
  rangeFilters?: RangeFilterDef[];
  // Status tabs
  statusTabs?: StatusTab[];
  statusKey?: string;
  // Pagination
  pageSize?: number;
  // Export
  onExportPdf?: (filteredData: T[]) => void;
  onExportCsv?: (filteredData: T[]) => void;
  // Stats
  stats?: { label: string; value: string | number; color?: string; icon?: React.ReactNode }[];
  // Row click
  onRowClick?: (row: T) => void;
}

const PAGE_SIZE_OPTIONS = [20, 50, 100, 200];

export function AdminDataTable<T extends Record<string, any>>({
  data,
  columns,
  isLoading,
  title,
  subtitle,
  icon,
  searchPlaceholder = "بحث...",
  searchKeys = ["name", "title", "description"],
  filters = [],
  rangeFilters = [],
  statusTabs = [],
  statusKey = "status",
  pageSize: defaultPageSize = 20,
  onExportPdf,
  onExportCsv,
  stats,
  onRowClick,
}: AdminDataTableProps<T>) {
  const [search, setSearch] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState("__all__");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [showFilters, setShowFilters] = useState(false);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [rangeValues, setRangeValues] = useState<Record<string, { from: string; to: string }>>({});

  // ── Filter logic ──
  const filtered = useMemo(() => {
    let result = [...data];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((row) =>
        searchKeys.some((k) => String(row[k] ?? "").toLowerCase().includes(q))
      );
    }

    // Status tab
    if (activeTab !== "__all__") {
      result = result.filter((row) => String(row[statusKey]) === activeTab);
    }

    // Dropdown filters
    for (const [key, value] of Object.entries(activeFilters)) {
      if (value && value !== "__all__") {
        result = result.filter((row) => String(row[key]) === value);
      }
    }

    // Range filters (date/number)
    for (const [key, val] of Object.entries(rangeValues)) {
      if (val.from || val.to) {
        const rf = rangeFilters.find(r => r.key === key);
        if (rf?.type === "number") {
          if (val.from) result = result.filter(row => Number(row[key] ?? 0) >= Number(val.from));
          if (val.to) result = result.filter(row => Number(row[key] ?? 0) <= Number(val.to));
        } else if (rf?.type === "date") {
          if (val.from) result = result.filter(row => row[key] && String(row[key]).slice(0, 10) >= val.from);
          if (val.to) result = result.filter(row => row[key] && String(row[key]).slice(0, 10) <= val.to);
        }
      }
    }

    // Sort
    if (sortKey) {
      result.sort((a, b) => {
        const av = a[sortKey] ?? "";
        const bv = b[sortKey] ?? "";
        const cmp = typeof av === "number" ? av - (bv as number) : String(av).localeCompare(String(bv), "ar");
        return sortDir === "asc" ? cmp : -cmp;
      });
    }

    return result;
  }, [data, search, activeTab, activeFilters, rangeValues, sortKey, sortDir, searchKeys, statusKey, rangeFilters]);

  // ── Pagination ──
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safeCurrentPage = Math.min(page, totalPages);
  const paged = filtered.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);
  const fromRow = filtered.length === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const toRow = Math.min(safeCurrentPage * pageSize, filtered.length);

  const hasActiveFilters = search || activeTab !== "__all__" 
    || Object.values(activeFilters).some(v => v && v !== "__all__")
    || Object.values(rangeValues).some(v => v.from || v.to);

  const clearAll = () => {
    setSearch("");
    setActiveTab("__all__");
    setActiveFilters({});
    setRangeValues({});
    setPage(1);
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // ── Render ──
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {icon && <div className="p-2.5 rounded-xl bg-primary/10 text-primary">{icon}</div>}
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle || `${data.length} سجل`}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onExportPdf && (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onExportPdf(filtered)}>
              <Download className="h-4 w-4" />
              PDF
            </Button>
          )}
          {onExportCsv && (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => onExportCsv(filtered)}>
              <Download className="h-4 w-4" />
              CSV
            </Button>
          )}
        </div>
      </div>

      {/* Stats cards */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map((s) => (
            <Card key={s.label} className="border-border/60">
              <CardContent className="p-3 flex items-center gap-3">
                {s.icon && <div className="p-2 rounded-lg bg-primary/10">{s.icon}</div>}
                <div>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className={cn("text-lg font-bold", s.color || "text-foreground")}>{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filter bar */}
      <Card className="border-border/60">
        <CardContent className="p-3 space-y-3">
          {/* Search + toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pr-9 h-9"
              />
            </div>
            {(filters.length > 0 || rangeFilters.length > 0) && (
              <Button
                variant={showFilters ? "secondary" : "outline"}
                size="sm"
                className="gap-1.5"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="h-4 w-4" />
                بحث متقدم
              </Button>
            )}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="gap-1 text-destructive" onClick={clearAll}>
                <X className="h-3.5 w-3.5" />
                إلغاء الفلتر
              </Button>
            )}
          </div>

          {/* Advanced filters */}
          {showFilters && (filters.length > 0 || rangeFilters.length > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2 border-t border-border/40">
              {filters.map((f) => (
                <div key={f.key} className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">{f.label}</label>
                  <Select
                    value={activeFilters[f.key] || "__all__"}
                    onValueChange={(v) => {
                      setActiveFilters((prev) => ({ ...prev, [f.key]: v }));
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__all__">{f.allLabel || "الكل"}</SelectItem>
                      {f.options.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              {rangeFilters.map((rf) => (
                <div key={rf.key} className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground">{rf.label}</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type={rf.type === "date" ? "date" : "number"}
                      placeholder={rf.placeholderFrom || "من"}
                      value={rangeValues[rf.key]?.from || ""}
                      onChange={(e) => {
                        setRangeValues(prev => ({
                          ...prev,
                          [rf.key]: { ...prev[rf.key], from: e.target.value, to: prev[rf.key]?.to || "" }
                        }));
                        setPage(1);
                      }}
                      className="h-8 text-sm"
                    />
                    <span className="text-xs text-muted-foreground shrink-0">إلى</span>
                    <Input
                      type={rf.type === "date" ? "date" : "number"}
                      placeholder={rf.placeholderTo || "إلى"}
                      value={rangeValues[rf.key]?.to || ""}
                      onChange={(e) => {
                        setRangeValues(prev => ({
                          ...prev,
                          [rf.key]: { from: prev[rf.key]?.from || "", to: e.target.value }
                        }));
                        setPage(1);
                      }}
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status tabs */}
      {statusTabs.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap border-b border-border/40 pb-1">
          <span className="text-xs text-muted-foreground ml-2">النتائج:</span>
          <button
            onClick={() => { setActiveTab("__all__"); setPage(1); }}
            className={cn(
              "px-3 py-1.5 text-sm rounded-md transition-colors",
              activeTab === "__all__"
                ? "bg-primary text-primary-foreground font-medium"
                : "text-muted-foreground hover:bg-muted"
            )}
          >
            الكل
          </button>
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setPage(1); }}
              className={cn(
                "px-3 py-1.5 text-sm rounded-md transition-colors",
                activeTab === tab.key
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span className="mr-1 text-xs opacity-70">({tab.count})</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <Card className="border-border/60 overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Filter className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">لا توجد نتائج</p>
              <p className="text-sm mt-1">حاول تعديل الفلاتر أو البحث</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="text-center w-12 text-xs font-semibold">#</TableHead>
                  {columns.map((col) => (
                    <TableHead
                      key={col.key}
                      className={cn(
                        "text-xs font-semibold",
                        col.sortable && "cursor-pointer select-none hover:text-foreground",
                        col.className
                      )}
                      onClick={() => col.sortable && handleSort(col.key)}
                    >
                      {col.header}
                      {sortKey === col.key && (
                        <span className="mr-1 text-primary">{sortDir === "asc" ? "↑" : "↓"}</span>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.map((row, i) => (
                  <TableRow
                    key={row.id ?? i}
                    className={cn(
                      "transition-colors",
                      onRowClick && "cursor-pointer hover:bg-muted/40"
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    <TableCell className="text-center text-xs text-muted-foreground font-mono">
                      {fromRow + i}
                    </TableCell>
                    {columns.map((col) => (
                      <TableCell key={col.key} className={col.className}>
                        {col.render ? col.render(row) : String(row[col.key] ?? "-")}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination footer */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between border-t border-border/40 px-4 py-2.5 bg-muted/20 flex-wrap gap-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{fromRow} - {toRow} من {filtered.length}</span>
              <span className="text-border">|</span>
              <span>صفحة {safeCurrentPage} من {totalPages}</span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Page size selector */}
              <Select
                value={String(pageSize)}
                onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}
              >
                <SelectTrigger className="h-8 w-20 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((s) => (
                    <SelectItem key={s} value={String(s)}>{s} صف</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Navigation buttons */}
              <Button
                variant="outline" size="icon" className="h-8 w-8"
                disabled={safeCurrentPage <= 1}
                onClick={() => setPage(1)}
              >
                <ChevronsRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline" size="icon" className="h-8 w-8"
                disabled={safeCurrentPage <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>

              {/* Page number buttons */}
              {getPageNumbers(safeCurrentPage, totalPages).map((p, i) =>
                p === "..." ? (
                  <span key={`e${i}`} className="px-1 text-muted-foreground text-xs">...</span>
                ) : (
                  <Button
                    key={p}
                    variant={p === safeCurrentPage ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8 text-xs"
                    onClick={() => setPage(p as number)}
                  >
                    {p}
                  </Button>
                )
              )}

              <Button
                variant="outline" size="icon" className="h-8 w-8"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline" size="icon" className="h-8 w-8"
                disabled={safeCurrentPage >= totalPages}
                onClick={() => setPage(totalPages)}
              >
                <ChevronsLeft className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    if (!pages.includes(i)) pages.push(i);
  }
  if (current < total - 2) pages.push("...");
  if (!pages.includes(total)) pages.push(total);
  return pages;
}
