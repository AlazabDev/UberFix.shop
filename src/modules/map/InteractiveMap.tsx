import { useEffect, useRef, useState } from "react";
import { MapPin, Phone, X, Star, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ServiceList } from './ServiceList';
import { useTechnicians } from '@/hooks/useTechnicians';
import { TechnicianLocation } from './types';

interface Branch {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  reviews: number;
  phone: string;
}

const branches: Branch[] = [
  { id: 'b1', name: 'فرع القاهرة الرئيسي', address: 'مدينة نصر، القاهرة', lat: 30.0644, lng: 31.3457, rating: 4.8, reviews: 256, phone: '+201234567800' },
  { id: 'b2', name: 'فرع الإسكندرية', address: 'محطة الرمل، الإسكندرية', lat: 31.2101, lng: 29.9287, rating: 4.7, reviews: 189, phone: '+201234567801' },
  { id: 'b3', name: 'فرع الجيزة', address: 'المهندسين، الجيزة', lat: 30.0531, lng: 31.2089, rating: 4.9, reviews: 312, phone: '+201234567802' },
  { id: 'b4', name: 'فرع المنصورة', address: 'شارع الجمهورية، المنصورة', lat: 31.0509, lng: 31.3885, rating: 4.6, reviews: 142, phone: '+201234567803' },
];

declare global {
  interface Window {
    google: typeof google;
    initMap: () => void;
  }
}

