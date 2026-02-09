import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { getMapboxToken } from '@/lib/mapboxLoader';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Globe, Map, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BranchLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  branch_type?: string;
  status?: string;
  address?: string;
  city?: string;
}

interface BranchesMapboxProps {
  height?: string;
  showStats?: boolean;
  className?: string;
  initialMode?: 'globe' | '2d';
}

// HTML escape function for XSS prevention
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Custom marker SVG with UberFix logo style
const createMarkerElement = (isActive: boolean = true): HTMLDivElement => {
  const el = document.createElement('div');
  el.className = 'custom-branch-marker';
  el.innerHTML = `
    <div class="marker-container" style="
      position: relative;
      width: 36px;
      height: 44px;
      cursor: pointer;
      transition: transform 0.2s ease;
    ">
      <svg viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 100%; height: 100%;">
        <path d="M18 0C8.06 0 0 8.06 0 18c0 12.75 16.5 25.2 17.22 25.76a1.5 1.5 0 0 0 1.56 0C19.5 43.2 36 30.75 36 18c0-9.94-8.06-18-18-18z" fill="#f5bf23"/>
        <circle cx="18" cy="18" r="14" fill="white"/>
        <path d="M18 8c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm0 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm3.5 12h-7v-1.5c0-1.38 2.81-2.5 3.5-2.5s3.5 1.12 3.5 2.5V23z" fill="#1a4b8c"/>
      </svg>
      ${isActive ? `
        <div style="
          position: absolute;
          top: -4px;
          right: -4px;
          width: 12px;
          height: 12px;
          background: #22c55e;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>
      ` : ''}
    </div>
  `;
  
  el.addEventListener('mouseenter', () => {
    const container = el.querySelector('.marker-container') as HTMLElement;
    if (container) container.style.transform = 'scale(1.15)';
  });
  el.addEventListener('mouseleave', () => {
    const container = el.querySelector('.marker-container') as HTMLElement;
    if (container) container.style.transform = 'scale(1)';
  });
  
  return el;
};

