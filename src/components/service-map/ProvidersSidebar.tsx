import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProviderCard } from "./ProviderCard";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Provider {
  id: string;
  name: string;
  avatar_url?: string | null;
  specialization: string[] | null;
  rating: number | null;
  total_reviews?: number | null;
  status: string | null;
  phone?: string | null;
  current_latitude: number | null;
  current_longitude: number | null;
  estimated_arrival?: string;
}

interface ProvidersSidebarProps {
  providers: Provider[];
  selectedId: string | null;
  onSelectProvider: (provider: Provider) => void;
}

export function ProvidersSidebar({
  providers,
  selectedId,
  onSelectProvider,
}: ProvidersSidebarProps) {
  return (
    <Card className="hidden lg:block w-80 xl:w-96 m-4 shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>الخدمات المتاحة</span>
          <span className="text-sm font-normal text-muted-foreground">
            ({providers.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-3 p-4 pt-0">
            {providers.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg mb-2">لا توجد خدمات متاحة</p>
                <p className="text-sm">جرب تغيير الفلاتر أو البحث</p>
              </div>
            ) : (
              providers.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  isSelected={provider.id === selectedId}
                  onClick={() => onSelectProvider(provider)}
                />
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
