import { useState, useEffect, useRef } from "react";
import { Search, User, MapPin, Phone, Star, Home, ClipboardList, Settings as SettingsIcon, Cog, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { loadGoogleMaps } from "@/lib/googleMapsLoader";
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
import { TechnicianPopup } from "@/components/maps/TechnicianPopup";
import { BranchPopup } from "@/components/maps/BranchPopup";
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
            center: { lat: 30.0444, lng: 31.2357 },
            zoom: 13,
            styles: MAP_STYLE,
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

          const markerWrapper = document.createElement("div");
          markerWrapper.className = "relative flex items-center justify-center";

          const markerContent = document.createElement("div");
          markerContent.className =
            "w-14 h-14 rounded-full bg-white border-2 border-primary/60 shadow-xl flex items-center justify-center";

          const iconImg = document.createElement("img");
          iconImg.src = branch.icon || "/icons/properties/icon-5060.png";
          iconImg.alt = branch.branch;
          iconImg.style.cssText = "width: 38px; height: 46px";
          markerContent.appendChild(iconImg);

          const statusDot = document.createElement("span");
          statusDot.className =
            "absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm";

          markerWrapper.appendChild(markerContent);
          markerWrapper.appendChild(statusDot);

          const marker = new google.maps.marker.AdvancedMarkerElement({
            map: mapInstanceRef.current!,
            position: { lat, lng },
            content: markerWrapper,
            title: branch.branch,
            zIndex: 100,
          });

          const infoWindow = new google.maps.InfoWindow();
          marker.addListener("click", () => {
            setSelectedBranch(branch);
            const div = document.createElement("div");
            const root = createRoot(div);
            root.render(
              <BranchPopup id={branch.id} name={branch.branch} address={branch.address || "لا يوجد عنوان"} status="Active" />
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

          const markerContent = document.createElement("div");
          markerContent.className = "relative flex items-center justify-center";

          const pin = document.createElement("div");
          pin.className =
            techStatus === "available"
              ? "w-12 h-12 rounded-full border-2 border-emerald-500 bg-white flex items-center justify-center shadow-lg"
              : techStatus === "busy"
              ? "w-12 h-12 rounded-full border-2 border-red-500 bg-white flex items-center justify-center shadow-lg"
              : "w-12 h-12 rounded-full border-2 border-amber-400 bg-white flex items-center justify-center shadow-lg";

          const icon = document.createElement("div");
          icon.className = "text-xl";

          if (tech.specialization?.toLowerCase().includes("كهرب") || tech.specialization?.toLowerCase().includes("elect")) {
            icon.textContent = "⚡";
          } else if (tech.specialization?.toLowerCase().includes("سباك") || tech.specialization?.toLowerCase().includes("plumb")) {
            icon.textContent = "🚿";
          } else if (tech.specialization?.toLowerCase().includes("تكييف") || tech.specialization?.toLowerCase().includes("ac")) {
            icon.textContent = "❄️";
          } else if (tech.specialization?.toLowerCase().includes("نجار") || tech.specialization?.toLowerCase().includes("carp")) {
            icon.textContent = "🪵";
          } else if (tech.specialization?.toLowerCase().includes("دهان") || tech.specialization?.toLowerCase().includes("paint")) {
            icon.textContent = "🎨";
          } else {
            icon.textContent = "🛠️";
          }

          pin.appendChild(icon);
          markerContent.appendChild(pin);

          const marker = new google.maps.marker.AdvancedMarkerElement({
            map: mapInstanceRef.current!,
            position: { lat, lng },
            content: markerContent,
            title: tech.name || "فني",
            zIndex: 200,
          });

          const infoWindow = new google.maps.InfoWindow();

          marker.addListener("click", () => {
            const div = document.createElement("div");
            const root = createRoot(div);
            root.render(
              <TechnicianPopup
                name={tech.name || "فني غير معروف"}
                specialization={tech.specialization || "خدمة صيانة"}
                rating={tech.rating || 4.5}
                totalReviews={12}
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

          <div className="relative z-10 pointer-events-none h-[760px] w-full p-5">
            <div className="absolute top-5 left-5 w-full max-w-[340px] pointer-events-auto space-y-3">
              <div className="bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-lg p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-primary">{featuredBranch?.id || "Az-Shop-0000"}</p>
                    <h3 className="text-lg font-bold text-slate-900">{featuredBranch?.branch || "فرع غير محدد"}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {featuredBranch?.address || "لم يتم اختيار فرع"}
                    </p>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Active</Badge>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                    متاح مباشرة
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" /> 0100 123 4567
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button className="flex-1" onClick={handleQuickRequest}>
                    طلب الخدمة
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => setSelectedBranch(branches[1] || null)}>
                    تبديل الفرع
                  </Button>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur border border-slate-200 rounded-2xl shadow-md p-3">
                <p className="text-sm font-semibold text-slate-800 mb-2">الخدمات القريبة</p>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.slice(1).map((specialty) => (
                    <Badge
                      key={specialty.id}
                      variant={selectedSpecialty === specialty.id ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedSpecialty(selectedSpecialty === specialty.id ? null : specialty.id)}
                    >
                      <span className="ml-1">{specialty.icon}</span>
                      {specialty.label}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute top-5 right-5 w-full max-w-[340px] pointer-events-auto space-y-3">
              <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-2xl shadow-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold">طلب صيانة سريع</p>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">خريطة الخدمات</span>
                </div>
                <p className="text-sm text-primary-foreground/90 mb-3">
                  اختر الفني الأقرب واضغط على طلب الخدمة ليصل إليك خلال دقائق.
                </p>
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-white/15 rounded-lg py-2">
                    <p className="font-semibold">{filteredTechnicians.length}</p>
                    <p>فني متاح</p>
                  </div>
                  <div className="bg-white/15 rounded-lg py-2">
                    <p className="font-semibold">{branches.length}</p>
                    <p>فرع نشط</p>
                  </div>
                </div>
              </div>

              {featuredTechnicians.map((tech) => {
                const techStatus = tech.status === "busy" ? "busy" : tech.status === "online" ? "available" : "soon";
                return (
                  <div
                    key={tech.id}
                    className="bg-white/95 backdrop-blur border border-slate-200 rounded-2xl shadow-lg p-4 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold text-slate-900">{tech.name || "فني"}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {tech.specialization || "خدمة صيانة"}
                            </p>
                          </div>
                          <Badge className={statusClasses(techStatus)}>{statusLabel(techStatus)}</Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                          <Phone className="w-3 h-3" />
                          <span>{tech.phone || "0109 000 0000"}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span>{tech.rating || 4.5}</span>
                        <span>(+12 تقييم)</span>
                      </div>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {techStatus === "soon" ? "متاح خلال 40 دقيقة" : "متاح في دائرتك"}
                      </span>
                    </div>
                    <Button className="w-full" onClick={() => handleRequestService(tech)}>
                      طلب الخدمة
                    </Button>
                  </div>
                );
              })}

              {featuredTechnicians.length === 0 && (
                <div className="bg-white/95 backdrop-blur border border-dashed border-slate-300 rounded-2xl p-4 text-sm text-muted-foreground text-center">
                  لا يوجد فنيون متاحون حالياً. جرّب تعديل الفلاتر أو أعد المحاولة بعد قليل.
                </div>
              )}
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-auto">
              <Button size="lg" className="shadow-xl px-8" onClick={handleQuickRequest}>
                طلب الخدمة الآن
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
