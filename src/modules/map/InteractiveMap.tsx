import { useEffect, useRef, useState, useCallback } from 'react';
import { useLoadGoogle } from './hooks/useLoadGoogle';
import { useMapPins } from './hooks/useMapPins';
import { useBranchLocations } from '@/hooks/useBranchLocations';
import { useTechnicians } from '@/hooks/useTechnicians';
import { BranchPin } from './BranchPin';
import { TechnicianPin } from './TechnicianPin';
import { PopupBranch } from './PopupBranch';
import { PopupTechnician } from './PopupTechnician';
import { ServiceList } from './ServiceList';
import { MapPin, BranchLocation as BranchType, TechnicianLocation } from './types';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import ReactDOM from 'react-dom/client';
import { useNavigate } from 'react-router-dom';

export const InteractiveMap = () => {
  const navigate = useNavigate();
  const { isLoaded, loadError } = useLoadGoogle();
  const { branches, loading: branchesLoading } = useBranchLocations();
  const { technicians, loading: techniciansLoading } = useTechnicians();
  const { selectedPin, popup, handlePinClick, closePopup } = useMapPins();

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [specializationFilter, setSpecializationFilter] = useState<string | undefined>();

  // تحويل branches من Supabase إلى النوع المطلوب
  const branchPins: BranchType[] = branches.map(b => ({
    id: b.id,
    branch: b.branch,
    address: b.address,
    latitude: parseFloat(b.latitude || '0'),
    longitude: parseFloat(b.longitude || '0'),
    status: 'Active' as const,
    branch_type: b.branch_type,
    link: b.link,
    icon: b.icon,
  }));

  // تحويل technicians من Supabase إلى النوع المطلوب مع الأيقونات
  const technicianPins: TechnicianLocation[] = technicians
    .filter(t => t.current_latitude && t.current_longitude)
    .map(t => ({
      id: t.id,
      name: t.name,
      specialization: t.specialization as any,
      rating: t.rating || 0,
      total_reviews: t.total_reviews || 0,
      status: (t.status === 'online' ? 'available' : t.status === 'busy' ? 'busy' : 'soon') as any,
      latitude: t.current_latitude!,
      longitude: t.current_longitude!,
      hourly_rate: t.hourly_rate || undefined,
      available_from: t.available_from || undefined,
      available_to: t.available_to || undefined,
      phone: t.phone || undefined,
      profile_image: t.profile_image || undefined,
      icon_url: (t as any).icon_url || undefined, // إضافة الأيقونة من قاعدة البيانات
    }));

  // تهيئة الخريطة مع تحسينات للإنتاج
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return;

    const map = new google.maps.Map(mapRef.current, {
      center: { lat: 30.0444, lng: 31.2357 }, // القاهرة
      zoom: 12,
      mapId: '8e0a97af9386fef',
      disableDefaultUI: true, // إخفاء UI الافتراضي
      zoomControl: true,
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER,
      },
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      fullscreenControlOptions: {
        position: google.maps.ControlPosition.RIGHT_TOP,
      },
      gestureHandling: 'greedy', // تحسين التفاعل على الموبايل
      minZoom: 10,
      maxZoom: 18,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }] // إخفاء POI للتركيز على الفنيين
        }
      ]
    });

    mapInstanceRef.current = map;

    // تحسين الأداء: تنظيف عند الإزالة
    return () => {
      markersRef.current.forEach(marker => {
        marker.map = null;
      });
      markersRef.current = [];
      mapInstanceRef.current = null;
    };
  }, [isLoaded]);

  // إضافة الـ Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;

    // مسح الـ Markers القديمة
    markersRef.current.forEach(marker => {
      marker.map = null;
    });
    markersRef.current = [];

    const { AdvancedMarkerElement } = google.maps.marker;

  // إضافة Branch Pins مع تحسينات
    branchPins.forEach(branch => {
      const container = document.createElement('div');
      const root = ReactDOM.createRoot(container);
      
      const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const rect = container.getBoundingClientRect();
        handlePinClick(
          {
            id: branch.id,
            type: 'branch',
            position: { lat: branch.latitude, lng: branch.longitude },
            data: branch,
          },
          { x: rect.left + rect.width / 2, y: rect.top }
        );
      };

      root.render(
        <BranchPin
          isSelected={selectedPin === branch.id}
          onClick={handleClick}
        />
      );

      const marker = new AdvancedMarkerElement({
        map: mapInstanceRef.current,
        position: { lat: branch.latitude, lng: branch.longitude },
        content: container,
        title: branch.branch, // Accessibility
      });

      markersRef.current.push(marker);
    });

    // إضافة Technician Pins (مع الفلتر) مع تحسينات
    const filteredTechs = specializationFilter
      ? technicianPins.filter(t => t.specialization === specializationFilter)
      : technicianPins;

    filteredTechs.forEach(tech => {
      const container = document.createElement('div');
      const root = ReactDOM.createRoot(container);
      
      const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        const rect = container.getBoundingClientRect();
        handlePinClick(
          {
            id: tech.id,
            type: 'technician',
            position: { lat: tech.latitude, lng: tech.longitude },
            data: tech,
          },
          { x: rect.left + rect.width / 2, y: rect.top }
        );
      };

      root.render(
        <TechnicianPin
          technician={tech}
          isSelected={selectedPin === tech.id}
          onClick={handleClick}
        />
      );

      const marker = new AdvancedMarkerElement({
        map: mapInstanceRef.current,
        position: { lat: tech.latitude, lng: tech.longitude },
        content: container,
        title: `${tech.name} - ${tech.specialization}`, // Accessibility
      });

      markersRef.current.push(marker);
    });
  }, [isLoaded, branchPins, technicianPins, selectedPin, specializationFilter, handlePinClick]);

  const handleTechnicianSelect = useCallback((id: string) => {
    const tech = technicianPins.find(t => t.id === id);
    if (!tech || !mapInstanceRef.current) return;

    mapInstanceRef.current.panTo({ lat: tech.latitude, lng: tech.longitude });
    mapInstanceRef.current.setZoom(15);

    const mapDiv = mapRef.current;
    if (!mapDiv) return;

    const rect = mapDiv.getBoundingClientRect();
    handlePinClick(
      {
        id: tech.id,
        type: 'technician',
        position: { lat: tech.latitude, lng: tech.longitude },
        data: tech,
      },
      { x: rect.width / 2, y: rect.height / 2 }
    );
  }, [technicianPins, handlePinClick]);

  const handleRequestService = useCallback((technicianId: string) => {
    // حفظ بيانات الفني في sessionStorage للاستخدام في صفحة الطلب
    const tech = technicianPins.find(t => t.id === technicianId);
    if (tech) {
      sessionStorage.setItem('selectedTechnician', JSON.stringify(tech));
      navigate('/quick-request');
    }
  }, [technicianPins, navigate]);

  const handleContact = useCallback((technicianId: string) => {
    const tech = technicianPins.find(t => t.id === technicianId);
    if (tech?.phone) {
      window.location.href = `tel:${tech.phone}`;
    }
  }, [technicianPins]);

  if (loadError) {
    return (
      <div className="h-screen flex items-center justify-center bg-muted">
        <p className="text-destructive">خطأ في تحميل الخريطة: {loadError.message}</p>
      </div>
    );
  }

  if (!isLoaded || branchesLoading || techniciansLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground animate-pulse">جاري تحميل الخريطة...</p>
        <p className="text-sm text-muted-foreground mt-2">
          {!isLoaded && "تحميل Google Maps..."}
          {isLoaded && branchesLoading && "تحميل الفروع..."}
          {isLoaded && !branchesLoading && techniciansLoading && "تحميل الفنيين..."}
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full">
      <div ref={mapRef} className="h-full w-full" />

      {/* Tabs Filter مع مؤشر العدد */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[500]">
        <Tabs value={specializationFilter || 'all'} onValueChange={(v) => setSpecializationFilter(v === 'all' ? undefined : v)}>
          <TabsList className="bg-background/95 backdrop-blur-sm border border-border shadow-xl">
            <TabsTrigger value="all" className="gap-2">
              الكل
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">
                {technicianPins.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="plumber" className="gap-2">
              سباك
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">
                {technicianPins.filter(t => t.specialization === 'plumber').length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="carpenter" className="gap-2">
              نجار
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">
                {technicianPins.filter(t => t.specialization === 'carpenter').length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="electrician" className="gap-2">
              كهربائي
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">
                {technicianPins.filter(t => t.specialization === 'electrician').length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="painter" className="gap-2">
              دهان
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">
                {technicianPins.filter(t => t.specialization === 'painter').length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="ac_technician" className="gap-2">
              تكييف
              <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">
                {technicianPins.filter(t => t.specialization === 'ac_technician').length}
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Service List */}
      <ServiceList
        technicians={technicianPins}
        selectedId={selectedPin}
        onSelect={handleTechnicianSelect}
        specializationFilter={specializationFilter}
      />

      {/* Popups */}
      {popup && popup.type === 'branch' && (
        <PopupBranch
          branch={popup.data as BranchType}
          position={popup.position}
          onClose={closePopup}
        />
      )}

      {popup && popup.type === 'technician' && (
        <PopupTechnician
          technician={popup.data as TechnicianLocation}
          position={popup.position}
          onClose={closePopup}
          onRequestService={handleRequestService}
          onContact={handleContact}
        />
      )}
    </div>
  );
};
