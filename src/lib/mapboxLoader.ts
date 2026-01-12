/**
 * Mapbox Loader - للاستخدام الترويجي فقط (Globe 3D)
 * ليس للاستخدام الفعلي في التطبيق
 */

import type mapboxglType from 'mapbox-gl';

let mapboxLoaded = false;
let mapboxPromise: Promise<typeof mapboxglType> | null = null;

export const getMapboxToken = (): string => {
  // استخدام المفتاح من البيئة مباشرة (publishable token)
  return import.meta.env.VITE_MAPBOX_TOKEN || '';
};

export const loadMapbox = async (): Promise<typeof mapboxglType> => {
  if (mapboxPromise) {
    return mapboxPromise;
  }

  mapboxPromise = (async () => {
    const mapboxgl = await import('mapbox-gl');
    
    const token = getMapboxToken();
    if (!token) {
      console.warn('Mapbox token not found - Globe visualization may not work');
    } else {
      mapboxgl.default.accessToken = token;
    }
    
    mapboxLoaded = true;
    console.log('✅ Mapbox loaded successfully (promotional use only)');
    
    return mapboxgl.default;
  })();

  return mapboxPromise;
};

export const isMapboxLoaded = (): boolean => mapboxLoaded;

export const mapboxLoader = {
  getToken: getMapboxToken,
  load: loadMapbox,
  isLoaded: isMapboxLoaded,
};

// تصريح للنافذة
declare global {
  interface Window {
    mapboxgl?: typeof mapboxglType;
  }
}
