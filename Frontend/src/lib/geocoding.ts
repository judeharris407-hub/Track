import api from './api';
import { CITY_COORDINATES, LatLng } from './geoUtils';

export interface GeocodeResult {
  place_id?: string | number;
  name: string;
  display_name: string;
  lat: number;
  lng: number;
  type?: string;
  importance?: number;
}

/**
 * Searches for coordinates matching a location string query.
 * Prioritizes the backend proxy (/admin/geocode) to avoid rate limits & CORS,
 * with graceful fallback to client-side Nominatim and local city lookup.
 */
export async function searchLocations(query: string): Promise<GeocodeResult[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) return [];

  // 1. Try Backend Proxy
  try {
    const res = await api.get('/admin/geocode', {
      params: { q: trimmed },
      timeout: 5000,
    });
    if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
      return res.data.data;
    }
  } catch (err) {
    console.warn('[Geocoding] Backend geocode proxy failed, attempting direct fallback:', err);
  }

  // 2. Direct OpenStreetMap Nominatim API Fallback
  try {
    const directRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(trimmed)}&limit=6&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
        },
      }
    );
    if (directRes.ok) {
      const data = await directRes.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((item: any) => ({
          place_id: item.place_id,
          name: item.name || item.display_name?.split(',')[0] || trimmed,
          display_name: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
          type: item.type || item.class,
          importance: item.importance,
        }));
      }
    }
  } catch (directErr) {
    console.warn('[Geocoding] Direct Nominatim call failed:', directErr);
  }

  // 2b. Photon OSM Geocoder Fallback
  try {
    const photonRes = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(trimmed)}&limit=6`
    );
    if (photonRes.ok) {
      const pData = await photonRes.json();
      if (Array.isArray(pData.features) && pData.features.length > 0) {
        return pData.features.map((feat: any) => {
          const props = feat.properties || {};
          const [lon, lat] = feat.geometry?.coordinates || [0, 0];
          const name = props.name || props.city || props.country || trimmed;
          const parts = [props.name, props.city, props.state, props.country].filter(Boolean);
          return {
            place_id: props.osm_id || `${lat},${lon}`,
            name,
            display_name: parts.join(', ') || name,
            lat,
            lng: lon,
            type: props.osm_value || props.type || 'location',
            importance: 0.7,
          };
        });
      }
    }
  } catch (pErr) {
    console.warn('[Geocoding] Photon fallback failed:', pErr);
  }

  // 3. Fallback to Local City Coordinates Dictionary
  const lower = trimmed.toLowerCase();
  const matchedLocal: GeocodeResult[] = [];
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (key.includes(lower) || lower.includes(key)) {
      matchedLocal.push({
        place_id: `local-${key}`,
        name: key.toUpperCase(),
        display_name: `${key.charAt(0).toUpperCase() + key.slice(1)} (Hub)`,
        lat: coords.lat,
        lng: coords.lng,
        type: 'logistics_hub',
      });
      if (matchedLocal.length >= 4) break;
    }
  }

  return matchedLocal;
}

/**
 * Reverse geocode a latitude & longitude to a human-readable address.
 */
export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=14&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
        },
      }
    );
    if (res.ok) {
      const data = await res.json();
      return data.display_name || null;
    }
  } catch (err) {
    console.warn('[ReverseGeocode] Failed:', err);
  }
  return null;
}
