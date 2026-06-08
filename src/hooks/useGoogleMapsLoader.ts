'use client';

import { useJsApiLoader } from '@react-google-maps/api';
import { GOOGLE_MAPS_LIBRARIES, GOOGLE_MAPS_LOADER_ID } from '@/lib/google-maps-config';

/** Shared Maps loader — one id/options app-wide (required by @react-google-maps/api). */
export function useGoogleMapsLoader() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
  const loader = useJsApiLoader({
    id: GOOGLE_MAPS_LOADER_ID,
    googleMapsApiKey: apiKey,
    libraries: GOOGLE_MAPS_LIBRARIES,
  });
  return { ...loader, apiKey };
}
