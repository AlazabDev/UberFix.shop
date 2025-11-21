import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MapHeaderProps {
  searchQuery: string;
  onSearch: (query: string) => void;
}

export function MapHeader({ searchQuery, onSearch }: MapHeaderProps) {
  return (
    <header className="bg-background border-b border-border shadow-sm z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* الشعار والعنوان */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <span className="text-2xl">🔧</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  UberFix.shop
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">
                  خدمات الصيانة المنزلية
                </p>
              </div>
            </div>
          </div>

          {/* عنوان الصفحة */}
          <h2 className="text-lg font-semibold text-foreground hidden md:block">
            طرق الصيانة السريعة
          </h2>

          {/* شريط البحث */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="ابحث عن خدمة أو موقع..."
                value={searchQuery}
                onChange={(e) => onSearch(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
