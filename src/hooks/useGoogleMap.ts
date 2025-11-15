// Placeholder - no longer using Google Maps
export const useGoogleMap = () => {
  return {
    mapRef: null,
    map: null,
    isLoading: false,
    error: null,
    addMarker: () => {},
    clearMarkers: () => {},
    setCenter: () => {},
  };
};
