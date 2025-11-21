import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ServiceFilter {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  color: string;
}

export const SERVICE_FILTERS: ServiceFilter[] = [
  {
    id: "painting",
    nameAr: "دهان",
    nameEn: "Painting",
    icon: "🎨",
    color: "purple",
  },
  {
    id: "electrical",
    nameAr: "كهربائي",
    nameEn: "Electrical",
    icon: "⚡",
    color: "yellow",
  },
  {
    id: "carpentry",
    nameAr: "نجار",
    nameEn: "Carpentry",
    icon: "🪚",
    color: "orange",
  },
  {
    id: "plumbing",
    nameAr: "سباك",
    nameEn: "Plumbing",
    icon: "🔧",
    color: "blue",
  },
  {
    id: "hvac",
    nameAr: "تكييف",
    nameEn: "HVAC",
    icon: "❄️",
    color: "cyan",
  },
  {
    id: "general",
    nameAr: "عام",
    nameEn: "General",
    icon: "🛠️",
    color: "gray",
  },
];

interface FilterBarProps {
  selectedFilters: string[];
  onToggleFilter: (filterId: string) => void;
  providersCount: number;
}

export function FilterBar({
  selectedFilters,
  onToggleFilter,
  providersCount,
}: FilterBarProps) {
  const getFilterCount = (filterId: string) => {
    // في التطبيق الفعلي، هذا سيأتي من البيانات
    return 0;
  };

  return (
    <div className="bg-background border-b border-border py-3">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {/* زر "الكل" */}
          <Button
            variant={selectedFilters.length === 0 ? "default" : "outline"}
            size="sm"
            onClick={() => {
              if (selectedFilters.length > 0) {
                SERVICE_FILTERS.forEach((f) => onToggleFilter(f.id));
              }
            }}
            className="whitespace-nowrap"
          >
            الكل
            <Badge variant="secondary" className="mr-2">
              {providersCount}
            </Badge>
          </Button>

          {/* أزرار الفلاتر */}
          {SERVICE_FILTERS.map((filter) => {
            const isSelected = selectedFilters.includes(filter.id);
            return (
              <Button
                key={filter.id}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => onToggleFilter(filter.id)}
                className={cn(
                  "whitespace-nowrap transition-all",
                  isSelected && "shadow-sm"
                )}
              >
                <span className="ml-1 text-base">{filter.icon}</span>
                {filter.nameAr}
                {getFilterCount(filter.id) > 0 && (
                  <Badge
                    variant={isSelected ? "secondary" : "outline"}
                    className="mr-2"
                  >
                    {getFilterCount(filter.id)}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
