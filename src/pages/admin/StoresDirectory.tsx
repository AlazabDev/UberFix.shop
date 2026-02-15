import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Store, ExternalLink } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function StoresDirectory() {
  const [search, setSearch] = useState("");

  const { data: stores = [], isLoading } = useQuery({
    queryKey: ["stores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("is_deleted", false)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const filtered = stores.filter(
    (s: any) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.location?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (s: string) =>
    s === "active" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-muted text-muted-foreground";

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Store className="h-8 w-8 text-primary" />
            دليل الفروع والمتاجر
          </h1>
          <p className="text-muted-foreground mt-1">{stores.length} فرع مسجل</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم أو الموقع..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-9"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "إجمالي الفروع", value: stores.length, color: "text-primary" },
          { label: "نشط", value: stores.filter((s: any) => s.status === "active").length, color: "text-green-600" },
          { label: "غير نشط", value: stores.filter((s: any) => s.status !== "active").length, color: "text-muted-foreground" },
          { label: "التصنيفات", value: new Set(stores.map((s: any) => s.category)).size, color: "text-amber-600" },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="mt-3 text-muted-foreground">جاري التحميل...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>الموقع</TableHead>
                    <TableHead>التصنيف</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الخريطة</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.slice(0, 50).map((store: any) => (
                    <TableRow key={store.id}>
                      <TableCell className="font-medium">{store.name}</TableCell>
                      <TableCell className="max-w-[300px] truncate text-muted-foreground">
                        <MapPin className="inline h-3 w-3 mr-1" />
                        {store.location || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{store.category || "عام"}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(store.status)}`}>
                          {store.status === "active" ? "نشط" : "غير نشط"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {store.map_url && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={store.map_url} target="_blank" rel="noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filtered.length > 50 && (
                <p className="p-3 text-sm text-muted-foreground text-center">
                  عرض أول 50 من {filtered.length} فرع
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
