import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';

export const useDirection = () => {
  const { i18n } = useTranslation();
  const [direction, setDirection] = useState<'rtl' | 'ltr'>('rtl');
  const [isRTL, setIsRTL] = useState(true);

  useEffect(() => {
    const currentLang = i18n.language;
    const newDirection = currentLang === 'ar' ? 'rtl' : 'ltr';
    setDirection(newDirection);
    setIsRTL(newDirection === 'rtl');
    
    // Update document direction
    document.documentElement.dir = newDirection;
    document.documentElement.lang = currentLang;
  }, [i18n.language]);

  return { direction, isRTL };
};
