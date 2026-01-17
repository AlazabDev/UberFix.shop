import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

export const useDirection = () => {
  const { i18n } = useTranslation();
  const [direction, setDirection] = useState<'rtl' | 'ltr'>('rtl');
  const [isRTL, setIsRTL] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only run on client after mount
    if (!mounted || typeof document === 'undefined') return;
    
    try {
      const currentLang = i18n.language || 'ar';
      const newDirection = currentLang === 'ar' ? 'rtl' : 'ltr';
      setDirection(newDirection);
      setIsRTL(newDirection === 'rtl');
      
      // Update document direction safely
      document.documentElement.dir = newDirection;
      document.documentElement.lang = currentLang;
    } catch (error) {
      console.warn('Error setting document direction:', error);
    }
  }, [i18n.language, mounted]);

  return { direction, isRTL };
};
