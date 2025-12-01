import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MapHeader } from "@/components/service-map/MapHeader";
import { FilterBar, SERVICE_FILTERS } from "@/components/service-map/FilterBar";
import { ProvidersSidebar } from "@/components/service-map/ProvidersSidebar";
import { InteractiveMap } from "@/components/maps/InteractiveMap";
import { ProviderPopup } from "@/components/service-map/ProviderPopup";
import { BottomNavigation } from "@/components/service-map/BottomNavigation";
import { useNavigate } from "react-router-dom";

interface ServiceProvider {
  id: string;
  name: string;
  specialization: string[] | null;
  rating: number | null;
  total_reviews?: number | null;
  phone: string | null;
  current_latitude: number | null;
  current_longitude: number | null;
  status: string | null;
  is_active?: boolean | null;
  company_name: string | null;
}

export default function ServiceMap() {
  const navigate = useNavigate();
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);
  const [centerLat, setCenterLat] = useState(30.0444);
  const [centerLng, setCenterLng] = useState(31.2357);

  useEffect(() => {
    fetchProviders();
  }, []);

  // تصفية المزودين بناءً على الفلاتر والبحث
  const filteredProviders = providers.filter((provider) => {
    // تصفية حسب التخصص
    if (selectedFilters.length > 0) {
      const hasMatchingSpecialty = provider.specialization?.some((spec) =>
        selectedFilters.includes(spec)
      );
      if (!hasMatchingSpecialty) return false;
    }

    // تصفية حسب البحث
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = provider.name.toLowerCase().includes(query);
      const matchesCompany = provider.company_name?.toLowerCase().includes(query);
      const matchesSpecialty = provider.specialization?.some((s) =>
        s.toLowerCase().includes(query)
      );

      if (!matchesName && !matchesCompany && !matchesSpecialty) {
        return false;
      }
    }

    return true;
  });

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .eq("is_tracking_enabled", true)
        .not("current_latitude", "is", null)
        .not("current_longitude", "is", null);

      if (error) throw error;

      setProviders(data || []);
    } catch (error: any) {
      console.error("Error fetching providers:", error);
      toast.error("فشل تحميل مزودي الخدمة");
    } finally {
      setLoading(false);
    }
  };

  const toggleFilter = (filterId: string) => {
    setSelectedFilters((prev) =>
      prev.includes(filterId)
        ? prev.filter((id) => id !== filterId)
        : [...prev, filterId]
    );
  };

  const handleProviderClick = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    if (provider.current_latitude && provider.current_longitude) {
      setCenterLat(provider.current_latitude);
      setCenterLng(provider.current_longitude);
    }
  };

  const handleRequestService = (providerId: string) => {
    // التوجيه إلى صفحة طلب الخدمة
    navigate(`/request-service?vendor=${providerId}`);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* الشريط العلوي */}
      <MapHeader searchQuery={searchQuery} onSearch={setSearchQuery} />

      {/* شريط الفلاتر */}
      <FilterBar
        selectedFilters={selectedFilters}
        onToggleFilter={toggleFilter}
        providersCount={filteredProviders.length}
      />

      {/* المحتوى الرئيسي */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* القائمة الجانبية */}
        <ProvidersSidebar
          providers={filteredProviders}
          selectedId={selectedProvider?.id || null}
          onSelectProvider={handleProviderClick}
        />

        {/* الخريطة */}
        <div className="flex-1 relative">
          <InteractiveMap
            latitude={centerLat}
            longitude={centerLng}
            height="100%"
            className="w-full h-full"
          />

          {/* نافذة تفاصيل المزود */}
          {selectedProvider && (
            <ProviderPopup
              provider={selectedProvider}
              onClose={() => setSelectedProvider(null)}
              onRequestService={handleRequestService}
            />
          )}
        </div>
      </div>

      {/* شريط التنقل السفلي (للجوال فقط) */}
      <BottomNavigation />
    </div>
  );
}
