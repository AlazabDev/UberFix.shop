import { MAPS_CONFIG } from '@/config/maps';

/**
 * Singleton Google Maps Loader
 * يضمن تحميل Google Maps مرة واحدة فقط في التطبيق
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

  /**
   * تحميل Google Maps API
   */
  async load(): Promise<void> {
    // If already loaded, return immediately
    if (this.isLoaded && window.google?.maps) {
      return Promise.resolve();
    }

    // If loading is in progress, return the existing promise
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // Start new load
    this.loadPromise = new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.google?.maps) {
        this.isLoaded = true;
        resolve();
        return;
      }

      // Check for API key
      if (!MAPS_CONFIG.apiKey) {
        reject(new Error('Google Maps API key is not configured'));
        return;
      }

      // Create and load script
      const script = document.createElement('script');
      script.src = MAPS_CONFIG.getScriptUrl();
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        this.isLoaded = true;
        resolve();
      };
      
      script.onerror = () => {
        this.loadPromise = null;
        reject(new Error('Failed to load Google Maps API'));
      };

      document.head.appendChild(script);
    });

    return this.loadPromise;
  }

  /**
   * التحقق من تحميل Google Maps
   */
  isGoogleMapsLoaded(): boolean {
    return this.isLoaded && !!window.google?.maps;
  }

  /**
   * إعادة تعيين الحالة (للاختبار فقط)
   */
  reset(): void {
    this.loadPromise = null;
    this.isLoaded = false;
  }
}

// Export singleton instance
export const googleMapsLoader = GoogleMapsLoader.getInstance();

// Legacy exports for backward compatibility
export const loadGoogleMaps = (apiKey?: string) => googleMapsLoader.load();
export const resetGoogleMapsLoader = () => googleMapsLoader.reset();