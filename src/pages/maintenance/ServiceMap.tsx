import { useState, useEffect, useRef } from "react";
import { Search, User, MapPin, Phone, Star, FileText, Home, ClipboardList, Settings as SettingsIcon, Cog, LogOut } from "lucide-react";
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
import { BranchInfoCard } from "@/components/maps/BranchInfoCard";
import { createRoot } from "react-dom/client";

declare global {
  interface Window {
    google: typeof google;
  }
}

interface Technician {
  id: string;
  name: string;
  phone: string | null;
  latitude: number;
  longitude: number;
  specialization: string | null;
  rating: number | null;
  status: "available" | "busy" | "offline";
}

interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: "مسؤول" | "مدير" | "موظف" | "فني" | "عميل";
}

const SPECIALTIES = [
  { id: "all", label: "كل التخصصات", icon: "🛠️" },
  { id: "electrician", label: "كهرباء", icon: "⚡" },
  { id: "plumber", label: "سباكة", icon: "🚿" },
  { id: "ac_technician", label: "تكييف", icon: "❄️" },
  { id: "carpenter", label: "نجارة", icon: "🪵" },
  { id: "painter", label: "دهانات", icon: "🎨" },
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

  const { technicians, loading } = useTechnicians();
  const { branches } = useBranchLocations();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (!selectedBranch && branches && branches.length > 0) {
      setSelectedBranch(branches[0]);
    }
  }, [branches, selectedBranch]);

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
        const { data, error } = await supabase
          .from("system_settings")
          .select("google_maps_api_key")
          .eq("id", 1)
          .maybeSingle();

        if (error) throw error;
        if (!data?.google_maps_api_key) {
          throw new Error("لم يتم إعداد مفتاح Google Maps في إعدادات النظام");
        }

        if (typeof window.google === "undefined" || !window.google.maps) {
          await loadGoogleMaps(data.google_maps_api_key);
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        if (mapRef.current && !mapInstanceRef.current && mounted) {
          mapInstanceRef.current = new google.maps.Map(mapRef.current, {
            center: { lat: 30.0444, lng: 31.2357 },
            zoom: 13,
            mapTypeControl: true,
            fullscreenControl: true,
            streetViewControl: true,
            zoomControl: true,
          });
        }

        if (!mapInstanceRef.current) return;

        // Clear existing markers
        markersRef.current.forEach((marker) => {
          marker.map = null;
        });
        markersRef.current = [];

        // Add branch markers from database
        branches.forEach((branch) => {
          if (!branch.latitude || !branch.longitude) return;

          const lat = parseFloat(branch.latitude);
          const lng = parseFloat(branch.longitude);

          if (isNaN(lat) || isNaN(lng)) return;

          const markerContent = document.createElement("img");
          markerContent.src = branch.icon || "/icons/properties/icon-5060.png";
          markerContent.style.cssText =
            "width: 50px; height: 60px; cursor: pointer; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));";
          markerContent.alt = branch.branch;

          const marker = new google.maps.marker.AdvancedMarkerElement({
            map: mapInstanceRef.current!,
            position: { lat, lng },
            content: markerContent,
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

        // Add technician markers with real data
        technicians.forEach((tech) => {
          if (!tech.current_latitude || !tech.current_longitude) return;

          const lat = Number(tech.current_latitude);
          const lng = Number(tech.current_longitude);

          if (isNaN(lat) || isNaN(lng)) return;

          const markerContent = document.createElement("div");
          markerContent.className = "relative flex items-center justify-center";

          const pin = document.createElement("div");
          pin.className =
            "w-11 h-11 rounded-full border-2 border-primary bg-background flex items-center justify-center shadow-lg";

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
          const techStatus = tech.status === "busy" ? "busy" : tech.status === "online" ? "available" : "soon";

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

  const handleQuickRequest = () => {
    navigate("/quick-request-from-map");
  };

  const filteredTechnicians = technicians.filter((tech) => {
    const matchesSpecialty =
      !selectedSpecialty ||
      selectedSpecialty === "all" ||
      tech.specialization?.toLowerCase().includes(selectedSpecialty.toLowerCase());
    const matchesSearch =
      !searchQuery ||
      tech.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tech.specialization?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSpecialty && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <header className="bg-card/95 backdrop-blur-md border-b border-border flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 bg-gradient-to-br from-primary/80 to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
            <div className="relative">
              <span className="text-primary-foreground font-bold text-base">A</span>
              <Cog
                className="absolute -top-1 -right-1 h-2.5 w-2.5 text-primary-foreground/80 animate-spin"
                style={{ animationDuration: "8s" }}
              />
            </div>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-primary">UberFix.shop</h1>
            <p className="text-xs text-muted-foreground">Quick Maintenance Methods – خريطة الخدمات</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationsList />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full border border-border/60">
                <Avatar className="h-9 w-9">
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
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>تسجيل الخروج</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row">
        <div className="flex-1 flex flex-col">
          <div className="border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3 flex flex-col gap-3">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <div className="flex-1 flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                    <Search className="w-4 h-4" />
                  </span>
                  <Input
                    placeholder="ابحث باسم الفني أو نوع الخدمة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-9"
                  />
                </div>
                <Button variant="outline" size="icon" onClick={handleQuickRequest} className="hidden md:inline-flex">
                  <MapPin className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2 justify-between md:justify-end">
                <Button variant="outline" size="sm" onClick={handleQuickRequest} className="flex items-center gap-2">
                  <span>طلب صيانة سريع</span>
                  <MapPin className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                اختر نوع الخدمة:
              </span>
              {SPECIALTIES.map((specialty) => (
                <Button
                  key={specialty.id}
                  variant={selectedSpecialty === specialty.label ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setSelectedSpecialty(selectedSpecialty === specialty.label ? null : specialty.label)
                  }
                  className="whitespace-nowrap"
                >
                  <span className="mr-1">{specialty.icon}</span>
                  {specialty.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex-1 relative">
            {mapError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/40">
                <Card className="p-6 max-w-md text-center space-y-3">
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
              <div ref={mapRef} className="w-full h-[600px] md:h-[calc(100vh-180px)] bg-muted" />
            )}
          </div>
        </div>

        <aside className="w-80 bg-card border-l border-border flex flex-col max-h-[calc(100vh-180px)]">
          {/* Branch Info Section */}
          <div className="p-3 flex-shrink-0 border-b border-border">
            <BranchInfoCard
              id={selectedBranch?.id || "Az-Shop-0000"}
              name={selectedBranch?.branch_type || selectedBranch?.branch || "فرع غير محدد"}
              location={selectedBranch?.branch || selectedBranch?.address || "لم يتم اختيار فرع"}
              status="Active"
            />
          </div>

          {/* Available Services */}
          <div className="p-3 flex-shrink-0 border-b border-border">
            <h2 className="text-base font-bold text-foreground mb-1">
              الخدمات المتاحة ({filteredTechnicians.length})
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-3">
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">جاري التحميل...</div>
              ) : filteredTechnicians.length > 0 ? (
                filteredTechnicians.map((tech) => {
                  const techStatus =
                    tech.status === "busy" ? "busy" : tech.status === "online" ? "available" : "soon";
                  return (
                    <Card
                      key={tech.id}
                      className="p-3 cursor-pointer hover:bg-muted/60 transition-colors"
                      onClick={() => handleRequestService(tech)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-semibold text-sm">{tech.name || "فني مجهول"}</h3>
                            <Badge
                              variant="outline"
                              className={
                                techStatus === "available"
                                  ? "border-green-500 text-green-600"
                                  : techStatus === "busy"
                                  ? "border-red-500 text-red-600"
                                  : "border-yellow-500 text-yellow-600"
                              }
                            >
                              {techStatus === "available"
                                ? "متاح الآن"
                                : techStatus === "busy"
                                ? "مشغول اليوم"
                                : "متاح قريباً"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{tech.specialization || "خدمة صيانة"}</span>
                          </p>
                          {tech.phone && (
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              <span>{tech.phone}</span>
                            </p>
                          )}
                          <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <span>{tech.rating || 4.5}</span>
                              <span>({12} تقييم)</span>
                            </div>
                            <Button variant="outline" size="xs" className="h-7 px-2 text-[11px]">
                              <FileText className="w-3 h-3 ml-1" />
                              تفاصيل الفني
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  لا يوجد فنيون متاحون حالياً وفقاً لمعايير البحث المحددة.
                </div>
              )}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
