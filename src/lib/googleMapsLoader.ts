import { MAPS_CONFIG } from '@/config/maps';
import { supabase } from '@/integrations/supabase/client';

class GoogleMapsLoader {
  private static instance: GoogleMapsLoader;
  private loadPromise: Promise<void> | null = null;
  private isLoaded = false;
  private apiKey: string | null = null;

  private constructor() {}

  static getInstance(): GoogleMapsLoader {
    if (!GoogleMapsLoader.instance) {
      GoogleMapsLoader.instance = new GoogleMapsLoader();
    }
    return GoogleMapsLoader.instance;
  }

  private async fetchApiKey(): Promise<string> {
    if (this.apiKey) return this.apiKey;
    
    try {
      const { data, error } = await supabase.functions.invoke('get-maps-key');
      if (error) throw error;
      this.apiKey = data?.apiKey || '';
      return this.apiKey;
    } catch (err) {
      console.error('Failed to get Google Maps API key:', err);
      throw new Error('فشل في الحصول على مفتاح Google Maps');
    }
  }

  async load(): Promise<void> {
    if (this.isLoaded && window.google?.maps) {
      return Promise.resolve();
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadPromise = new Promise((resolve, reject) => {
      const initiateLoad = async () => {
        if (window.google?.maps) {
          this.isLoaded = true;
          resolve();
          return;
        }

        try {
          const apiKey = await this.fetchApiKey();
          if (!apiKey) {
            reject(new Error('Google Maps API key not configured'));
            return;
          }

          const libs = MAPS_CONFIG.libraries.join(',');
          const script = document.createElement('script');
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libs}&language=ar&region=EG&v=weekly`;
          script.async = true;
          script.defer = true;

          script.onload = () => {
            this.isLoaded = true;
            resolve();
          };

          script.onerror = () => {
            this.loadPromise = null;
            reject(new Error('فشل في تحميل Google Maps'));
          };

          document.head.appendChild(script);
        } catch (err) {
          this.loadPromise = null;
          reject(err);
        }
      };

      void initiateLoad();
    });

    return this.loadPromise;
  }

  isGoogleMapsLoaded(): boolean {
    return this.isLoaded && !!window.google?.maps;
  }

  reset(): void {
    this.loadPromise = null;
    this.isLoaded = false;
    this.apiKey = null;
  }
}

export const googleMapsLoader = GoogleMapsLoader.getInstance();
export const loadGoogleMaps = () => googleMapsLoader.load();
export const resetGoogleMapsLoader = () => googleMapsLoader.reset();
