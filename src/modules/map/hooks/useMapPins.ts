import { useState, useCallback } from 'react';
import { MapPin, PopupData } from '../types';

export const useMapPins = () => {
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [popup, setPopup] = useState<PopupData | null>(null);

  const handlePinClick = useCallback((pin: MapPin, position: { x: number; y: number }) => {
    setSelectedPin(pin.id);
    setPopup({
      type: pin.type,
      data: pin.data,
      position,
    });
  }, []);

  const closePopup = useCallback(() => {
    setPopup(null);
    setSelectedPin(null);
  }, []);

  return {
    selectedPin,
    popup,
    handlePinClick,
    closePopup,
  };
};
