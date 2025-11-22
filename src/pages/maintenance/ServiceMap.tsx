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
import { createRoot } from "react-dom/client";

const specialties = [
  { id: "paint", label: "دهان", icon: "🎨" },
  { id: "carpentry", label: "نجار", icon: "🔨" },
  { id: "electrical", label: "كهربائي", icon: "⚡" },
  { id: "plumbing", label: "سباك", icon: "🔧" },
];

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
  const markersRef = useRef<google.maps.Marker[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);

  const { technicians, loading } = useTechnicians();
  const { branches } = useBranchLocations();
  const navigate = useNavigate();
  const { toast } = useToast();

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
    let retryCount = 0;
    const maxRetries = 3;
    
    const initMap = async () => {
      try {
        console.warn("🗺️ Starting map initialization...");
        
        const { data, error } = await supabase.functions.invoke("get-maps-key");
        
        if (error) {
          console.error("❌ Failed to get API key:", error);
          if (mounted && retryCount < maxRetries) {
            retryCount++;
            console.warn(`🔄 Retrying... (${retryCount}/${maxRetries})`);
            setTimeout(() => initMap(), 2000);
            return;
          }
          if (mounted) {
            setMapError(true);
            console.error("❌ Max retries reached, showing error message");
          }
          return;
        }
        
        if (!data?.apiKey) {
          console.error("❌ No API key returned from edge function");
          if (mounted) setMapError(true);
          return;
        }
        
        console.warn("✅ API key received successfully:", data.apiKey.substring(0, 15) + "...");

        
        // تحقق من وجود Google Maps
        if (typeof window.google !== 'undefined' && window.google.maps) {
          console.warn("✅ Google Maps already loaded, reusing instance");
        } else {
          console.warn("📦 Loading Google Maps script with key...");
          try {
            await loadGoogleMaps(data.apiKey);
            console.warn("✅ Google Maps script loaded successfully");
          } catch (loadError) {
            console.error("❌ Error loading Google Maps script:", loadError);
            if (mounted) setMapError(true);
            return;
          }
        }

        // انتظر قليلاً للتأكد من تحميل Google Maps
        await new Promise(resolve => setTimeout(resolve, 500));

        if (typeof window.google === 'undefined' || !window.google.maps) {
          throw new Error("Google Maps failed to load");
        }

        if (mapRef.current && !mapInstanceRef.current && mounted) {
          console.warn("🗺️ Creating map instance...");
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
          
          console.warn("✅ Map instance created successfully");
          
          // أضف حدث للتأكد من تحميل الخريطة
          google.maps.event.addListenerOnce(mapInstanceRef.current, 'idle', () => {
            console.warn("✅ Map is fully loaded and idle");
          });
        }
      } catch (error) {
        console.error("❌ Map loading error:", error);
        if (mounted && retryCount < maxRetries) {
          retryCount++;
          console.warn(`🔄 Retrying after error... (${retryCount}/${maxRetries})`);
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
    if (!mapInstanceRef.current || !branches.length) {
      console.warn("⏳ Waiting for map or branches:", {
        hasMap: !!mapInstanceRef.current,
        branchCount: branches.length
      });
      return;
    }

    console.warn("🚀 Adding markers to map...");
    console.warn(`📍 Found ${branches.length} branches to display`);

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    let branchMarkersAdded = 0;
    
    // Add markers for branches
    branches.forEach((branch) => {
      if (branch.latitude && branch.longitude) {
        const lat = parseFloat(branch.latitude);
        const lng = parseFloat(branch.longitude);
        
        console.log(`Branch: ${branch.branch}, lat: ${lat}, lng: ${lng}`);
        
        if (!isNaN(lat) && !isNaN(lng) && lat >= 20 && lat <= 35 && lng >= 25 && lng <= 40) {
          // Create custom pin element for branch
          const pinElement = document.createElement('div');
          pinElement.innerHTML = `
            <div style="
              width: 40px;
              height: 40px;
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid white;
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
            ">
              <svg style="transform: rotate(45deg);" width="20" height="20" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              </svg>
            </div>
          `;
          
          const marker = new google.maps.Marker({
            position: { lat, lng },
            map: mapInstanceRef.current!,
            title: branch.branch,
            icon: {
              url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="40" height="50" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                      <feOffset dx="0" dy="2" result="offsetblur"/>
                      <feComponentTransfer>
                        <feFuncA type="linear" slope="0.3"/>
                      </feComponentTransfer>
                      <feMerge>
                        <feMergeNode/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <circle cx="20" cy="20" r="15" fill="#3b82f6" stroke="white" stroke-width="3" filter="url(#shadow)"/>
                  <path d="M20 12 L20 20 L16 24 L20 28 L24 24 L20 20" fill="white"/>
                </svg>
              `),
              scaledSize: new google.maps.Size(40, 50),
              anchor: new google.maps.Point(20, 50),
            },
          });

          // Create info window for branch
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
          branchMarkersAdded++;
        } else {
          console.warn(`❌ Invalid coordinates for branch: ${branch.branch}`);
        }
      }
    });

    console.warn(`✅ Added ${branchMarkersAdded} branch markers to map`);

    // Add markers for random technicians in Cairo/Giza area
    const randomTechnicianIcons = [
      "tec-01.png", "tec-05.png", "tec-10.png", "tec-15.png", "tec-20.png",
      "tec-25.png", "tec-30.png", "tec-35.png", "tec-40.png", "tec-45.png"
    ];

    console.warn("👷 Adding technician markers...");

    // Generate 10 random technician positions in Cairo/Giza area
    const cairoCenter = { lat: 30.0444, lng: 31.2357 };
    const radius = 0.15; // roughly 15km radius

    let techMarkersAdded = 0;

    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius;
      const lat = cairoCenter.lat + (distance * Math.cos(angle));
      const lng = cairoCenter.lng + (distance * Math.sin(angle));
      
      const iconIndex = i % randomTechnicianIcons.length;
      const tech = technicians[i] || {
        id: `random-${i}`,
        name: `فني ${i + 1}`,
        specialization: ["سباك", "كهربائي", "نجار", "دهان"][i % 4],
        rating: 4 + Math.random(),
        total_reviews: Math.floor(Math.random() * 50) + 10,
        status: ["available", "busy", "soon"][Math.floor(Math.random() * 3)] as "available" | "busy" | "soon",
        profile_image: undefined,
      };

      const techStatus = (tech.status === "available" || tech.status === "busy" || tech.status === "soon") 
        ? tech.status 
        : "soon";

      // Choose color based on status
      const statusColor = techStatus === "available" ? "#10b981" : 
                         techStatus === "busy" ? "#ef4444" : "#f59e0b";
      
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: mapInstanceRef.current!,
        title: tech.name || "فني",
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="50" height="60" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <filter id="shadow${i}" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                  <feOffset dx="0" dy="2" result="offsetblur"/>
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.4"/>
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <circle cx="25" cy="25" r="18" fill="${statusColor}" stroke="white" stroke-width="3" filter="url(#shadow${i})"/>
              <path d="M25 15 L25 25 L30 30 M25 25 L20 30" stroke="white" stroke-width="2.5" stroke-linecap="round" fill="none"/>
              <circle cx="25" cy="25" r="2" fill="white"/>
            </svg>
          `),
          scaledSize: new google.maps.Size(50, 60),
          anchor: new google.maps.Point(25, 60),
        },
        optimized: false,
      });

      // Create info window for technician
      const infoWindow = new google.maps.InfoWindow();
      
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
            profileImage={undefined}
            onRequestService={() => {
              navigate("/quick-request");
              infoWindow.close();
            }}
          />
        );
        infoWindow.setContent(div);
        infoWindow.open(mapInstanceRef.current!, marker);
      });

      markersRef.current.push(marker);
      techMarkersAdded++;
    }

    console.warn(`✅ Added ${techMarkersAdded} technician markers to map`);
    console.warn(`🎯 Total markers on map: ${markersRef.current.length}`);
  }, [technicians, branches, navigate]);

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
      {/* Unified Header */}
      <header className="bg-card/95 backdrop-blur-md border-b border-border/50 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        {/* Logo */}
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

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <NotificationsList />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 hover:bg-primary/10 transition-all duration-200 p-1 rounded-xl"
              >
                <Avatar className="h-9 w-9 border-2 border-primary/30 shadow-lg ring-2 ring-primary/10 hover:ring-primary/30 transition-all">
                  <AvatarImage 
                    src={userData?.avatarUrl || "/lovable-uploads/fb9d438e-077d-4ce0-997b-709c295e2b35.png"} 
                    alt={getFullName()} 
                    className="object-cover"
                  />
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
            <DropdownMenuContent align="end" className="w-64 bg-card/95 backdrop-blur-md border-border/50 shadow-xl">
              <DropdownMenuLabel className="text-right py-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-primary/20">
                    <AvatarImage 
                      src={userData?.avatarUrl || "/lovable-uploads/fb9d438e-077d-4ce0-997b-709c295e2b35.png"} 
                      alt={getFullName()} 
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground font-bold">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col space-y-1 flex-1">
                    <p className="text-sm font-semibold leading-none">{getFullName()}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userData?.email || "..."}
                    </p>
                    <span className="text-xs text-primary font-medium">{userData?.role || "..."}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => navigate("/settings")}
              >
                <User className="ml-2 h-4 w-4 text-primary" />
                <span>الملف الشخصي</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer hover:bg-primary/10 transition-colors"
                onClick={() => navigate("/settings")}
              >
                <SettingsIcon className="ml-2 h-4 w-4 text-primary" />
                <span>الإعدادات</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout} 
                className="text-destructive cursor-pointer hover:bg-destructive/10 focus:text-destructive focus:bg-destructive/10 transition-colors"
              >
                <LogOut className="ml-2 h-4 w-4" />
                <span>تسجيل الخروج</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Search Bar and Filters Combined */}
      <div className="bg-card border-b border-border px-4 sm:px-6 py-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Search */}
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
          
          {/* Specialty Filters */}
          <div className="flex gap-2 overflow-x-auto">
            {specialties.map((specialty) => (
              <Button
                key={specialty.id}
                variant={selectedSpecialty === specialty.label ? "default" : "outline"}
                size="sm"
                onClick={() =>
                  setSelectedSpecialty(
                    selectedSpecialty === specialty.label ? null : specialty.label
                  )
                }
                className="whitespace-nowrap"
              >
                <span className="mr-1">{specialty.icon}</span>
                {specialty.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Technicians List (تصغير 20%) */}
        <aside className="w-64 bg-card border-l border-border flex flex-col max-h-[calc(100vh-180px)]">
          <div className="p-3 flex-shrink-0 border-b border-border">
            <h2 className="text-base font-bold text-foreground mb-1">
              الخدمات المتاحة ({filteredTechnicians.length})
            </h2>
            <p className="text-xs text-muted-foreground">
              اختر فني من القائمة أدناه
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto px-3 py-3 scrollbar-thin scrollbar-thumb-muted scrollbar-track-muted/30">
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
                          <Badge
                            variant="secondary"
                            className={
                              tech.status === "online"
                                ? "bg-green-100 text-green-700 text-xs"
                                : tech.status === "busy"
                                ? "bg-yellow-100 text-yellow-700 text-xs"
                                : "bg-muted text-muted-foreground text-xs"
                            }
                          >
                            {tech.status === "online"
                              ? "متاح"
                              : tech.status === "busy"
                              ? "مشغول"
                              : "غير متاح"}
                          </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground mb-1.5">
                          {tech.specialization || "فني عام"}
                        </p>

                        <div className="flex items-center gap-2 text-xs mb-1.5">
                          <div className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-primary text-primary" />
                            <span className="font-medium">
                              {tech.rating || "5.0"}
                            </span>
                            <span className="text-muted-foreground">
                              ({tech.total_reviews || 0})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {tech.hourly_rate || 150} ج/س
                          </span>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (tech.phone) {
                                window.open(`tel:${tech.phone}`, '_self');
                              }
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

        {/* Map Area */}
        <main className="flex-1 relative">
          {mapError ? (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="text-center p-8 bg-card rounded-lg shadow-md max-w-md">
                <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-destructive" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  عذرًا، حدث خطأ!
                </h3>
                <p className="text-muted-foreground">
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
      <nav className="bg-card border-t border-border px-4 py-2 flex items-center justify-around">
        <Button 
          variant="ghost" 
          className="flex flex-col items-center gap-0.5 text-xs hover:bg-primary/10"
          onClick={() => navigate("/")}
        >
          <Home className="w-5 h-5" />
          <span>الرئيسية</span>
        </Button>
        <Button 
          variant="ghost" 
          className="flex flex-col items-center gap-0.5 text-xs hover:bg-primary/10"
          onClick={() => navigate("/invoices")}
        >
          <FileText className="w-5 h-5" />
          <span>الفواتير</span>
        </Button>
        <Button 
          variant="ghost" 
          className="flex flex-col items-center gap-0.5 text-xs hover:bg-primary/10"
          onClick={() => navigate("/requests")}
        >
          <ClipboardList className="w-5 h-5" />
          <span>الطلبات</span>
        </Button>
        <Button 
          variant="ghost" 
          className="flex flex-col items-center gap-0.5 text-xs hover:bg-primary/10"
          onClick={() => navigate("/settings")}
        >
          <SettingsIcon className="w-5 h-5" />
          <span>الإعدادات</span>
        </Button>
        <Button
          className="flex flex-col items-center gap-0.5 text-xs bg-primary hover:bg-primary/90 px-4"
        >
          <MapPin className="w-5 h-5" />
          <span>الخريطة</span>
        </Button>
      </nav>
    </div>
  );
}
