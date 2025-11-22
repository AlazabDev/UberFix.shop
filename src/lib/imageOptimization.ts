/**
 * Image optimization utilities for lazy loading and responsive images
 */

export const getOptimizedImageUrl = (
  url: string,
  width?: number,
  quality: number = 85
): string => {
  // If it's a Supabase storage URL, we can add transformation params
  if (url.includes('supabase.co/storage')) {
    const urlObj = new URL(url);
    if (width) {
      urlObj.searchParams.set('width', width.toString());
    }
    urlObj.searchParams.set('quality', quality.toString());
    return urlObj.toString();
  }
  
  // For Google Cloud Storage or other services, return as-is
  // In production, you'd use Cloudflare Images or similar
  return url;
};

export const getSrcSet = (url: string, widths: number[] = [320, 640, 960, 1280, 1920]): string => {
  return widths
    .map((width) => `${getOptimizedImageUrl(url, width)} ${width}w`)
    .join(', ');
};

export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = url;
  });
};

/**
 * Lazy load images with Intersection Observer
 */
export const setupLazyLoading = () => {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const dataSrc = img.getAttribute('data-src');
          if (dataSrc) {
            img.src = dataSrc;
            img.removeAttribute('data-src');
            imageObserver.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll('img[data-src]').forEach((img) => {
      imageObserver.observe(img);
    });
  }
};
