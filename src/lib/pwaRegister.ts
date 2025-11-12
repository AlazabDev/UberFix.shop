/**
 * PWA Registration Handler
 * Uses vite-plugin-pwa auto-registration
 */

export function registerPWA() {
  // Service worker is automatically registered by vite-plugin-pwa
  // This function is kept for compatibility but does nothing
  if (import.meta.env.DEV) {
    console.log('PWA: Development mode - service worker disabled');
  }
}
