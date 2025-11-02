import { useState, useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Search, 
  Navigation, 
  RefreshCw, 
  Map as MapIcon, 
  List,
  Wrench,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { useVendorLocations, VendorLocation } from '@/hooks/useVendorLocations';
import { useServices } from '@/hooks/useServices';
import { VendorMarkerInfo } from '@/components/maps/VendorMarkerInfo';
import { ServiceRequestDialog } from '@/components/maps/ServiceRequestDialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

export default function ServiceMap() {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [apiKey, setApiKey] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<string | undefined>();
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedVendor, setSelectedVendor] = useState<VendorLocation | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestVendor, setRequestVendor] = useState<{ id: string; name: string } | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [markers, setMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [infoWindow, setInfoWindow] = useState<HTMLDivElement | null>(null);
  
  const { locations, loading, refetch } = useVendorLocations(selectedService);
  const { categories, services } = useServices();
  const { toast } = useToast();

  useEffect(() => {
    fetchApiKey();
  }, []);

  useEffect(() => {
    if (apiKey && mapRef.current && !map) {
      initializeMap();
    }
  }, [apiKey]);

  useEffect(() => {
    if (map && locations.length > 0) {
      updateMarkers();
    }
  }, [map, locations]);

  const fetchApiKey = async () => {
    try {
      const response = await supabase.functions.invoke('get-maps-key');
      if (response.data?.apiKey) {
        setApiKey(response.data.apiKey);
      }
    } catch (error) {
      console.error('Error fetching API key:', error);
      toast({
        title: 'خطأ',
        description: 'فشل تحميل مفتاح الخريطة',
        variant: 'destructive'
      });
    }
  };

  const initializeMap = async () => {
    try {
      const loader = new Loader({
        apiKey: apiKey,
        version: 'weekly',
        libraries: ['places', 'marker'],
        language: 'ar',
        region: 'EG'
      });

      await loader.load();
      
      const mapInstance = new google.maps.Map(mapRef.current!, {
        center: { lat: 30.0444, lng: 31.2357 }, // القاهرة
        zoom: 12,
        mapId: 'DEMO_MAP_ID',
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: false,
      });

      setMap(mapInstance);
      
      // Get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            mapInstance.setCenter(pos);
            setUserLocation(pos);
          },
          () => {
            console.log('Error getting location');
          }
        );
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  const updateMarkers = () => {
    if (!map) return;

    // Clear existing markers
    markers.forEach(marker => marker.map = null);
    setMarkers([]);

    const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];
    const bounds = new google.maps.LatLngBounds();

    locations.forEach((location) => {
      const position = { lat: location.latitude, lng: location.longitude };
      
      // Create custom marker content
      const markerContent = document.createElement('div');
      markerContent.className = 'custom-marker';
      markerContent.innerHTML = `
        <div style="
          background: linear-gradient(135deg, #f5bf23 0%, #d4af37 100%);
          border: 3px solid white;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          cursor: pointer;
          transition: transform 0.2s;
        ">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
          </svg>
        </div>
      `;

      markerContent.addEventListener('mouseenter', () => {
        markerContent.style.transform = 'scale(1.1)';
      });

      markerContent.addEventListener('mouseleave', () => {
        markerContent.style.transform = 'scale(1)';
      });

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position,
        content: markerContent,
        title: location.vendor?.name || 'مزود خدمة'
      });

      marker.addListener('click', () => {
        setSelectedVendor(location);
        map.panTo(position);
        map.setZoom(15);
      });

      newMarkers.push(marker);
      bounds.extend(position);
    });

    setMarkers(newMarkers);
    
    if (locations.length > 0) {
      map.fitBounds(bounds);
    }
  };

  const handleSearch = async () => {
    if (!map || !searchQuery.trim()) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        map.setCenter(location);
        map.setZoom(14);
        setUserLocation({
          lat: location.lat(),
          lng: location.lng(),
          address: results[0].formatted_address
        });
      }
    });
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation || !map) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        map.setCenter(pos);
        map.setZoom(15);
        setUserLocation(pos);
      },
      () => {
        toast({
          title: 'خطأ',
          description: 'فشل تحديد موقعك الحالي',
          variant: 'destructive'
        });
      }
    );
  };

  const handleRequestService = (vendorId: string) => {
    const vendor = locations.find(l => l.vendor?.id === vendorId)?.vendor;
    if (vendor) {
      setRequestVendor({ id: vendor.id, name: vendor.name });
      setRequestDialogOpen(true);
    }
  };

  const handleZoomIn = () => {
    if (map) {
      map.setZoom((map.getZoom() || 12) + 1);
    }
  };

  const handleZoomOut = () => {
    if (map) {
      map.setZoom((map.getZoom() || 12) - 1);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card border-b px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* View Mode Toggle */}
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'map' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('map')}
            >
              <MapIcon className="h-4 w-4 mr-2" />
              خريطة
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4 mr-2" />
              قائمة
            </Button>
          </div>

          {/* Service Filter */}
          <Button variant="outline" size="sm">
            <Wrench className="h-4 w-4 mr-2" />
            الخدمات
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-card px-4 py-3 border-b">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="بحث عن خدمة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="pr-10"
            />
          </div>
          <Button variant="default" size="icon" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Provider Count Badge */}
      {locations.length > 0 && (
        <div className="absolute top-32 left-4 z-10">
          <Badge className="bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold shadow-lg">
            مزودي الخدمة: {locations.length}
          </Badge>
        </div>
      )}

      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full" />

        {/* Map Controls */}
        <div className="absolute bottom-20 left-4 flex flex-col gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full shadow-lg bg-card hover:bg-accent"
            onClick={handleGetCurrentLocation}
          >
            <Navigation className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full shadow-lg bg-card hover:bg-accent"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-20 right-4 flex flex-col gap-2">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full shadow-lg bg-card hover:bg-accent"
            onClick={handleZoomIn}
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full shadow-lg bg-card hover:bg-accent"
            onClick={handleZoomOut}
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
        </div>

        {/* Selected Vendor Info */}
        {selectedVendor && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 max-w-md">
            <VendorMarkerInfo
              vendor={selectedVendor}
              onRequestService={handleRequestService}
              onClose={() => setSelectedVendor(null)}
            />
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-30">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">جاري تحميل مزودي الخدمات...</p>
            </div>
          </div>
        )}
      </div>

      {/* Service Request Dialog */}
      {requestVendor && (
        <ServiceRequestDialog
          open={requestDialogOpen}
          onOpenChange={setRequestDialogOpen}
          vendorId={requestVendor.id}
          vendorName={requestVendor.name}
          userLocation={userLocation || undefined}
        />
      )}
    </div>
  );
}
