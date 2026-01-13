import { useState, useEffect } from "react";

interface LocationState {
  loaded: boolean;
  coordinates?: { lat: number; lng: number };
  error?: { code: number; message: string };
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<LocationState>(() => {
    if (!("geolocation" in navigator)) {
      return {
        loaded: true,
        error: {
          code: 0,
          message: "Geolocation not supported",
        },
      };
    }
    return {
      loaded: false,
    };
  });

  const onSuccess = (location: GeolocationPosition) => {
    setLocation({
      loaded: true,
      coordinates: {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      },
    });
  };

  const onError = (error: GeolocationPositionError) => {
    setLocation({
      loaded: true,
      error: {
        code: error.code,
        message: error.message,
      },
    });
  };

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      return;
    }

    navigator.geolocation.getCurrentPosition(onSuccess, onError);
  }, []);

  return location;
};
