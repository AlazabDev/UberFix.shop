// src/components/landing/InteractiveMap.tsx
import { useEffect, useRef, useState } from "react";
import { MapPin, Phone, X, Star, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { VendorsList, vendors, type Vendor } from "./VendorsList";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [apiKey, setApiKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        // Try to get API key from environment variable first
        const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        if (envKey) {
          setApiKey(envKey);
          return;
        }
        
        // Fallback to Supabase function
        const { data, error } = await supabase.functions.invoke('get-maps-key');
        if (error) throw error;
        if (data?.apiKey) {
          setApiKey(data.apiKey);
        }
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
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,marker&v=weekly`;
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
          zoom: 7,
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
          branchDiv.className = 'relative branch-marker';
          branchDiv.innerHTML = `
            <div class="relative cursor-pointer group hover:scale-110 transition-transform">
              <img src="/icons/pin-pro/pin-pro-33.svg" class="w-12 h-14 drop-shadow-lg" alt="${branch.name}" />
              <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-[-8px]">
                <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 1.74.5 3.37 1.41 4.84.95 1.54 2.2 2.86 3.16 4.4.47.75.81 1.45 1.17 2.26H10c-.55 0-1 .45-1 1s.45 1 1 1h4c.55 0 1-.45 1-1s-.45-1-1-1h-.74c.36-.81.7-1.51 1.17-2.26.96-1.54 2.21-2.86 3.16-4.4C18.5 12.37 19 10.74 19 9c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
              </div>
            </div>
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

        // Add vendor markers (yellow/orange pins)
        vendors.forEach((vendor) => {
          const vendorDiv = document.createElement('div');
          vendorDiv.className = 'relative vendor-marker';
          
          const pinIcon = '/icons/pin-pro/pin-pro-35.svg'; // Default yellow
          let innerIcon = '';
          
          switch (vendor.specialty.toLowerCase()) {
            case 'سباك':
              innerIcon = '<path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2l1.5-1.5h5L16 21v-.5l-1.5-1.5c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4z"/>';
              break;
            case 'كهربائي':
              innerIcon = '<path d="M7 2v11h3v9l7-12h-4l4-8z"/>';
              break;
            case 'نجار':
              innerIcon = '<path d="M13.4 2.1L8 10.5 12.6 13 8 21.9 15.6 13.5 11 11z"/>';
              break;
            case 'دهان':
              innerIcon = '<path d="M18 4V3c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V6h1v4H9v11c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-9h8V4h-3z"/>';
              break;
            case 'فني تكييف':
              innerIcon = '<path d="M19 3H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7 8c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm10 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zM19 13H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2zM7 18c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm10 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>';
              break;
            default:
              innerIcon = '<path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>';
          }
          
          vendorDiv.innerHTML = `
            <div class="relative cursor-pointer group hover:scale-110 transition-transform">
              ${vendor.available ? `
                <div class="absolute inset-0 w-12 h-14 animate-pulse-ring opacity-60 rounded-full" style="background: radial-gradient(circle, rgba(250,171,17,0.4) 0%, transparent 70%);"></div>
              ` : ''}
              <img src="${pinIcon}" class="w-12 h-14 drop-shadow-lg ${vendor.available ? '' : 'opacity-60'}" alt="${vendor.name}" />
              <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-[-8px]">
                <svg class="w-5 h-5 text-white drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
                  ${innerIcon}
                </svg>
              </div>
            </div>
          `;

          const vendorMarker = new window.google.maps.marker.AdvancedMarkerElement({
            map: mapInstance,
            position: { lat: vendor.lat, lng: vendor.lng },
            content: vendorDiv,
            title: vendor.name
          });

          markersRef.current.push(vendorMarker);

          vendorDiv.addEventListener('click', () => {
            setSelectedVendor(vendor);
            mapInstance.panTo({ lat: vendor.lat, lng: vendor.lng });
            mapInstance.setZoom(13);
          });
        });
      } catch (error) {
        console.error('Error initializing map:', error);
        setIsLoading(false);
      }
    };

    loadGoogleMaps();
  }, [apiKey]);

  if (isLoading) {
    return (
      <div className="w-full h-full rounded-2xl bg-muted/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">جاري تحميل الخريطة...</p>
        </div>
      </div>
    );
  }

  const handleVendorSelect = (vendor: Vendor) => {
    if (map) {
      map.panTo({ lat: vendor.lat, lng: vendor.lng });
      map.setZoom(14);
      setSelectedVendor(vendor);
    }
  };

  return (
    <div className="relative w-full h-full">
      {/* Vendors List Drawer */}
      <VendorsList onVendorSelect={handleVendorSelect} />

      {/* Map Container */}
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-2xl shadow-2xl overflow-hidden border-4 border-white/50 animate-glow"
      />

      {/* Vendor Modal Dialog */}
      <Dialog open={!!selectedVendor} onOpenChange={(open) => !open && setSelectedVendor(null)}>
        <DialogContent className="sm:max-w-md">
          <div className="relative">
            <button 
              onClick={() => setSelectedVendor(null)}
              className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-muted hover:bg-muted/80 
                       flex items-center justify-center transition-colors z-10"
            >
              <X className="h-4 w-4" />
            </button>

            {selectedVendor && (
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${
                    selectedVendor.specialty === 'سباك' ? 'from-blue-400 to-blue-600' :
                    selectedVendor.specialty === 'كهربائي' ? 'from-yellow-400 to-yellow-600' :
                    selectedVendor.specialty === 'نجار' ? 'from-amber-400 to-amber-600' :
                    selectedVendor.specialty === 'دهان' ? 'from-purple-400 to-purple-600' :
                    selectedVendor.specialty === 'فني تكييف' ? 'from-cyan-400 to-cyan-600' :
                    'from-gray-400 to-gray-600'
                  } flex items-center justify-center shadow-lg border-4 border-white text-white font-bold text-xl`}>
                    {selectedVendor.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-2xl mb-1">{selectedVendor.name}</h3>
                    <p className="text-muted-foreground mb-2">{selectedVendor.specialty}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold">{selectedVendor.rating}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">({selectedVendor.reviews} تقييم)</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 py-3 border-y">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">ج.م {selectedVendor.hourlyRate}</div>
                    <div className="text-xs text-muted-foreground">السعر/ساعة</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{selectedVendor.distance} كم</div>
                    <div className="text-xs text-muted-foreground">المسافة</div>
                  </div>
                </div>

                <div className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg ${
                  selectedVendor.available 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-gray-50 text-gray-500 border border-gray-200'
                }`}>
                  {selectedVendor.available ? (
                    <>
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="font-medium">متاح الآن</span>
                    </>
                  ) : (
                    <span className="font-medium">مشغول حالياً</span>
                  )}
                </div>

                <div className="flex gap-3 pt-2">
                  <a 
                    href={`tel:${selectedVendor.phone}`}
                    className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-primary 
                             text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors 
                             font-medium shadow-sm"
                  >
                    <Phone className="h-5 w-5" />
                    اتصال فوري
                  </a>
                  <button 
                    onClick={() => window.location.href = '/requests?vendor=' + selectedVendor.id}
                    className="flex-1 px-5 py-3 bg-secondary text-secondary-foreground rounded-lg 
                             hover:bg-secondary/80 transition-colors font-medium"
                  >
                    طلب خدمة
                  </button>
                </div>
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
