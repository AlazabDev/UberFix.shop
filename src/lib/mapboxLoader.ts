import { supabase } from '@/integrations/supabase/client';

class MapboxLoader {
  private static instance: MapboxLoader;
  private token: string | null = null;
  private loadingPromise: Promise<string> | null = null;

  private constructor() {}

  static getInstance(): MapboxLoader {
    if (!MapboxLoader.instance) {
      MapboxLoader.instance = new MapboxLoader();
    }
    return MapboxLoader.instance;
  }

  async getToken(): Promise<string> {
    if (this.token) return this.token;
    
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = new Promise(async (resolve, reject) => {
      try {
        const { data, error } = await supabase.functions.invoke('get-mapbox-token');
        
        if (error) {
          console.error('Error fetching Mapbox token:', error);
          reject(new Error('فشل في جلب مفتاح Mapbox'));
          return;
        }

        if (!data?.token) {
          reject(new Error('مفتاح Mapbox غير متوفر'));
          return;
        }

        this.token = data.token;
        resolve(this.token);
      } catch (err) {
        console.error('Mapbox token fetch error:', err);
        reject(err);
      } finally {
        this.loadingPromise = null;
      }
    });

    return this.loadingPromise;
  }

  reset(): void {
    this.token = null;
    this.loadingPromise = null;
  }
}

export const mapboxLoader = MapboxLoader.getInstance();
export const getMapboxToken = () => mapboxLoader.getToken();
