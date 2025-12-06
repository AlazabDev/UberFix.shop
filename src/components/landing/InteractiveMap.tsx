// src/components/landing/InteractiveMap.tsx
// Using Mapbox for 3D Globe visualization only

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { getMapboxToken } from "@/lib/mapboxLoader";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface BranchLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  branch_type?: string;
  status?: string;
}

// HTML escape function for XSS prevention
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export const InteractiveMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [branches, setBranches] = useState<BranchLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(true);

  // Load branches from Supabase with JSON fallback
  useEffect(() => {
    const loadBranches = async () => {
      try {
        const { data, error: dbError } = await supabase
          .from('branch_locations')
          .select('id, branch, latitude, longitude, branch_type, status')
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);

        if (dbError) throw dbError;

        const validBranches = (data || [])
          .filter(b => b.latitude && b.longitude)
          .map(b => ({
            id: b.id,
            name: b.branch || 'فرع',
            latitude: parseFloat(b.latitude as string),
            longitude: parseFloat(b.longitude as string),
            branch_type: b.branch_type || undefined,
            status: b.status || undefined
          }));

        if (validBranches.length > 0) {
          setBranches(validBranches);
        } else {
          throw new Error('No valid branches found');
        }
      } catch (err) {
        console.warn('Falling back to JSON:', err);
        // Fallback to JSON
        try {
          const response = await fetch('/data/branch_locations.json');
          const jsonData = await response.json();
          setBranches(jsonData.map((b: any, i: number) => ({
            id: `branch-${i}`,
            name: b.name || 'فرع',
            latitude: b.latitude,
            longitude: b.longitude
          })));
        } catch {
          setError('تعذر تحميل بيانات الفروع');
        }
      }
    };

    loadBranches();
  }, []);

  // Initialize Mapbox Globe
  useEffect(() => {
    if (!mapContainer.current) return;

    const initMap = async () => {
      try {
        setLoading(true);
        const token = await getMapboxToken();
        
        if (!token) {
          setError('مفتاح الخريطة غير متوفر');
          setLoading(false);
          return;
        }

        mapboxgl.accessToken = token;

        map.current = new mapboxgl.Map({
          container: mapContainer.current!,
          style: 'mapbox://styles/mapbox/standard',
          projection: 'globe',
          zoom: 1.5,
          center: [31.2357, 30.0444], // Cairo
          pitch: 20,
          bearing: 0,
        });

        map.current.on('load', () => {
          // Atmosphere and fog
          map.current?.setFog({
            color: 'rgb(20, 20, 30)',
            'high-color': 'rgb(40, 50, 80)',
            'horizon-blend': 0.3,
            'space-color': 'rgb(5, 5, 15)',
            'star-intensity': 0.8
          });

          // Add markers when branches are loaded
          if (branches.length > 0) {
            addMarkers();
          }

          setLoading(false);
        });

        // Navigation controls
        map.current.addControl(
          new mapboxgl.NavigationControl({ visualizePitch: true }),
          'top-right'
        );

        map.current.scrollZoom.disable();

        // Spinning animation
        const secondsPerRevolution = 180;
        const maxSpinZoom = 5;
        const slowSpinZoom = 3;
        let userInteracting = false;

        const spinGlobe = () => {
          if (!map.current) return;
          
          const zoom = map.current.getZoom();
          if (isSpinning && !userInteracting && zoom < maxSpinZoom) {
            let distancePerSecond = 360 / secondsPerRevolution;
            if (zoom > slowSpinZoom) {
              const zoomDif = (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
              distancePerSecond *= zoomDif;
            }
            const center = map.current.getCenter();
            center.lng -= distancePerSecond;
            map.current.easeTo({ center, duration: 1000, easing: (n) => n });
          }
        };

        map.current.on('mousedown', () => { userInteracting = true; });
        map.current.on('dragstart', () => { userInteracting = true; });
        map.current.on('mouseup', () => { userInteracting = false; spinGlobe(); });
        map.current.on('touchend', () => { userInteracting = false; spinGlobe(); });
        map.current.on('moveend', spinGlobe);

        spinGlobe();

        map.current.on('error', (e) => {
          console.error('Mapbox error:', e);
          setError('حدث خطأ في تحميل الخريطة');
          setLoading(false);
        });

      } catch (err) {
        console.error('Error initializing map:', err);
        setError('فشل في تهيئة الخريطة');
        setLoading(false);
      }
    };

    initMap();

    return () => {
      map.current?.remove();
    };
  }, [isSpinning]);

  // Add markers when branches change
  const addMarkers = () => {
    if (!map.current) return;

    branches.forEach(branch => {
      if (!branch.latitude || !branch.longitude) return;

      // Custom marker element
      const el = document.createElement('div');
      el.className = 'globe-marker';
      el.innerHTML = `
        <div style="
          width: 32px;
          height: 40px;
          background: linear-gradient(135deg, hsl(43, 90%, 55%) 0%, hsl(40, 90%, 45%) 100%);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.3s ease;
        ">
          <span style="transform: rotate(45deg); font-size: 14px;">🏪</span>
        </div>
      `;

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      // Popup with escaped HTML
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        className: 'globe-popup'
      }).setHTML(`
        <div style="
          padding: 12px 16px;
          background: linear-gradient(135deg, hsl(213, 60%, 13%) 0%, hsl(208, 54%, 23%) 100%);
          border-radius: 12px;
          color: white;
          text-align: right;
          direction: rtl;
          min-width: 180px;
        ">
          <h3 style="
            margin: 0 0 6px 0;
            font-size: 14px;
            font-weight: 700;
            color: hsl(43, 90%, 55%);
          ">${escapeHtml(branch.name)}</h3>
          ${branch.branch_type ? `<p style="margin: 0; font-size: 11px; opacity: 0.8;">📍 ${escapeHtml(branch.branch_type)}</p>` : ''}
          ${branch.status === 'Active' ? `<span style="
            display: inline-block;
            margin-top: 6px;
            padding: 2px 8px;
            background: hsl(142, 71%, 45%);
            border-radius: 12px;
            font-size: 10px;
          ">✓ نشط</span>` : ''}
        </div>
      `);

      new mapboxgl.Marker(el)
        .setLngLat([branch.longitude, branch.latitude])
        .setPopup(popup)
        .addTo(map.current!);
    });
  };

  // Re-add markers when branches load
  useEffect(() => {
    if (branches.length > 0 && map.current && !loading) {
      addMarkers();
    }
  }, [branches]);

  if (error) {
    return (
      <div className="relative w-full h-[500px] rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white p-6">
            <div className="text-4xl mb-4">🌍</div>
            <p className="text-lg font-medium">{error}</p>
            <p className="text-sm text-white/60 mt-2">يرجى المحاولة لاحقاً</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[500px] rounded-2xl shadow-2xl overflow-hidden border border-border/50">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm">
          <div className="text-center text-white">
            <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3 text-primary" />
            <p className="text-sm">جاري تحميل الخريطة...</p>
          </div>
        </div>
      )}
      
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/20 via-transparent to-transparent" />
      
      {/* Stats bar */}
      {!loading && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10">
          <div className="bg-card/95 backdrop-blur-md px-6 py-3 rounded-full border border-border shadow-xl flex items-center gap-6" dir="rtl">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏪</span>
              <div>
                <p className="text-xs text-muted-foreground">فرع نشط</p>
                <p className="font-bold text-foreground">{branches.length}</p>
              </div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-2xl">👨‍🔧</span>
              <div>
                <p className="text-xs text-muted-foreground">فني متاح</p>
                <p className="font-bold text-primary">25</p>
              </div>
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex items-center gap-2">
              <span className="text-2xl">⏰</span>
              <div>
                <p className="text-xs text-muted-foreground">دعم</p>
                <p className="font-bold text-green-500">24/7</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Spin toggle */}
      <button
        onClick={() => setIsSpinning(!isSpinning)}
        className="absolute top-4 left-4 z-10 bg-card/90 backdrop-blur-sm p-2 rounded-lg border border-border shadow-lg hover:bg-card transition-colors"
        title={isSpinning ? 'إيقاف الدوران' : 'تشغيل الدوران'}
      >
        {isSpinning ? '⏸️' : '▶️'}
      </button>
    </div>
  );
};

export default InteractiveMap;