export const BranchesMapbox: React.FC<BranchesMapboxProps> = ({ 
  height = '500px', 
  showStats = true,
  className = '',
  initialMode = 'globe'
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [branches, setBranches] = useState<BranchLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'globe' | '2d'>(initialMode);
  const [isSpinning, setIsSpinning] = useState(true);
  const userInteractingRef = useRef(false);
  const spinAnimationRef = useRef<number | null>(null);

  // Load branches from Supabase
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const { data, error: dbError } = await supabase
          .from('branch_locations')
          .select('id, branch, branch_name, latitude, longitude, branch_type, status, address, city')
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);

        if (dbError) throw dbError;

        const validBranches = (data || [])
          .filter(b => b.latitude && b.longitude)
          .map(b => ({
            id: b.id,
            name: b.branch_name || b.branch,
            latitude: parseFloat(b.latitude),
            longitude: parseFloat(b.longitude),
            branch_type: b.branch_type,
            status: b.status,
            address: b.address,
            city: b.city
          }));

        setBranches(validBranches);
      } catch (err) {
        console.error('Error loading branches:', err);
        // Fallback data
        try {
          const response = await fetch('/data/branch_locations.json');
          const jsonData = await response.json();
          setBranches(jsonData.map((b: any, i: number) => ({
            id: `branch-${i}`,
            name: b.name,
            latitude: b.latitude,
            longitude: b.longitude,
            status: 'Active'
          })));
        } catch {
          setError('تعذر تحميل بيانات الفروع');
        }
      }
    };

    loadBranches();
  }, []);

  // Clear all markers
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  }, []);

  // Add markers to map
  const addMarkers = useCallback(() => {
    if (!map.current) return;
    
    clearMarkers();
    
    branches.forEach(branch => {
      if (!branch.latitude || !branch.longitude) return;
      
      const el = createMarkerElement(branch.status === 'Active');
      
      const popup = new mapboxgl.Popup({
        offset: [0, -40],
        closeButton: false,
        className: 'branch-popup',
        maxWidth: '280px'
      }).setHTML(`
        <div style="
          padding: 16px 20px;
          background: linear-gradient(135deg, #0b1e36 0%, #1a4b8c 100%);
          border-radius: 16px;
          color: white;
          text-align: right;
          direction: rtl;
          min-width: 200px;
          font-family: 'Cairo', sans-serif;
        ">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
            <div style="
              width: 40px; 
              height: 40px; 
              background: #f5bf23; 
              border-radius: 50%; 
              display: flex; 
              align-items: center; 
              justify-content: center;
            ">
              <span style="font-size: 20px;">🔧</span>
            </div>
            <div style="flex: 1;">
              <h3 style="
                margin: 0;
                font-size: 15px;
                font-weight: 700;
                color: #f5bf23;
              ">${escapeHtml(branch.name || '')}</h3>
              ${branch.city ? `<p style="margin: 2px 0 0 0; font-size: 12px; opacity: 0.8;">${escapeHtml(branch.city)}</p>` : ''}
            </div>
          </div>
          ${branch.branch_type ? `
            <div style="
              display: flex;
              align-items: center;
              gap: 6px;
              margin: 8px 0;
              padding: 6px 10px;
              background: rgba(255,255,255,0.1);
              border-radius: 8px;
              font-size: 12px;
            ">
              <span>📍</span>
              <span>${escapeHtml(branch.branch_type)}</span>
            </div>
          ` : ''}
          ${branch.status === 'Active' ? `
            <div style="
              display: inline-flex;
              align-items: center;
              gap: 4px;
              margin-top: 8px;
              padding: 4px 12px;
              background: linear-gradient(135deg, #22c55e, #16a34a);
              border-radius: 20px;
              font-size: 11px;
              font-weight: 600;
            ">
              <span style="width: 6px; height: 6px; background: white; border-radius: 50%;"></span>
              متاح الآن • 24/7
            </div>
          ` : ''}
        </div>
      `);
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat([branch.longitude, branch.latitude])
        .setPopup(popup)
        .addTo(map.current!);
      
      markersRef.current.push(marker);
    });
  }, [branches, clearMarkers]);

  // Globe spinning animation
  const spinGlobe = useCallback(() => {
    if (!map.current || viewMode !== 'globe') return;
    
    const zoom = map.current.getZoom();
    const maxSpinZoom = 5;
    const slowSpinZoom = 3;
    const secondsPerRevolution = 180;
    
    if (isSpinning && !userInteractingRef.current && zoom < maxSpinZoom) {
      let distancePerSecond = 360 / secondsPerRevolution;
      if (zoom > slowSpinZoom) {
        const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
        distancePerSecond *= zoomDif;
      }
      const center = map.current.getCenter();
      center.lng -= distancePerSecond;
      map.current.easeTo({ center, duration: 1000, easing: (n) => n });
    }
  }, [isSpinning, viewMode]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || branches.length === 0) return;

    let currentMap: mapboxgl.Map | null = null;
    let isMounted = true;

    const initMap = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = await getMapboxToken();
        if (!token || !isMounted) {
          if (isMounted) {
            setError('مفتاح Mapbox غير متوفر');
            setLoading(false);
          }
          return;
        }
        
        mapboxgl.accessToken = token;

        // Clean up existing map safely
        if (map.current) {
          try {
            clearMarkers();
            map.current.remove();
          } catch (e) {
            console.warn('Map cleanup warning:', e);
          }
          map.current = null;
        }

        if (!isMounted || !mapContainer.current) return;

        const isGlobe = viewMode === 'globe';
        
        // Detect mobile for better initial zoom
        const isMobile = window.innerWidth < 768;
        
        currentMap = new mapboxgl.Map({
          container: mapContainer.current,
          style: isGlobe ? 'mapbox://styles/mapbox/standard' : 'mapbox://styles/mapbox/streets-v12',
          projection: isGlobe ? 'globe' : 'mercator',
          zoom: isGlobe ? (isMobile ? 1.2 : 1.8) : 10,
          center: [31.2357, 30.0444], // Cairo center
          pitch: isGlobe ? (isMobile ? 15 : 25) : 0,
          bearing: 0,
          attributionControl: false,
          touchZoomRotate: true,
          dragRotate: isGlobe,
        });

        map.current = currentMap;

        currentMap.on('load', () => {
          if (!isMounted || !currentMap) return;
          
          if (isGlobe) {
            // Add atmospheric fog for globe mode
            currentMap.setFog({
              color: 'rgb(15, 20, 35)',
              'high-color': 'rgb(35, 45, 75)',
              'horizon-blend': 0.4,
              'space-color': 'rgb(5, 8, 18)',
              'star-intensity': 0.9
            });
          }
          
          addMarkers();
          setLoading(false);
        });

        // Navigation controls
        currentMap.addControl(
          new mapboxgl.NavigationControl({ visualizePitch: true }),
          'top-right'
        );

        // Enable scroll zoom only in 2D mode
        if (!isGlobe) {
          currentMap.scrollZoom.enable();
        } else {
          currentMap.scrollZoom.disable();
        }

        // Interaction handlers for globe spinning
        if (isGlobe) {
          currentMap.on('mousedown', () => { userInteractingRef.current = true; });
          currentMap.on('dragstart', () => { userInteractingRef.current = true; });
          currentMap.on('mouseup', () => { 
            userInteractingRef.current = false; 
            spinGlobe(); 
          });
          currentMap.on('touchend', () => { 
            userInteractingRef.current = false; 
            spinGlobe(); 
          });
          currentMap.on('moveend', spinGlobe);
          
          // Start spinning
          spinGlobe();
        }

        currentMap.on('error', (e) => {
          console.error('Mapbox error:', e);
        });

      } catch (err) {
        console.error('Error initializing map:', err);
        if (isMounted) {
          setError('فشل في تحميل الخريطة');
          setLoading(false);
        }
      }
    };

    initMap();

    return () => {
      isMounted = false;
      
      if (spinAnimationRef.current) {
        cancelAnimationFrame(spinAnimationRef.current);
        spinAnimationRef.current = null;
      }
      
      clearMarkers();
      
      // Safely remove map
      if (currentMap) {
        try {
          currentMap.remove();
        } catch (e) {
          console.warn('Map removal warning:', e);
        }
      }
      map.current = null;
    };
  }, [branches, viewMode, addMarkers, spinGlobe, clearMarkers]);

  // Toggle view mode
  const toggleViewMode = useCallback(() => {
    setViewMode(prev => prev === 'globe' ? '2d' : 'globe');
  }, []);

  if (error) {
    return (
      <div 
        className={`relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 ${className}`}
        style={{ height }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white p-6">
            <Globe className="w-16 h-16 mx-auto mb-4 text-primary opacity-50" />
            <p className="text-lg font-medium">{error}</p>
            <p className="text-sm text-white/60 mt-2">يرجى المحاولة لاحقاً</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative rounded-2xl overflow-hidden shadow-2xl border border-border/50 bg-background ${className}`}
      style={{ height }}
    >
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/90 backdrop-blur-sm">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-sm text-muted-foreground">جاري تحميل الخريطة...</p>
          </div>
        </div>
      )}
      
      {/* Map container */}
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* View mode toggle */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button
          variant={viewMode === 'globe' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('globe')}
          className="gap-2 bg-card/95 backdrop-blur-md hover:bg-card border-border shadow-lg"
        >
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">Globe</span>
        </Button>
        <Button
          variant={viewMode === '2d' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setViewMode('2d')}
          className="gap-2 bg-card/95 backdrop-blur-md hover:bg-card border-border shadow-lg"
        >
          <Map className="w-4 h-4" />
          <span className="hidden sm:inline">2D Map</span>
        </Button>
      </div>

      {/* Globe spin control */}
      {viewMode === 'globe' && !loading && (
        <button
          onClick={() => setIsSpinning(!isSpinning)}
          className="absolute top-4 right-20 z-10 bg-card/95 backdrop-blur-md p-2.5 rounded-lg border border-border shadow-lg hover:bg-card transition-all"
          title={isSpinning ? 'إيقاف الدوران' : 'تشغيل الدوران'}
        >
          {isSpinning ? '⏸️' : '▶️'}
        </button>
      )}
      
      {/* Stats bar */}
      {showStats && !loading && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <div 
            className="bg-card/95 backdrop-blur-md px-6 py-3 rounded-full border border-border shadow-xl flex items-center gap-4 sm:gap-6" 
            dir="rtl"
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-bold text-foreground">{branches.length}</span>
              <span className="text-xs text-muted-foreground hidden sm:inline">موقع نشط</span>
            </div>
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">خدمة</span>
              <span className="text-sm font-bold text-primary">24/7</span>
            </div>
          </div>
        </div>
      )}

      {/* Mapbox attribution gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background/60 to-transparent pointer-events-none" />
    </div>
  );
};

export default BranchesMapbox;
