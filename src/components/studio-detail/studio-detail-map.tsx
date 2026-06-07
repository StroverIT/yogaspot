'use client';

import { useMemo } from 'react';
import { GoogleMap, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import { GOOGLE_MAPS_LIBRARIES } from '@/lib/google-maps-config';
import type { Studio } from '@/data/mock-data';

function hasStudioCoords(studio: Studio) {
  const { lat, lng } = studio;
  if (lat == null || lng == null) return false;
  if (lat === 0 && lng === 0) return false;
  return true;
}

export function StudioDetailMap({ studio }: { studio: Studio }) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  const coords = useMemo(() => {
    if (!hasStudioCoords(studio)) return null;
    return { lat: studio.lat, lng: studio.lng };
  }, [studio]);

  if (!apiKey) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
        За да се визуализира карта, добавете `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
      </div>
    );
  }

  if (!coords) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
        Локацията на картата още не е зададена за това студио.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Зареждане на карта…</div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: '100%', height: '100%' }}
      center={coords}
      zoom={15}
      options={{
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      }}
    >
      <MarkerF position={coords} />
    </GoogleMap>
  );
}