export const InteractiveMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<TechnicianLocation | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const { technicians } = useTechnicians();

  // تحويل technicians من Supabase إلى النوع المطلوب
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
    }));

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const response = await fetch('https://zrrffsjbfkphridqyais.supabase.co/functions/v1/get-google-maps-key');
        const data = await response.json();
        
        if (!data.apiKey) {
          console.error('Google Maps API key not configured');
          setIsLoading(false);
          return;
        }
        
        setApiKey(data.apiKey);
      } catch (error) {
        console.error('Error fetching Maps API key:', error);
        setIsLoading(false);
      }
    };

    fetchApiKey();
  }, []);

  useEffect(() => {
    if (!apiKey || !mapRef.current) return;

    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&language=ar&region=EG&v=weekly`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      script.onerror = () => {
        console.error('Error loading Google Maps');
        setIsLoading(false);
      };
      document.head.appendChild(script);
    };

    const initializeMap = async () => {
      if (!mapRef.current || !window.google) return;

      try {
        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: { lat: 30.0444, lng: 31.2357 },
          zoom: 12,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          mapId: '8e0a97af9386fef',
        });

        setMap(mapInstance);
        setIsLoading(false);

        // Add branch markers (blue pins)
        branches.forEach((branch) => {
          const branchDiv = document.createElement('div');
          branchDiv.innerHTML = `
            <img src="/icons/pin-pro/pin-pro-24.svg" class="w-12 h-14 drop-shadow-lg cursor-pointer hover:scale-110 transition-transform" alt="${branch.name}" />
          `;

          const branchMarker = new window.google.maps.marker.AdvancedMarkerElement({
            map: mapInstance,
            position: { lat: branch.lat, lng: branch.lng },
            content: branchDiv,
            title: branch.name
          });

          markersRef.current.push(branchMarker);

          branchDiv.addEventListener('click', () => {
            setSelectedBranch(branch);
            mapInstance.panTo({ lat: branch.lat, lng: branch.lng });
            mapInstance.setZoom(14);
          });
        });

        // Add technician markers
        technicianPins.forEach((tech) => {
          const techDiv = document.createElement('div');
          
          const getIconBySpecialization = (spec: string) => {
            const iconMap: Record<string, string> = {
              'plumber': '/icons/pin-pro/pin-pro-2.svg',
              'electrician': '/icons/pin-pro/pin-pro-3.svg',
              'carpenter': '/icons/pin-pro/pin-pro-4.svg',
              'painter': '/icons/pin-pro/pin-pro-5.svg',
              'ac_technician': '/icons/pin-pro/pin-pro-6.svg',
              'general': '/icons/pin-pro/pin-pro-7.svg',
            };
            return iconMap[spec] || iconMap['general'];
          };
          
          techDiv.innerHTML = `
            <img src="${getIconBySpecialization(tech.specialization)}" 
                 class="w-12 h-14 drop-shadow-lg cursor-pointer hover:scale-110 transition-transform" 
                 alt="${tech.name}" />
          `;

          const techMarker = new window.google.maps.marker.AdvancedMarkerElement({
            map: mapInstance,
            position: { lat: tech.latitude, lng: tech.longitude },
            content: techDiv,
            title: tech.name
          });

          markersRef.current.push(techMarker);

          techDiv.addEventListener('click', () => {
            setSelectedTechnician(tech);
            mapInstance.panTo({ lat: tech.latitude, lng: tech.longitude });
            mapInstance.setZoom(15);
          });
        });
      } catch (error) {
        console.error('Error initializing map:', error);
        setIsLoading(false);
      }
    };

    loadGoogleMaps();
  }, [apiKey, technicianPins]);

  const handleTechnicianSelect = (id: string) => {
    const tech = technicianPins.find(t => t.id === id);
    if (tech && map) {
      map.panTo({ lat: tech.latitude, lng: tech.longitude });
      map.setZoom(15);
      setSelectedTechnician(tech);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">جاري تحميل الخريطة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-full"
      />

      {/* Service List */}
      <ServiceList
        technicians={technicianPins}
        selectedId={selectedTechnician?.id || null}
        onSelect={handleTechnicianSelect}
      />

      {/* Technician Modal Dialog */}
      <Dialog open={!!selectedTechnician} onOpenChange={(open) => !open && setSelectedTechnician(null)}>
        <DialogContent className="sm:max-w-md">
          <div className="relative">
            <button 
              onClick={() => setSelectedTechnician(null)}
              className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-muted hover:bg-muted/80 
                       flex items-center justify-center transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>

            {selectedTechnician && (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/60 
                                flex items-center justify-center shadow-lg border-4 border-white text-white font-bold text-xl">
                    {selectedTechnician.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-2xl mb-1">{selectedTechnician.name}</h3>
                    <p className="text-muted-foreground mb-2">{selectedTechnician.specialization}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold">{selectedTechnician.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">({selectedTechnician.total_reviews} تقييم)</span>
                    </div>
                  </div>
                </div>

                {selectedTechnician.hourly_rate && (
                  <div className="grid grid-cols-1 gap-3 py-3 border-y">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">ج.م {selectedTechnician.hourly_rate}</div>
                      <div className="text-xs text-muted-foreground">السعر/ساعة</div>
                    </div>
                  </div>
                )}

                <div className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg ${
                  selectedTechnician.status === 'available'
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-gray-50 text-gray-500 border border-gray-200'
                }`}>
                  {selectedTechnician.status === 'available' ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="font-medium">متاح الآن</span>
                    </>
                  ) : (
                    <span className="font-medium">مشغول حالياً</span>
                  )}
                </div>

                {selectedTechnician.phone && (
                  <div className="flex gap-3 pt-2">
                    <a 
                      href={`tel:${selectedTechnician.phone}`}
                      className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-primary 
                               text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors 
                               font-medium shadow-sm"
                    >
                      <Phone className="h-5 w-5" />
                      اتصال فوري
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Branch Modal Dialog */}
      <Dialog open={!!selectedBranch} onOpenChange={(open) => !open && setSelectedBranch(null)}>
        <DialogContent className="sm:max-w-md">
          <div className="relative">
            <button 
              onClick={() => setSelectedBranch(null)}
              className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-muted hover:bg-muted/80 
                       flex items-center justify-center transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>

            {selectedBranch && (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 
                                flex items-center justify-center shadow-lg border-4 border-white">
                    <Store className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-2xl mb-1">{selectedBranch.name}</h3>
                    <p className="text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {selectedBranch.address}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold">{selectedBranch.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">({selectedBranch.reviews} تقييم)</span>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">رقم الفرع:</span>
                    <span className="font-bold text-lg direction-ltr">{selectedBranch.phone}</span>
                  </div>
                  <div className="text-xs text-muted-foreground text-center">
                    نستقبل طلباتكم من السبت إلى الخميس (9 ص - 6 م)
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <a 
                    href={`tel:${selectedBranch.phone}`}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-primary 
                             text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors 
                             font-medium shadow-sm"
                  >
                    <Phone className="h-5 w-5" />
                    اتصال بالفرع
                  </a>
                  <button 
                    onClick={() => window.location.href = '/requests?branch=' + selectedBranch.id}
                    className="flex-1 px-5 py-3 bg-secondary text-secondary-foreground rounded-lg 
                             hover:bg-secondary/80 transition-colors font-medium"
                  >
                    حجز موعد
                  </button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};