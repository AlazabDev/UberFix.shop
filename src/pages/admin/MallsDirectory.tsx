import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Building2, MapPin } from "lucide-react";

export default function MallsDirectory() {
  const [search, setSearch] = useState("");

  const { data: malls = [], isLoading } = useQuery({
    queryKey: ["malls"],
    queryFn: async () => {
      const { data, error } = await supabase.from("malls").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const filtered = malls.filter(
    (m: any) =>
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.location?.toLowerCase().includes(search.toLowerCase())
  );

  const types = [...new Set(malls.map((m: any) => m.type))].filter(Boolean);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-8 w-8 text-primary" />
            دليل المولات والمراكز التجارية
          </h1>
          <p className="text-muted-foreground mt-1">{malls.length} مول مسجل</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="بحث بالاسم أو الموقع..." value={search} onChange={(e) => setSearch(e.target.value)} className="pr-9" />
        </div>
      </div>

      {/* Type filter chips */}
      <div className="flex flex-wrap gap-2">
        {types.map((t: any) => (
          <Badge
            key={t}
            variant="outline"
            className="cursor-pointer hover:bg-primary/10"
            onClick={() => setSearch(t)}
          >
            {t} ({malls.filter((m: any) => m.type === t).length})
          </Badge>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.slice(0, 60).map((mall: any) => (
            <Card key={mall.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground truncate">{mall.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1 flex items-start gap-1">
                      <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span className="line-clamp-2">{mall.location || "غير محدد"}</span>
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-xs">
                    {mall.type || "مول"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filtered.length > 60 && (
        <p className="text-center text-sm text-muted-foreground">عرض أول 60 من {filtered.length}</p>
      )}
    </div>
  );
}
