import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Phone, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InteractiveMap } from "@/components/maps/InteractiveMap";

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
  const [providers, setProviders] = useState<ServiceProvider[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ServiceProvider[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [centerLat, setCenterLat] = useState(30.0444);
  const [centerLng, setCenterLng] = useState(31.2357);

  const specialties = [
    { id: "plumbing", label: "سباكة", icon: "🔧" },
    { id: "electrical", label: "كهرباء", icon: "⚡" },
    { id: "carpentry", label: "نجارة", icon: "🪚" },
    { id: "painting", label: "دهان", icon: "🎨" },
    { id: "hvac", label: "تكييف", icon: "❄️" },
    { id: "general", label: "عام", icon: "🛠️" },
  ];

  useEffect(() => {
    fetchProviders();
  }, []);

  useEffect(() => {
    filterProviders();
  }, [searchQuery, selectedSpecialty, providers]);

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

  const filterProviders = () => {
    let filtered = providers;

    if (searchQuery) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.specialization?.some((s) =>
            s.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    if (selectedSpecialty) {
      filtered = filtered.filter((p) =>
        p.specialization?.includes(selectedSpecialty)
      );
    }

    setFilteredProviders(filtered);
  };

  const handleProviderClick = (provider: ServiceProvider) => {
    if (provider.current_latitude && provider.current_longitude) {
      setCenterLat(provider.current_latitude);
      setCenterLng(provider.current_longitude);
      toast.success(`تم التركيز على ${provider.name}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          خريطة مزودي الخدمة
        </h1>
        <p className="text-muted-foreground">
          تتبع مواقع الفنيين ومزودي الخدمة في الوقت الفعلي
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن فني أو خدمة..."
                className="pr-10"
              />
            </div>

            {/* Specialty Filters */}
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedSpecialty === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSpecialty(null)}
              >
                الكل ({providers.length})
              </Button>
              {specialties.map((specialty) => {
                const count = providers.filter((p) =>
                  p.specialization?.includes(specialty.id)
                ).length;
                return (
                  <Button
                    key={specialty.id}
                    variant={selectedSpecialty === specialty.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedSpecialty(specialty.id)}
                  >
                    <span className="ml-1">{specialty.icon}</span>
                    {specialty.label} ({count})
                  </Button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Map and List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Provider List */}
        <div className="lg:col-span-1 space-y-4 max-h-[600px] overflow-y-auto">
          {loading ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">جاري التحميل...</p>
              </CardContent>
            </Card>
          ) : filteredProviders.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">لا توجد نتائج</p>
              </CardContent>
            </Card>
          ) : (
            filteredProviders.map((provider) => (
              <Card
                key={provider.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleProviderClick(provider)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                      {provider.company_name && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {provider.company_name}
                        </p>
                      )}
                    </div>
                    <Badge
                      variant={provider.status === "available" ? "default" : "secondary"}
                    >
                      {provider.status === "available" ? "متاح" : "مشغول"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* Specializations */}
                  <div className="flex flex-wrap gap-1">
                    {provider.specialization?.map((spec) => {
                      const specialty = specialties.find((s) => s.id === spec);
                      return (
                        <Badge key={spec} variant="outline" className="text-xs">
                          {specialty?.icon} {specialty?.label || spec}
                        </Badge>
                      );
                    })}
                  </div>

                  {/* Rating */}
                  {provider.rating && (
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{provider.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">
                        ({provider.total_reviews || 0} تقييم)
                      </span>
                    </div>
                  )}

                  {/* Phone */}
                  {provider.phone && (
                    <a
                      href={`tel:${provider.phone}`}
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Phone className="h-4 w-4" />
                      {provider.phone}
                    </a>
                  )}

                  {/* Location */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {provider.current_latitude?.toFixed(4)},{" "}
                      {provider.current_longitude?.toFixed(4)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Map */}
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardContent className="p-0 h-full">
              <InteractiveMap
                latitude={centerLat}
                longitude={centerLng}
                height="600px"
                className="rounded-lg"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
