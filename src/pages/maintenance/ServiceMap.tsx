import { useState, useEffect, useRef } from "react";
import { Search, User, MapPin, Phone, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { loadGoogleMaps } from "@/lib/googleMapsLoader";
import { useTechnicians } from "@/hooks/useTechnicians";

const specialties = [
  { id: "paint", label: "دهان", icon: "🎨" },
  { id: "carpentry", label: "نجار", icon: "🔨" },
  { id: "electrical", label: "كهربائي", icon: "⚡" },
  { id: "plumbing", label: "سباك", icon: "🔧" },
];

export default function ServiceMap() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapError, setMapError] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  const { technicians, loading } = useTechnicians();

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 3;
    
    const initMap = async () => {
      try {
        console.log("🗺️ Starting map initialization...");
        
        const { data, error } = await supabase.functions.invoke("get-maps-key");
        
        if (error) {
          console.error("❌ Failed to get API key:", error);
          if (mounted && retryCount < maxRetries) {
            retryCount++;
            console.log(`🔄 Retrying... (${retryCount}/${maxRetries})`);
            setTimeout(() => initMap(), 2000);
            return;
          }
          if (mounted) setMapError(true);
          return;
        }
        
        if (!data?.apiKey) {
          console.error("❌ No API key returned");
          if (mounted) setMapError(true);
          return;
        }

        console.log("✅ API key received:", data.apiKey.substring(0, 10) + "...");
        
        // تحقق من وجود Google Maps
        if (typeof window.google !== 'undefined' && window.google.maps) {
          console.log("✅ Google Maps already loaded");
        } else {
          console.log("📦 Loading Google Maps script...");
          await loadGoogleMaps(data.apiKey);
          console.log("✅ Google Maps script loaded");
        }

        // انتظر قليلاً للتأكد من تحميل Google Maps
        await new Promise(resolve => setTimeout(resolve, 500));

        if (typeof window.google === 'undefined' || !window.google.maps) {
          throw new Error("Google Maps failed to load");
        }

        if (mapRef.current && !mapInstanceRef.current && mounted) {
          console.log("🗺️ Creating map instance...");
          mapInstanceRef.current = new google.maps.Map(mapRef.current, {
            center: { lat: 30.0444, lng: 31.2357 },
            zoom: 13,
            mapTypeControl: false,
            fullscreenControl: true,
            streetViewControl: false,
            zoomControl: true,
            styles: [
              {
                featureType: "poi",
                stylers: [{ visibility: "off" }],
              },
            ],
          });
          
          console.log("✅ Map instance created successfully");
          
          // أضف حدث للتأكد من تحميل الخريطة
          google.maps.event.addListenerOnce(mapInstanceRef.current, 'idle', () => {
            console.log("✅ Map is fully loaded and idle");
          });
        }
      } catch (error) {
        console.error("❌ Map loading error:", error);
        if (mounted && retryCount < maxRetries) {
          retryCount++;
          console.log(`🔄 Retrying after error... (${retryCount}/${maxRetries})`);
          setTimeout(() => initMap(), 2000);
          return;
        }
        if (mounted) setMapError(true);
      }
    };

    initMap();

    return () => {
      mounted = false;
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !technicians.length) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // Add markers for technicians
    technicians.forEach((tech) => {
      if (tech.current_latitude && tech.current_longitude) {
        const marker = new google.maps.Marker({
          position: { lat: tech.current_latitude, lng: tech.current_longitude },
          map: mapInstanceRef.current!,
          title: tech.name || "فني",
        });
        markersRef.current.push(marker);
      }
    });
  }, [technicians]);

  const filteredTechnicians = technicians.filter((tech) => {
    const matchesSpecialty =
      !selectedSpecialty ||
      tech.specialization?.toLowerCase().includes(selectedSpecialty.toLowerCase());
    const matchesSearch =
      !searchQuery ||
      tech.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.specialization?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpecialty && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F4F5F7] flex flex-col" dir="rtl">
      {/* Header */}
      <header className="bg-[#0B0B3B] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#F5BF23] rounded-full flex items-center justify-center">
            <Phone className="w-5 h-5 text-[#0B0B3B]" />
          </div>
          <div className="text-right">
            <h1 className="text-xl font-bold">UberFix.shop</h1>
            <p className="text-xs text-gray-300">خدمات الصيانة المنزلية</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
        >
          <User className="w-5 h-5" />
        </Button>
      </header>

      {/* Search Bar */}
      <div className="bg-white px-6 py-4 shadow-sm">
        <div className="relative max-w-4xl mx-auto">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            type="text"
            placeholder="ابحث عن خدمة أو موقع..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 h-12 text-right"
          />
        </div>
      </div>

      {/* Specialty Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex gap-2 overflow-x-auto">
          {specialties.map((specialty) => (
            <Button
              key={specialty.id}
              variant={selectedSpecialty === specialty.label ? "default" : "outline"}
              onClick={() =>
                setSelectedSpecialty(
                  selectedSpecialty === specialty.label ? null : specialty.label
                )
              }
              className={`whitespace-nowrap ${
                selectedSpecialty === specialty.label
                  ? "bg-[#0B0B3B] text-white hover:bg-[#0B0B3B]/90"
                  : "border-gray-300"
              }`}
            >
              <span className="mr-2">{specialty.icon}</span>
              {specialty.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Technicians List */}
        <aside className="w-64 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 flex-shrink-0">
            <h2 className="text-lg font-bold text-[#0B0B3B] mb-1">
              الخدمات المتاحة ({filteredTechnicians.length})
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              اختر فني من القائمة أدناه
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="space-y-3">

              {loading ? (
                <div className="text-center py-8 text-gray-500">جاري التحميل...</div>
              ) : filteredTechnicians.length > 0 ? (
                filteredTechnicians.map((tech) => (
                  <Card key={tech.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={tech.profile_image || undefined} />
                        <AvatarFallback className="bg-[#F5BF23] text-[#0B0B3B]">
                          {tech.name?.charAt(0) || "ف"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-[#0B0B3B]">
                            {tech.name || "فني"}
                          </h3>
                          <Badge
                            variant="secondary"
                            className={
                              tech.status === "online"
                                ? "bg-green-100 text-green-700"
                                : tech.status === "busy"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-gray-100 text-gray-700"
                            }
                          >
                            {tech.status === "online"
                              ? "متاح الآن"
                              : tech.status === "busy"
                              ? "مشغول"
                              : "غير متاح"}
                          </Badge>
                        </div>

                        <p className="text-sm text-gray-600 mb-2">
                          {tech.specialization || "فني عام"}
                        </p>

                        <div className="flex items-center gap-3 text-sm mb-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-[#F5BF23] text-[#F5BF23]" />
                            <span className="font-medium">
                              {tech.rating || "5.0"}
                            </span>
                            <span className="text-gray-500">
                              ({tech.total_reviews || 0} تقييم)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            {tech.hourly_rate || 150} جنيه/ساعة
                          </span>
                          <Button
                            size="sm"
                            onClick={() => {
                              if (tech.phone) {
                                window.location.href = `tel:${tech.phone}`;
                              }
                            }}
                            className="bg-[#0B0B3B] hover:bg-[#0B0B3B]/90 text-white h-8"
                          >
                            <Phone className="w-3 h-3 ml-1" />
                            اتصل
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  لا توجد خدمات متاحة حالياً
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Map Area */}
        <main className="flex-1 relative">
          {mapError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-xl font-bold text-[#0B0B3B] mb-2">
                  عذرًا، حدث خطأ!
                </h3>
                <p className="text-gray-600">
                  لم يمكن تحميل خريطة Google. يرجى المحاولة مرة أخرى لاحقاً.
                </p>
              </div>
            </div>
          ) : (
            <div ref={mapRef} className="w-full h-full" />
          )}
        </main>
      </div>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-around">
        <Button variant="ghost" className="flex flex-col items-center gap-1 text-xs">
          <User className="w-5 h-5" />
          <span>الملف الشخصي</span>
        </Button>
        <Button variant="ghost" className="flex flex-col items-center gap-1 text-xs">
          <MapPin className="w-5 h-5" />
          <span>الفواتير</span>
        </Button>
        <Button variant="ghost" className="flex flex-col items-center gap-1 text-xs">
          <Star className="w-5 h-5" />
          <span>الخدمات المكتملة</span>
        </Button>
        <Button variant="ghost" className="flex flex-col items-center gap-1 text-xs">
          <Phone className="w-5 h-5" />
          <span>تتبع الطلبات</span>
        </Button>
        <Button
          className="flex flex-col items-center gap-1 text-xs bg-[#0B0B3B] hover:bg-[#0B0B3B]/90 text-white px-6"
        >
          <MapPin className="w-5 h-5" />
          <span>الخريطة</span>
        </Button>
      </nav>
    </div>
  );
}
