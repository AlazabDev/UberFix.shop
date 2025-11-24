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
import { useBranchLocations } from "@/hooks/useBranchLocations";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationsList } from "@/components/notifications/NotificationsList";
import { BranchPopup } from "@/components/maps/BranchPopup";
import { TechnicianPopup } from "@/components/maps/TechnicianPopup";
import { BranchInfoCard } from "@/components/maps/BranchInfoCard";
import { createRoot } from "react-dom/client";
import { cn } from "@/lib/utils";
import { serviceCategoryLabelsAr } from "@/data/serviceCategories";

const specialties = serviceCategoryLabelsAr;

interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  role: string;
}

export default function ServiceMap() {
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mapError, setMapError] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);

  const { technicians, loading } = useTechnicians();
  const { branches } = useBranchLocations();
  const navigate = useNavigate();
  const { toast } = useToast();

  const branchHighlight = {
    id: "Az-Shop-0045",
    name: "Abu Auf",
    location: "Maadi 50",
    status: "Active",
  } as const;

  const technicianHighlights = [
    {
      id: "tech-1",
      name: "أحمد حسين",
      status: "available" as const,
      eta: "متاح بعد 40 دقيقة",
      position: { top: "36%", left: "58%" },
      icon: "/icons/technicians/tec-12.png",
    },
    {
      id: "tech-2",
      name: "محمود سمير",
      status: "busy" as const,
      eta: "مشغول اليوم",
      position: { top: "54%", left: "28%" },
      icon: "/icons/technicians/tec-18.png",
    },
    {
      id: "tech-3",
      name: "محمد هاني",
      status: "soon" as const,
      eta: "يكون متاح بعد قليل",
      position: { top: "22%", left: "74%" },
      icon: "/icons/technicians/tec-05.png",
    },
  ];

  const getStatusStyles = (status: "available" | "busy" | "soon") => {
    switch (status) {
      case "available":
        return "bg-emerald-50 border border-emerald-200 text-emerald-800";
      case "busy":
        return "bg-amber-50 border border-amber-200 text-amber-800";
      case "soon":
      default:
        return "bg-blue-50 border border-blue-200 text-blue-800";
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
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
        role: profile?.role === "admin" ? "مسؤول" : 
              profile?.role === "manager" ? "مدير" :
              profile?.role === "staff" ? "موظف" :
              profile?.role === "vendor" ? "فني" : "عميل"
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
        title: "خطأ",
        description: "فشل في تسجيل الخروج",
        variant: "destructive",
      });
    }
  };

  const getInitials = () => {
    if (!userData) return "م";
    const first = userData.firstName?.charAt(0) || "";
    const last = userData.lastName?.charAt(0) || "";
    return `${first}${last}` || "م";
  };

  const getFullName = () => {
    if (!userData) return "المستخدم";
    return `${userData.firstName} ${userData.lastName}`.trim() || "المستخدم";
  };

  useEffect(() => {
    let mounted = true;
    
    const initMap = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("get-maps-key");
        
        if (error || !data?.apiKey) {
          if (mounted) setMapError(true);
          return;
        }

        if (typeof window.google === 'undefined' || !window.google.maps) {
          await loadGoogleMaps(data.apiKey);
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        if (mapRef.current && !mapInstanceRef.current && mounted) {
          mapInstanceRef.current = new google.maps.Map(mapRef.current, {
            center: { lat: 30.0444, lng: 31.2357 },
            zoom: 13,
            mapTypeControl: true,
            fullscreenControl: true,
            streetViewControl: true,
            zoomControl: true,
            mapId: 'b41c60a3f8e58bdb15b2c668',
            clickableIcons: true,
            gestureHandling: 'greedy',
          });
        }
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
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

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

      const markerContent = document.createElement('img');
      markerContent.src = branch.icon || '/icons/properties/icon-5060.png';
      markerContent.style.cssText = 'width: 50px; height: 60px; object-fit: contain; cursor: pointer; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));';
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
        const div = document.createElement("div");
        const root = createRoot(div);
        root.render(
          <BranchPopup
            id={branch.id}
            name={branch.branch}
            address={branch.address || "لا يوجد عنوان"}
            status="Active"
          />
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

      // Get icon from tech data or use default
      const iconUrl = tech.profile_image || '/icons/technicians/tec-01.png';
      
      const markerContent = document.createElement('img');
      markerContent.src = iconUrl;
      markerContent.style.cssText = 'width: 45px; height: 55px; object-fit: contain; cursor: pointer; filter: drop-shadow(0 3px 5px rgba(0,0,0,0.4));';
      markerContent.alt = tech.name || "فني";

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
            name={tech.name || "فني"}
            specialization={tech.specialization || "فني عام"}
            rating={tech.rating || 4.5}
            totalReviews={tech.total_reviews || 20}
            status={techStatus}
            availableIn={techStatus === "soon" ? 40 : undefined}
            profileImage={tech.profile_image || undefined}
            onRequestService={() => {
              infoWindow.close();
              setTimeout(() => navigate("/quick-request"), 100);
            }}
          />
        );
        infoWindow.setContent(div);
        infoWindow.open(mapInstanceRef.current!, marker);
      });

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((marker) => {
        marker.map = null;
      });
      markersRef.current = [];
    };
  }, [technicians, branches]);

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
    <div className="min-h-screen bg-background flex flex-col" dir="rtl">
      <header className="bg-card/95 backdrop-blur-md border-b border-border/50 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 bg-gradient-to-br from-primary to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
            <div className="relative">
              <span className="text-primary-foreground font-bold text-base">A</span>
              <Cog className="absolute -top-1 -right-1 h-2.5 w-2.5 text-primary-foreground/80 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-primary">UberFix.shop</h1>
            <p className="text-xs text-muted-foreground">خريطة الخدمات</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NotificationsList />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 hover:bg-primary/10 transition-all duration-200 p-1 rounded-xl">
                <Avatar className="h-9 w-9 border-2 border-primary/30 shadow-lg ring-2 ring-primary/10 hover:ring-primary/30 transition-all">
                  <AvatarImage src={userData?.avatarUrl || "/lovable-uploads/fb9d438e-077d-4ce0-997b-709c295e2b35.png"} alt={getFullName()} className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold text-sm">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:block text-right">
                  <p className="text-sm font-semibold text-foreground">{getFullName()}</p>
                  <p className="text-xs text-muted-foreground">{userData?.role || "..."}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <p className="text-sm">{getFullName()}</p>
                <p className="text-xs text-muted-foreground">{userData?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <SettingsIcon className="ml-2 h-4 w-4" />
                الإعدادات
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="ml-2 h-4 w-4" />
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="bg-card border-b border-border px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="ابحث عن خدمة أو موقع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 h-10 text-right"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto">
            {specialties.map((specialty) => (
              <Button
                key={specialty.id}
                variant={selectedSpecialty === specialty.label ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSpecialty(selectedSpecialty === specialty.label ? null : specialty.label)}
                className="whitespace-nowrap"
              >
                <span className="mr-1">{specialty.icon}</span>
                {specialty.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <aside className="w-80 bg-card border-l border-border flex flex-col max-h-[calc(100vh-180px)]">
          {/* Branch Info Section */}
          <div className="p-3 flex-shrink-0 border-b border-border">
            <BranchInfoCard
              id="Az-Shop-0045"
              name="Abu Auf"
              location="Maadi 50"
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
                filteredTechnicians.map((tech) => (
                  <Card key={tech.id} className="p-3 hover:shadow-md transition-shadow">
                    <div className="flex gap-2">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={tech.profile_image || undefined} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {tech.name?.charAt(0) || "ف"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1 mb-0.5">
                          <h3 className="text-sm font-semibold text-foreground">
                            {tech.name || "فني"}
                          </h3>
                          <Badge variant="secondary" className={
                            tech.status === "online" ? "bg-green-100 text-green-700 text-xs" :
                            tech.status === "busy" ? "bg-yellow-100 text-yellow-700 text-xs" :
                            "bg-muted text-muted-foreground text-xs"
                          }>
                            {tech.status === "online" ? "متاح" :
                             tech.status === "busy" ? "مشغول" : "غير متاح"}
                          </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground mb-1.5">
                          {tech.specialization || "فني عام"}
                        </p>

                        <div className="flex items-center gap-2 text-xs mb-1.5">
                          <div className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-primary text-primary" />
                            <span className="font-medium">{tech.rating || "5.0"}</span>
                            <span className="text-muted-foreground">({tech.total_reviews || 0})</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {tech.hourly_rate || 150} ج/س
                          </span>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (tech.phone) window.open(`tel:${tech.phone}`, '_self');
                            }}
                            className="h-7 text-xs"
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
                <div className="text-center py-8 text-muted-foreground text-sm">
                  لا توجد خدمات متاحة حالياً
                </div>
              )}
            </div>
          </div>
        </aside>

        <main className="flex-1 relative">
          {mapError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="text-center p-8 bg-card rounded-lg shadow-md max-w-md">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">عذرًا، حدث خطأ!</h3>
                <p className="text-muted-foreground">لم يمكن تحميل خريطة Google. يرجى المحاولة مرة أخرى لاحقاً.</p>
              </div>
            </div>
          ) : (
            <div className="relative w-full h-full">
              <div ref={mapRef} className="w-full h-full" />

              <div className="pointer-events-none absolute inset-0">
                <div className="absolute top-4 left-4 bg-white/95 backdrop-blur rounded-xl shadow-xl border border-border/60 px-4 py-3 flex items-center gap-3 pointer-events-auto">
                  <img src="/logo/uberfix-logo.png" alt="UberFix" className="h-10 w-10 object-contain" />
                  <div>
                    <p className="text-xs text-muted-foreground">Quick Maintenance Methods</p>
                    <p className="text-lg font-bold text-primary">UberFix.shop</p>
                    <p className="text-xs text-muted-foreground">خريطة الخدمات</p>
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur rounded-2xl shadow-2xl border border-border/70 px-4 py-3 max-w-xs pointer-events-auto">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 text-primary font-bold rounded-xl px-3 py-2 text-xs">{branchHighlight.id}</div>
                    <div>
                      <p className="text-sm font-semibold">{branchHighlight.name}</p>
                      <p className="text-xs text-muted-foreground">{branchHighlight.location}</p>
                    </div>
                    <Badge className="rounded-full bg-emerald-100 text-emerald-700">{branchHighlight.status}</Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1"><User className="w-3 h-3" /> فنيين نشطين</div>
                    <div className="flex items-center gap-1"><FileText className="w-3 h-3" /> تقارير اليوم</div>
                    <div className="flex items-center gap-1"><Phone className="w-3 h-3" /> مركز الاتصال</div>
                    <div className="flex items-center gap-1"><Home className="w-3 h-3" /> منطقة الخدمة</div>
                  </div>
                </div>

                {technicianHighlights.map((card) => (
                  <div
                    key={card.id}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ top: card.position.top, left: card.position.left }}
                  >
                    <div className="relative flex flex-col items-center gap-2 pointer-events-auto">
                      <div className="bg-white/95 backdrop-blur rounded-xl shadow-lg border border-border/60 px-3 py-2 min-w-[180px]">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-10 w-10 border border-border">
                            <AvatarImage src={card.icon} alt={card.name} />
                            <AvatarFallback>{card.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-foreground">{card.name}</p>
                            <p className="text-xs text-muted-foreground mb-1">فني في المنطقة</p>
                            <div
                              className={cn(
                                "inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium",
                                getStatusStyles(card.status)
                              )}
                            >
                              <span className="inline-block w-2 h-2 rounded-full bg-current opacity-80"></span>
                              {card.eta}
                            </div>
                          </div>
                        </div>
                        <Button size="sm" className="w-full mt-2 text-xs" onClick={() => navigate("/quick-request")}>
                          اطلب الخدمة
                        </Button>
                      </div>
                      <div className="w-12 h-12 bg-primary/10 border-2 border-primary/40 rounded-full flex items-center justify-center shadow-md">
                        <img src={card.icon} alt="technician pin" className="h-8 w-8" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      <nav className="bg-card border-t border-border px-4 py-2 flex items-center justify-around">
        <Button variant="ghost" className="flex flex-col items-center gap-0.5 text-xs" onClick={() => navigate("/")}>
          <Home className="w-5 h-5" />
          <span>الرئيسية</span>
        </Button>
        <Button variant="ghost" className="flex flex-col items-center gap-0.5 text-xs" onClick={() => navigate("/requests")}>
          <ClipboardList className="w-5 h-5" />
          <span>الطلبات</span>
        </Button>
        <Button className="flex flex-col items-center gap-0.5 text-xs">
          <MapPin className="w-5 h-5" />
          <span>الخريطة</span>
        </Button>
      </nav>
    </div>
  );
}
