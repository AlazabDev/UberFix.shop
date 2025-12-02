// src/components/landing/InteractiveMap.tsx

import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface BranchLocation {
  name: string;
  latitude: number;
  longitude: number;
  url?: string;
}

export const InteractiveMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN;
  const [branches, setBranches] = useState<BranchLocation[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);

  // تحميل بيانات الفروع من ملف JSON داخل public/data/branch_locations.json
  useEffect(() => {
    fetch("/data/branch_locations.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to load branch locations");
        }
        return response.json();
      })
      .then((data) => setBranches(data))
      .catch((error) => {
        console.error("Error loading branch locations:", error);
        setMapError("تعذر تحميل مواقع الفروع حاليًا.");
      });
  }, []);

  useEffect(() => {
    if (!mapContainer.current || branches.length === 0) return;

    if (!mapboxToken) {
      setMapError("مطلوب مفتاح Mapbox صالح لعرض الخريطة.");
      return;
    }

    setMapError(null);

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/standard",
      projection: { name: "globe" },
      zoom: 1.5,
      center: [30, 20], // تقريبًا مركز مصر/المنطقة
      pitch: 0,
    });

    map.current.on("error", () => {
      setMapError("حدث خطأ أثناء تحميل الخريطة. يرجى المحاولة لاحقًا.");
    });

    map.current.addControl(
      new mapboxgl.NavigationControl({
        visualizePitch: true,
      }),
      "top-right"
    );

    map.current.scrollZoom.disable();

    map.current.on("style.load", () => {
      map.current?.setFog({
        color: "rgb(30, 30, 40)",
        "high-color": "rgb(50, 50, 70)",
        "horizon-blend": 0.4,
        "space-color": "rgb(10, 10, 20)",
        "star-intensity": 0.6,
      });
    });

    const secondsPerRevolution = 180;
    const maxSpinZoom = 5;
    const slowSpinZoom = 3;
    let userInteracting = false;
    let spinEnabled = true;

    function spinGlobe() {
      if (!map.current) return;

      const zoom = map.current.getZoom();
      if (spinEnabled && !userInteracting && zoom < maxSpinZoom) {
        let distancePerSecond = 360 / secondsPerRevolution;
        if (zoom > slowSpinZoom) {
          const zoomDif =
            (maxSpinZoom - zoom) / (maxSpinZoom - slowSpinZoom);
          distancePerSecond *= zoomDif;
        }
        const center = map.current.getCenter();
        center.lng -= distancePerSecond;
        map.current.easeTo({ center, duration: 1000, easing: (n) => n });
      }
    }

    map.current.on("mousedown", () => {
      userInteracting = true;
    });

    map.current.on("dragstart", () => {
      userInteracting = true;
    });

    map.current.on("mouseup", () => {
      userInteracting = false;
      spinGlobe();
    });

    map.current.on("touchend", () => {
      userInteracting = false;
      spinGlobe();
    });

    map.current.on("moveend", () => {
      spinGlobe();
    });

    // إضافة العلامات لكل فرع
    branches.forEach((branch) => {
      const el = document.createElement("div");
      el.className = "custom-marker";
      el.style.width = "40px";
      el.style.height = "40px";
      el.style.backgroundImage = "url(/icons/branch-icon.png)";
      el.style.backgroundSize = "contain";
      el.style.backgroundRepeat = "no-repeat";
      el.style.cursor = "pointer";
      el.style.transition = "transform 0.3s ease";

      el.addEventListener("mouseenter", () => {
        el.style.transform = "scale(1.3) translateY(-5px)";
      });

      el.addEventListener("mouseleave", () => {
        el.style.transform = "scale(1) translateY(0)";
      });

      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: false,
        className: "custom-popup",
      }).setHTML(`
        <div style="padding: 8px; text-align: center; direction: rtl;">
          <strong style="color: #f59e0b; font-size: 14px;">${branch.name}</strong>
        </div>
      `);

      new mapboxgl.Marker(el)
        .setLngLat([branch.longitude, branch.latitude])
        .setPopup(popup)
        .addTo(map.current!);
    });

    spinGlobe();

    return () => {
      map.current?.remove();
    };
  }, [branches, mapboxToken]);

  return (
    <div className="relative w-full h-full rounded-2xl shadow-2xl overflow-hidden border-4 border-white/50 animate-glow">
      <div ref={mapContainer} className="absolute inset-0" />

      {mapError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <p className="text-base font-medium text-muted-foreground" dir="rtl">
            {mapError}
          </p>
        </div>
      ) : (
        <div
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 
                     bg-card/90 backdrop-blur-sm px-4 py-2 rounded-full 
                     border border-border shadow-lg"
          dir="rtl"
        >
          <p className="text-xs sm:text-sm text-foreground font-medium">
            🌍 {branches.length} موقع نشط •{" "}
            <span className="text-primary">خدمة 24/7</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default InteractiveMap;
