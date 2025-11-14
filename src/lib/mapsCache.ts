/**
 * Google Maps API Key Cache Manager
 * يخزن API key في localStorage لمدة 24 ساعة لتقليل استدعاءات Edge Function
 */

const CACHE_KEY = 'google_maps_api_key_v2'; // تغيير لفرض تحديث Cache
const CACHE_EXPIRY_KEY = 'google_maps_api_key_expiry_v2';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 ساعة

interface CachedApiKey {
  key: string;
  expiresAt: number;
}

/**
 * حفظ API key في cache
 */
export const setCachedApiKey = (apiKey: string): void => {
  try {
    const expiresAt = Date.now() + CACHE_DURATION;
    localStorage.setItem(CACHE_KEY, apiKey);
    localStorage.setItem(CACHE_EXPIRY_KEY, expiresAt.toString());
    console.log('✅ API Key cached successfully until:', new Date(expiresAt).toLocaleString());
  } catch (error) {
    console.warn('⚠️ Failed to cache API key:', error);
  }
};

/**
 * جلب API key من cache
 * @returns API key إذا كان موجود وصالح، null إذا انتهى أو غير موجود
 */
export const getCachedApiKey = (): string | null => {
  try {
    const cachedKey = localStorage.getItem(CACHE_KEY);
    const expiryStr = localStorage.getItem(CACHE_EXPIRY_KEY);

    if (!cachedKey || !expiryStr) {
      console.log('📭 No cached API key found');
      return null;
    }

    const expiresAt = parseInt(expiryStr, 10);
    const now = Date.now();

    if (now > expiresAt) {
      console.log('⏰ Cached API key expired');
      clearCachedApiKey();
      return null;
    }

    console.log('✅ Using cached API key (valid until:', new Date(expiresAt).toLocaleString() + ')');
    return cachedKey;
  } catch (error) {
    console.warn('⚠️ Error reading cached API key:', error);
    return null;
  }
};

/**
 * مسح cache
 */
export const clearCachedApiKey = (): void => {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_EXPIRY_KEY);
    console.log('🗑️ API key cache cleared');
  } catch (error) {
    console.warn('⚠️ Failed to clear cache:', error);
  }
};

/**
 * التحقق من صلاحية cache
 */
export const isCacheValid = (): boolean => {
  const expiryStr = localStorage.getItem(CACHE_EXPIRY_KEY);
  if (!expiryStr) return false;
  
  const expiresAt = parseInt(expiryStr, 10);
  return Date.now() < expiresAt;
};
