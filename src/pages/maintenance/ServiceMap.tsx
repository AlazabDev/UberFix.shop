import { useState, useEffect, useRef } from "react";
import { Search, User, MapPin, Phone, Star, Home, ClipboardList, Settings as SettingsIcon, Cog, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { loadGoogleMaps } from "@/lib/googleMapsLoader";
import { MAPS_CONFIG } from "@/config/maps";
import { useTechnicians } from "@/hooks/useTechnicians";
import { useBranchLocations, BranchLocation } from "@/hooks/useBranchLocations";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationsList } from "@/components/notifications/NotificationsList";
import { TechnicianMapPopup } from "@/components/maps/TechnicianMapPopup";
import { BranchMapPopup } from "@/components/maps/BranchMapPopup";
import { createRoot } from "react-dom/client";

declare global {
  interface Window {
    google: typeof google;
  }
}

interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: "مسؤول" | "مدير" | "موظف" | "فني" | "عميل";
}

const SPECIALTIES = [
  { id: "all", label: "كل التخصصات", icon: "🛠️", keywords: [] },
  { id: "electrician", label: "كهرباء", icon: "⚡", keywords: ["كهرب", "elect"] },
  { id: "plumber", label: "سباكة", icon: "🚿", keywords: ["سباك", "plumb"] },
  { id: "ac_technician", label: "تكييف", icon: "❄️", keywords: ["تكييف", "ac"] },
  { id: "carpenter", label: "نجارة", icon: "🪵", keywords: ["نجار", "carp"] },
  { id: "painter", label: "دهانات", icon: "🎨", keywords: ["دهان", "paint"] },
];

const MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#f5f5f5" }] },
  { elementType: "labels.icon", stylers: [{ visibility: "off" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#6b7280" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#f9fafb" }] },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca3af" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#e8f0fe" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#d1f0e5" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#16a34a" }],
  },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#ffffff" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#e5e7eb" }] },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#fbbf24" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#f59e0b" }],
  },
  {
    featureType: "transit.line",
    elementType: "geometry",
    stylers: [{ color: "#e5e7eb" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#dbeafe" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#3b82f6" }],
  },
];

// استيراد دوال الأيقونات
import { getTechnicianIcon, getBranchIcon } from "@/lib/technicianIcons";

export default function ServiceMap() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapError, setMapError] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<BranchLocation | null>(null);

  const { technicians } = useTechnicians();
  const { branches } = useBranchLocations();
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchUserData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, avatar_url, role")
        .eq("id", user.id)
        .maybeSingle();

      setUserData({
        email: user.email || "",
        firstName: profile?.first_name || "مستخدم",
        lastName: profile?.last_name || "",
        avatarUrl: profile?.avatar_url || null,
        role:
          profile?.role === "admin"
            ? "مسؤول"
            : profile?.role === "manager"
            ? "مدير"
            : profile?.role === "staff"
            ? "موظف"
            : profile?.role === "vendor"
            ? "فني"
            : "عميل",
      });
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleRequestService = (technician: any) => {
    navigate("/quick-request-from-map", {
      state: {
        technicianId: technician.id,
        technicianName: technician.name,
        technicianPhone: technician.phone,
        specialization: technician.specialization,
      },
    });
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (!selectedBranch && branches && branches.length > 0) {
      setSelectedBranch(branches[0]);
    }
  }, [branches, selectedBranch]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "تم تسجيل الخروج",
        description: "نراك قريباً",
      });
      navigate("/login");
    } catch {
      toast({
        title: "خطأ في تسجيل الخروج",
        description: "يرجى المحاولة مرة أخرى",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    let mounted = true;

    const initMap = async () => {
      try {
        if (typeof window.google === "undefined" || !window.google.maps) {
          await loadGoogleMaps();
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        if (mapRef.current && !mapInstanceRef.current && mounted) {
          mapInstanceRef.current = new google.maps.Map(mapRef.current, {
            center: MAPS_CONFIG.defaultCenter,
            zoom: 13,
            styles: MAP_STYLE,
            mapId: MAPS_CONFIG.defaultOptions.mapId,
            mapTypeControl: false,
            fullscreenControl: false,
            streetViewControl: false,
            zoomControl: true,
            gestureHandling: "greedy",
          });
        }

        if (!mapInstanceRef.current) return;

        markersRef.current.forEach((marker) => {
          marker.map = null;
        });
        markersRef.current = [];

        branches.forEach((branch) => {
          if (!branch.latitude || !branch.longitude) return;

          const lat = parseFloat(branch.latitude);
          const lng = parseFloat(branch.longitude);

          if (isNaN(lat) || isNaN(lng)) return;

          // استخدام أيقونة الفرع المرفقة بدون أي تعديل
          const branchIconUrl = getBranchIcon();
          const markerImg = document.createElement("img");
          markerImg.src = branchIconUrl;
          markerImg.style.cssText = "cursor: pointer; width: 40px; height: 48px;";

          const marker = new google.maps.marker.AdvancedMarkerElement({
            map: mapInstanceRef.current!,
            position: { lat, lng },
            content: markerImg,
            title: branch.branch,
            zIndex: 100,
          });

          const infoWindow = new google.maps.InfoWindow({ maxWidth: 280 });
          marker.addListener("click", () => {
            setSelectedBranch(branch);
            const div = document.createElement("div");
            const root = createRoot(div);
            root.render(
              <BranchMapPopup id={branch.id} name={branch.branch} address={branch.address || "لا يوجد عنوان"} status="Active" />
            );
            infoWindow.setContent(div);
            infoWindow.open(mapInstanceRef.current!, marker);
          });

          markersRef.current.push(marker);
        });

        technicians.forEach((tech) => {
          if (!tech.current_latitude || !tech.current_longitude) return;

          const lat = Number(tech.current_latitude);
          const lng = Number(tech.current_longitude);

          if (isNaN(lat) || isNaN(lng)) return;

          const techStatus = tech.status === "busy" ? "busy" : tech.status === "online" ? "available" : "soon";

          // استخدام أيقونة الفني المرفقة بدون أي تعديل
          const techIconUrl = getTechnicianIcon(tech.specialization || "");
          const markerImg = document.createElement("img");
          markerImg.src = techIconUrl;
          markerImg.style.cssText = "cursor: pointer; width: 40px; height: 48px;";

          const marker = new google.maps.marker.AdvancedMarkerElement({
            map: mapInstanceRef.current!,
            position: { lat, lng },
            content: markerImg,
            title: tech.name || "فني",
            zIndex: 200,
          });

          const infoWindow = new google.maps.InfoWindow({ maxWidth: 280 });

          marker.addListener("click", () => {
            const div = document.createElement("div");
            const root = createRoot(div);
            root.render(
              <TechnicianMapPopup
                name={tech.name || "فني غير معروف"}
                specialization={tech.specialization || "خدمة صيانة"}
                rating={tech.rating || 4.5}
                status={techStatus}
                availableIn={techStatus === "soon" ? 40 : undefined}
                onRequestService={() => handleRequestService(tech)}
              />
            );
            infoWindow.setContent(div);
            infoWindow.open(mapInstanceRef.current!, marker);
          });

          markersRef.current.push(marker);
        });
      } catch (error) {
        console.error("Map error:", error);
        if (mounted) setMapError(true);
      }
    };

    initMap();

    return () => {
      mounted = false;
      markersRef.current.forEach((marker) => {
        marker.map = null;
      });
      markersRef.current = [];
    };
  }, [technicians, branches]);

  const handleQuickRequest = () => {
    navigate("/quick-request-from-map");
  };

  const selectedSpecialtyConfig = SPECIALTIES.find((item) => item.id === selectedSpecialty);
  const filteredTechnicians = technicians.filter((tech) => {
    const specializationText = tech.specialization?.toLowerCase() || "";
    const matchesSpecialty =
      !selectedSpecialty ||
      selectedSpecialty === "all" ||
      selectedSpecialtyConfig?.keywords.some((keyword) => specializationText.includes(keyword.toLowerCase()));
    const matchesSearch =
      !searchQuery ||
      tech.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.specialization?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpecialty && matchesSearch;
  });

  const featuredBranch = selectedBranch || branches[0];
  const featuredTechnicians = filteredTechnicians.slice(0, 2);

  const statusLabel = (status: "available" | "busy" | "soon") =>
    status === "available" ? "متاح الآن" : status === "busy" ? "مشغول حالياً" : "متاح خلال 40 دقيقة";

  const statusClasses = (status: "available" | "busy" | "soon") =>
    status === "available"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : status === "busy"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-amber-50 text-amber-700 border-amber-200";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100" dir="rtl">
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 bg-gradient-to-br from-primary/90 to-primary/70 rounded-2xl flex items-center justify-center shadow-lg">
              <div className="relative">
                <span className="text-primary-foreground font-bold text-base">UF</span>
                <Cog
                  className="absolute -top-1 -right-1 h-2.5 w-2.5 text-primary-foreground/80 animate-spin"
                  style={{ animationDuration: "8s" }}
                />
              </div>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-primary font-semibold">Quick Maintenance Methods</p>
              <h1 className="text-lg font-bold text-slate-900">UberFix.shop – خريطة الخدمات</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <NotificationsList />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full border border-slate-200">
                  <Avatar className="h-10 w-10">
                    {userData?.avatarUrl ? (
                      <AvatarImage src={userData.avatarUrl} alt={userData.firstName} />
                    ) : (
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {userData?.firstName?.[0] || "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {userData ? `${userData.firstName} ${userData.lastName}` : "مستخدم"}
                    </p>
                    <p className="text-xs text-muted-foreground">{userData?.email || "user@example.com"}</p>
                    <p className="text-xs text-primary font-semibold">{userData?.role || "عميل"}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    <Home className="mr-2 h-4 w-4" />
                    <span>لوحة التحكم</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>الملف الشخصي</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>الإعدادات</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/maintenance-requests")}>
                    <ClipboardList className="mr-2 h-4 w-4" />
                    <span>طلبات الصيانة</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/vendor/profile")}>بروفايل المورد</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-5 space-y-4">
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p className="text-xs text-primary font-semibold tracking-wide">الخدمة عند طلبها</p>
              <h2 className="text-2xl font-bold text-slate-900">كل الفنيين والأفرع أمامك على الخريطة</h2>
              <p className="text-sm text-muted-foreground">
                حدد نوع الخدمة أو ابحث باسم الفني وشاهد حالة التوفر والوقت المتوقع للوصول.
              </p>
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="relative md:w-80">
                <Search className="w-4 h-4 text-muted-foreground absolute top-1/2 -translate-y-1/2 right-3" />
                <Input
                  placeholder="ابحث باسم الفني أو نوع الخدمة..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleQuickRequest}>
                  طلب صيانة سريع
                </Button>
                <Button variant="default" size="sm" onClick={handleQuickRequest}>
                  <MapPin className="w-4 h-4 ml-1" /> إلى خريطة الطلب
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">التخصصات:</span>
            {SPECIALTIES.map((specialty) => (
              <Button
                key={specialty.id}
                variant={selectedSpecialty === specialty.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSpecialty(selectedSpecialty === specialty.id ? null : specialty.id)}
                className="whitespace-nowrap"
              >
                <span className="ml-1">{specialty.icon}</span>
                {specialty.label}
              </Button>
            ))}
            <Badge variant="outline" className="ml-auto text-xs">
              {filteredTechnicians.length} فني متاح • {branches.length} فرع نشط
            </Badge>
          </div>
        </section>

        <section className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-xl bg-white">
          <div className="absolute inset-0">
            {mapError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/60">
                <Card className="p-6 max-w-md text-center space-y-3 shadow-lg">
                  <div className="flex items-center justify-center gap-2 text-primary mb-2">
                    <MapPin className="w-5 h-5" />
                    <span className="font-semibold">خريطة الخدمات غير متاحة حالياً</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    حدث خطأ أثناء تحميل خرائط Google. يرجى التأكد من إعداد مفتاح الخرائط في لوحة إعدادات النظام.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                    إعادة المحاولة
                  </Button>
                </Card>
              </div>
            ) : (
              <div ref={mapRef} className="absolute inset-0" />
            )}
          </div>

          {/* عرض الخريطة بملء الشاشة - البطاقات تظهر منبثقة عند الضغط على الأيقونات */}
          <div className="relative z-10 pointer-events-none h-[760px] w-full">
            {/* زر طلب الخدمة */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto">
              <Button size="lg" className="shadow-xl px-8" onClick={handleQuickRequest}>
                طلب الخدمة الآن
              </Button>
            </div>
            
            {/* شريط الفلاتر المبسط */}
            <div className="absolute top-4 left-4 pointer-events-auto">
              <div className="bg-white/90 backdrop-blur border border-slate-200 rounded-xl shadow-md p-2 flex flex-wrap gap-1">
                {SPECIALTIES.slice(1).map((specialty) => (
                  <Badge
                    key={specialty.id}
                    variant={selectedSpecialty === specialty.id ? "default" : "outline"}
                    className="cursor-pointer text-xs"
                    onClick={() => setSelectedSpecialty(selectedSpecialty === specialty.id ? null : specialty.id)}
                  >
                    <span className="ml-1">{specialty.icon}</span>
                    {specialty.label}
                  </Badge>
                ))}
              </div>
            </div>
            
            {/* معلومات سريعة */}
            <div className="absolute top-4 right-4 pointer-events-auto">
              <Badge variant="secondary" className="shadow-md text-xs">
                {filteredTechnicians.length} فني متاح • {branches.length} فرع
              </Badge>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
