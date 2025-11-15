/**
 * Google Maps Configuration
 * مركزية إعدادات الخرائط في جميع أنحاء التطبيق
 */

export const MAPS_CONFIG = {
  // API Key from environment variable
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
  
  // Default map settings
  defaultCenter: { lat: 30.0444, lng: 31.2357 }, // Cairo, Egypt
  defaultZoom: 12,
  
  // Map options
  defaultOptions: {
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: true,
    mapId: '8e0a97af9386fef',
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
