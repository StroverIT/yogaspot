import type { Library } from '@googlemaps/js-api-loader';

/** Single loader id for the whole app - different ids throw at runtime. */
export const GOOGLE_MAPS_LOADER_ID = 'google-map-script';

/** Stable reference for `useJsApiLoader` - new arrays each render reload the script. */
export const GOOGLE_MAPS_LIBRARIES: Library[] = ['places'];
