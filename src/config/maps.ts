/**
 * Google Maps Configuration
 * مركزية إعدادات الخرائط في جميع أنحاء التطبيق
 */

export const MAPS_CONFIG = {
  // API Key from environment variable
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDrSEYA_2HoB3IQuIg6OThed9r53I8gRGk',
  
  // Default map settings
  defaultCenter: { lat: 30.0444, lng: 31.2357 }, // Cairo, Egypt
  defaultZoom: 12,
  
  // Map options
  defaultOptions: {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true,
    mapId: 'b41c60a3f8e58bdb15b2c668',
    clickableIcons: true,
    gestureHandling: 'greedy',
  },
  
  // Libraries to load
  libraries: ['places', 'geometry', 'marker'] as const,
  
  // Script URL
  getScriptUrl: () => {
    const key = MAPS_CONFIG.apiKey;
    const libs = MAPS_CONFIG.libraries.join(',');
    return `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=${libs}&language=ar&region=EG&v=weekly`;
  },
  
  // Marker icons
  markerIcons: {
    vendor: '/placeholder.svg',
    branch: '/placeholder.svg',
    property: '/placeholder.svg',
    technician: '/placeholder.svg',
  },
} as const;
