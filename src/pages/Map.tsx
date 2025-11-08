import { GoogleMap } from "@/components/maps/GoogleMap";
import { Input } from "@/components/ui/input";
import { Search, Phone, Globe, Loader2, Users, MapPin, Navigation2, SlidersHorizontal, Star, X } from "lucide-react";
import { useState, useMemo } from "react";
import { useBranches2 } from "@/hooks/useBranches2";
import { useTechnicians } from "@/hooks/useTechnicians";
import { parseLocation } from "@/utils/mapIconHelper";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

export default function Map() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<any>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<any>(null);
  const [showLayer, setShowLayer] = useState<'all' | 'branches' | 'technicians'>('all');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedSpecialization, setSelectedSpecialization] = useState<string>("");
  
  // Filters
  const [minRating, setMinRating] = useState(0);
  const [maxDistance, setMaxDistance] = useState(50); // km
  
  const { branches, loading: branchesLoading } = useBranches2();
  const { technicians, specializationIcons, loading: techniciansLoading } = useTechnicians();
  const navigate = useNavigate();
  const { toast } = useToast();

  const loading = branchesLoading || techniciansLoading;

  // Get current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "الموقع غير مدعوم",
        description: "متصفحك لا يدعم خدمة تحديد الموقع",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "جاري تحديد موقعك...",
      description: "الرجاء الانتظار",
    });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(location);
        toast({
          title: "تم تحديد موقعك",
          description: "يمكنك الآن رؤية الفنيين القريبين منك",
        });
      },
      (error) => {
        toast({
          title: "خطأ في تحديد الموقع",
          description: "الرجاء السماح للتطبيق بالوصول لموقعك",
          variant: "destructive",
        });
      }
    );
  };

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Filter branches based on search
  const filteredBranches = useMemo(() => {
    if (!searchQuery) return branches;
    const query = searchQuery.toLowerCase();
    return branches.filter(
      (b) =>
        b.name?.toLowerCase().includes(query) ||
        b.location?.toLowerCase().includes(query) ||
        b.category?.toLowerCase().includes(query)
    );
  }, [branches, searchQuery]);

  // Filter technicians based on search, specialization, rating, and distance
  const filteredTechnicians = useMemo(() => {
    let filtered = technicians;
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.name?.toLowerCase().includes(query) ||
          t.specialization?.toLowerCase().includes(query)
      );
    }
    
    // Specialization filter
    if (selectedSpecialization) {
      filtered = filtered.filter(t => t.specialization === selectedSpecialization);
    }
    
    // Rating filter
    if (minRating > 0) {
      filtered = filtered.filter(t => t.rating >= minRating);
    }
    
    // Distance filter (only if user location is available)
    if (userLocation && maxDistance < 50) {
      filtered = filtered.filter(t => {
        if (!t.current_latitude || !t.current_longitude) return false;
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          t.current_latitude,
          t.current_longitude
        );
        return distance <= maxDistance;
      });
    }
    
    // Sort by distance if user location is available
    if (userLocation) {
      filtered = [...filtered].sort((a, b) => {
        if (!a.current_latitude || !a.current_longitude) return 1;
        if (!b.current_latitude || !b.current_longitude) return -1;
        
        const distA = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          a.current_latitude,
          a.current_longitude
        );
        const distB = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          b.current_latitude,
          b.current_longitude
        );
        return distA - distB;
      });
    }
    
    return filtered;
  }, [technicians, searchQuery, selectedSpecialization, minRating, maxDistance, userLocation]);

  // Get icon for specialization
  const getSpecializationIcon = (specialization: string) => {
    const icon = specializationIcons.find(i => i.name === specialization);
    return {
      icon: icon?.icon_path || '/icons/pin-pro/pin-pro-32.svg',
      color: icon?.color || '#f5bf23',
      name_ar: icon?.name_ar || specialization
    };
  };

  // Convert branches to map markers
  const branchMarkers = useMemo(() => {
    if (showLayer === 'technicians') return [];
    
    return filteredBranches
      .map((branch) => {
        const coords = parseLocation(branch.location);
        if (!coords) return null;

        return {
          id: `branch-${branch.id}`,
          lat: coords.lat,
          lng: coords.lng,
          title: branch.name,
          type: 'branch' as const,
          icon: '/icons/pin-pro/pin-pro-49.svg', // محل Abou Auf
          color: '#1800ad', // أزرق
          data: branch,
        };
      })
      .filter((m) => m !== null);
  }, [filteredBranches, showLayer]);

  // Convert technicians to map markers
  const technicianMarkers = useMemo(() => {
    if (showLayer === 'branches') return [];
    
    return filteredTechnicians
      .filter(t => t.current_latitude && t.current_longitude)
      .map((tech) => {
        const specIcon = getSpecializationIcon(tech.specialization);
        
        return {
          id: `tech-${tech.id}`,
          lat: tech.current_latitude!,
          lng: tech.current_longitude!,
          title: tech.name,
          type: 'technician' as const,
          icon: specIcon.icon,
          color: specIcon.color,
          data: { ...tech, specializationNameAr: specIcon.name_ar },
        };
      });
  }, [filteredTechnicians, specializationIcons, showLayer]);

  // Combine all markers
  const allMarkers = useMemo(() => {
    return [...branchMarkers, ...technicianMarkers];
  }, [branchMarkers, technicianMarkers]);

  // Calculate center from markers or user location
  const mapCenter = useMemo(() => {
    if (userLocation) {
      return userLocation;
    }
    if (allMarkers.length === 0) {
      return { lat: 30.0444, lng: 31.2357 }; // Cairo default
    }
    const avgLat = allMarkers.reduce((sum, m) => sum + m!.lat, 0) / allMarkers.length;
    const avgLng = allMarkers.reduce((sum, m) => sum + m!.lng, 0) / allMarkers.length;
    return { lat: avgLat, lng: avgLng };
  }, [allMarkers, userLocation]);
  
  // Get distance for a technician
  const getDistance = (tech: any): number | null => {
    if (!userLocation || !tech.current_latitude || !tech.current_longitude) return null;
    return calculateDistance(
      userLocation.lat,
      userLocation.lng,
      tech.current_latitude,
      tech.current_longitude
    );
  };

  const handleMarkerClick = (marker: any) => {
    if (marker.type === 'branch') {
      setSelectedBranch(marker.data);
      setSelectedTechnician(null);
    } else if (marker.type === 'technician') {
      setSelectedTechnician(marker.data);
      setSelectedBranch(null);
    }
  };

  const handleRequestService = (id: string) => {
    navigate('/service-request', { state: { technicianId: id } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b border-border py-6 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3 mb-3">
            <MapPin className="h-8 w-8 md:h-10 md:w-10 text-primary" />
            <h1 className="text-2xl md:text-4xl font-bold text-center text-foreground">
              UberFix.shop
            </h1>
          </div>
          <p className="text-center text-muted-foreground text-sm md:text-base mb-4">
            اطلب فني صيانة بضغطة زر - خدمة فورية احترافية
          </p>
          
          {/* Stats & Actions */}
          <div className="flex justify-center gap-3 flex-wrap items-center">
            <Badge variant="secondary" className="px-3 py-1.5">
              <Users className="h-4 w-4 ml-2" />
              {filteredTechnicians.length} فني متاح
            </Badge>
            <Badge variant="secondary" className="px-3 py-1.5">
              <MapPin className="h-4 w-4 ml-2" />
              {branches.length} فرع
            </Badge>
            <Button
              onClick={getCurrentLocation}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <Navigation2 className="h-4 w-4" />
              موقعي الحالي
            </Button>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              size="sm"
              variant="outline"
              className="gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              تصفية
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-background border-b border-border py-4">
          <div className="container mx-auto px-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">تصفية متقدمة</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Specialization Filter */}
                  <div className="space-y-2">
                    <Label>التخصص</Label>
                    <select
                      value={selectedSpecialization}
                      onChange={(e) => setSelectedSpecialization(e.target.value)}
                      className="w-full p-2 rounded-md border border-border bg-background"
                    >
                      <option value="">جميع التخصصات</option>
                      {specializationIcons.map((spec) => (
                        <option key={spec.id} value={spec.name}>
                          {spec.name_ar}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Rating Filter */}
                  <div className="space-y-2">
                    <Label>الحد الأدنى للتقييم: {minRating} ⭐</Label>
                    <Slider
                      value={[minRating]}
                      onValueChange={(v) => setMinRating(v[0])}
                      min={0}
                      max={5}
                      step={0.5}
                      className="w-full"
                    />
                  </div>

                  {/* Distance Filter */}
                  <div className="space-y-2">
                    <Label>أقصى مسافة: {maxDistance} كم</Label>
                    <Slider
                      value={[maxDistance]}
                      onValueChange={(v) => setMaxDistance(v[0])}
                      min={5}
                      max={50}
                      step={5}
                      className="w-full"
                      disabled={!userLocation}
                    />
                    {!userLocation && (
                      <p className="text-xs text-muted-foreground">
                        قم بتفعيل موقعك أولاً
                      </p>
                    )}
                  </div>
                </div>

                {/* Reset Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedSpecialization("");
                    setMinRating(0);
                    setMaxDistance(50);
                  }}
                >
                  إعادة تعيين الفلاتر
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="container mx-auto px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="ابحث عن فني أو فرع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>
      </div>

      {/* Map Section with Sidebar */}
      <div className="container mx-auto px-4 pb-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-[600px] rounded-lg bg-muted border">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">جاري تحميل الخريطة...</p>
          </div>
        ) : (
          <div className="flex gap-4 relative">
            {/* Sidebar - Technicians List */}
            {showSidebar && (
              <Card className="w-80 shrink-0">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      الخدمات المتاحة ({filteredTechnicians.length})
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSidebar(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-2 p-4">
                      {filteredTechnicians
                        .filter(t => t.current_latitude && t.current_longitude)
                        .map((tech) => {
                          const specIcon = getSpecializationIcon(tech.specialization);
                          const distance = getDistance(tech);
                          
                          return (
                            <Card
                              key={tech.id}
                              className={`cursor-pointer transition-all hover:shadow-md ${
                                selectedTechnician?.id === tech.id ? 'border-primary border-2' : ''
                              }`}
                              onClick={() => {
                                setSelectedTechnician({ ...tech, specializationNameAr: specIcon.name_ar });
                                setSelectedBranch(null);
                              }}
                            >
                              <CardContent className="p-3">
                                <div className="flex items-start gap-3">
                                  <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: specIcon.color + '20' }}
                                  >
                                    <img
                                      src={specIcon.icon}
                                      alt={specIcon.name_ar}
                                      className="w-6 h-6"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-sm truncate">
                                      {tech.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground truncate">
                                      {specIcon.name_ar}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                      <div className="flex items-center gap-1">
                                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                        <span className="text-xs font-medium">
                                          {tech.rating.toFixed(1)}
                                        </span>
                                      </div>
                                      {distance !== null && (
                                        <span className="text-xs text-muted-foreground">
                                          • {distance.toFixed(1)} كم
                                        </span>
                                      )}
                                    </div>
                                    {tech.hourly_rate && (
                                      <p className="text-xs text-primary font-medium mt-1">
                                        {tech.hourly_rate} ج.م/ساعة
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            {/* Map Container */}
            <div className="flex-1 rounded-lg overflow-hidden shadow-lg border relative" style={{ minHeight: '600px' }}>
              {!showSidebar && (
                <Button
                  className="absolute top-4 left-4 z-10"
                  size="sm"
                  onClick={() => setShowSidebar(true)}
                >
                  <Users className="h-4 w-4 ml-2" />
                  عرض القائمة
                </Button>
              )}
              
              <GoogleMap 
                height="600px"
                latitude={mapCenter.lat}
                longitude={mapCenter.lng}
                zoom={userLocation ? 13 : (allMarkers.length > 1 ? 12 : 14)}
                interactive={false}
                markers={allMarkers as any}
                onMarkerClick={handleMarkerClick}
              />
              
              {/* Enhanced Technician Info Card */}
              {selectedTechnician && (
                <Card className="absolute top-4 right-4 z-10 max-w-sm shadow-xl border-primary">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{selectedTechnician.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {selectedTechnician.specializationNameAr}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedTechnician(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="font-medium">{selectedTechnician.rating.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">
                            ({selectedTechnician.total_reviews})
                          </span>
                        </div>
                        {getDistance(selectedTechnician) !== null && (
                          <span className="text-sm text-muted-foreground">
                            {getDistance(selectedTechnician)!.toFixed(1)} كم
                          </span>
                        )}
                      </div>

                      {selectedTechnician.hourly_rate && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">السعر:</span>
                          <span className="font-semibold text-primary">
                            {selectedTechnician.hourly_rate} ج.م/ساعة
                          </span>
                        </div>
                      )}

                      {selectedTechnician.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a href={`tel:${selectedTechnician.phone}`} className="text-primary hover:underline">
                            {selectedTechnician.phone}
                          </a>
                        </div>
                      )}
                      
                      <Button 
                        onClick={() => handleRequestService(selectedTechnician.id)}
                        className="w-full"
                      >
                        اطلب الخدمة الآن
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Branch Info Card */}
              {selectedBranch && (
                <Card className="absolute top-4 right-4 z-10 max-w-sm shadow-xl border-blue-500">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{selectedBranch.name}</h3>
                          <p className="text-sm text-muted-foreground">{selectedBranch.location}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBranch(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {selectedBranch.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <a href={`tel:${selectedBranch.phone}`} className="text-primary hover:underline">
                            {selectedBranch.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* User Location Indicator */}
              {userLocation && (
                <div className="absolute bottom-4 left-4 bg-background/95 backdrop-blur p-3 rounded-lg shadow-lg border border-primary">
                  <div className="flex items-center gap-2 text-sm">
                    <Navigation2 className="h-4 w-4 text-primary" />
                    <span className="font-medium">موقعك الحالي</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Info Section */}
      <div className="bg-muted border-t border-border py-12 mt-8">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-6 text-primary">
              Alazab Construction
            </h2>
            
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="text-muted-foreground">
                <p className="font-medium mb-1">B/500 Maadi New, Cairo, Egypt</p>
                <p className="text-sm">38 Elmahta Street, Nabaroh, Daqahlia</p>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-primary">
                <Phone className="h-5 w-5" />
                <a href="tel:+201004006620" className="hover:underline transition-all">
                  (+20) 1004006620
                </a>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-primary">
                <Globe className="h-5 w-5" />
                <a 
                  href="https://alazab.services" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline transition-all"
                >
                  alazab.services
                </a>
              </div>
            </div>
          </div>
          
          <div className="text-center pt-8 border-t border-border">
            <p className="text-muted-foreground text-sm">
              © 2025 Alazab Construction Company | All Rights Reserved
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}