import { MAPS_CONFIG } from '@/config/maps';

/**
 * Google Maps Loader - يستخدم المفتاح من البيئة مباشرة
 * للاستخدام الفعلي في التطبيق (ServiceMap, InteractiveMap, etc.)
 */
class GoogleMapsLoader {
  private static instance: GoogleMapsLoader;
  private loadPromise: Promise<void> | null = null;
  private isLoaded = false;

  private constructor() {}

  static getInstance(): GoogleMapsLoader {
    if (!GoogleMapsLoader.instance) {
      GoogleMapsLoader.instance = new GoogleMapsLoader();
    }
    return GoogleMapsLoader.instance;
  }

  private getApiKey(): string {
    // استخدام المفتاح من متغيرات البيئة مباشرة (publishable key)
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn('Google Maps API key not found in environment variables');
    }
    return apiKey || '';
  }

  async load(): Promise<void> {
    if (this.isLoaded && window.google?.maps) {
      return Promise.resolve();
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve, reject) => {
      // تحقق إذا كانت الخريطة محملة مسبقاً
      if (window.google?.maps) {
        this.isLoaded = true;
        resolve();
        return;
      }

      const apiKey = this.getApiKey();
      if (!apiKey) {
        reject(new Error('Google Maps API key not configured. Please add VITE_GOOGLE_MAPS_API_KEY to .env'));
        return;
      }

      // إزالة أي سكريبت قديم
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        existingScript.remove();
      }

      const libs = MAPS_CONFIG.libraries.join(',');
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libs}&language=ar&region=EG&v=weekly`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.isLoaded = true;
        console.log('✅ Google Maps loaded successfully');
        resolve();
      };

      script.onerror = (error) => {
        this.loadPromise = null;
        console.error('❌ Failed to load Google Maps:', error);
        reject(new Error('فشل في تحميل Google Maps'));
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  isGoogleMapsLoaded(): boolean {
    return this.isLoaded && !!window.google?.maps;
  }

  reset(): void {
    this.loadPromise = null;
    this.isLoaded = false;
  }

  getMapId(): string {
    return MAPS_CONFIG.defaultOptions.mapId || '';
  }
}

export const googleMapsLoader = GoogleMapsLoader.getInstance();
export const loadGoogleMaps = () => googleMapsLoader.load();
export const resetGoogleMapsLoader = () => googleMapsLoader.reset();
export const getGoogleMapsId = () => googleMapsLoader.getMapId();
