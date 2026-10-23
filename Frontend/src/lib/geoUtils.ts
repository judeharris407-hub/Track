/**
 * Geographical utilities and city coordinate resolution for parcel tracking.
 */

export interface LatLng {
  lat: number;
  lng: number;
}

// Major logistics hubs and cities worldwide
export const CITY_COORDINATES: Record<string, LatLng> = {
  // United States
  'new york': { lat: 40.7128, lng: -74.0060 },
  'ny': { lat: 40.7128, lng: -74.0060 },
  'jfk': { lat: 40.6413, lng: -73.7781 },
  'los angeles': { lat: 34.0522, lng: -118.2437 },
  'lax': { lat: 33.9416, lng: -118.4085 },
  'chicago': { lat: 41.8781, lng: -87.6298 },
  'ord': { lat: 41.9742, lng: -87.9073 },
  'houston': { lat: 29.7604, lng: -95.3698 },
  'phoenix': { lat: 33.4484, lng: -112.0740 },
  'philadelphia': { lat: 39.9526, lng: -75.1652 },
  'san antonio': { lat: 29.4241, lng: -98.4936 },
  'san diego': { lat: 32.7157, lng: -117.1611 },
  'dallas': { lat: 32.7767, lng: -96.7970 },
  'dfw': { lat: 32.8998, lng: -97.0403 },
  'san jose': { lat: 37.3382, lng: -121.8863 },
  'austin': { lat: 30.2672, lng: -97.7431 },
  'san francisco': { lat: 37.7749, lng: -122.4194 },
  'sfo': { lat: 37.6213, lng: -122.3790 },
  'seattle': { lat: 47.6062, lng: -122.3321 },
  'sea': { lat: 47.4502, lng: -122.3088 },
  'denver': { lat: 39.7392, lng: -104.9903 },
  'dia': { lat: 39.8561, lng: -104.6737 },
  'portland': { lat: 45.5152, lng: -122.6784 },
  'boston': { lat: 42.3601, lng: -71.0589 },
  'miami': { lat: 25.7617, lng: -80.1918 },
  'atlanta': { lat: 33.7490, lng: -84.3880 },
  'atl': { lat: 33.6407, lng: -84.4277 },
  'detroit': { lat: 42.3314, lng: -83.0458 },
  'minneapolis': { lat: 44.9778, lng: -93.2650 },
  'las vegas': { lat: 36.1699, lng: -115.1398 },
  'pittsburgh': { lat: 40.4406, lng: -79.9959 },
  'medford': { lat: 42.3265, lng: -122.8756 },
  'springfield': { lat: 44.0462, lng: -123.0220 },
  'memphis': { lat: 35.1495, lng: -90.0490 }, // FedEx World Hub
  'louisville': { lat: 38.2527, lng: -85.7585 }, // UPS Worldport

  // International Logistics Gateways
  'london': { lat: 51.5074, lng: -0.1278 },
  'heathrow': { lat: 51.4700, lng: -0.4543 },
  'paris': { lat: 48.8566, lng: 2.3522 },
  'cdg': { lat: 49.0097, lng: 2.5479 },
  'frankfurt': { lat: 50.1109, lng: 8.6821 },
  'fra': { lat: 50.0379, lng: 8.5622 },
  'amsterdam': { lat: 52.3676, lng: 4.9041 },
  'berlin': { lat: 52.5200, lng: 13.4050 },
  'madrid': { lat: 40.4168, lng: -3.7038 },
  'rome': { lat: 41.9028, lng: 12.4964 },
  'tokyo': { lat: 35.6762, lng: 139.6503 },
  'narita': { lat: 35.7720, lng: 140.3929 },
  'hong kong': { lat: 22.3193, lng: 114.1694 },
  'singapore': { lat: 1.3521, lng: 103.8198 },
  'shanghai': { lat: 31.2304, lng: 121.4737 },
  'beijing': { lat: 39.9042, lng: 116.4074 },
  'dubai': { lat: 25.2048, lng: 55.2708 },
  'dxb': { lat: 25.2532, lng: 55.3657 },
  'sydney': { lat: -33.8688, lng: 151.2093 },
  'melbourne': { lat: -37.8136, lng: 144.9631 },
  'toronto': { lat: 43.6532, lng: -79.3832 },
  'vancouver': { lat: 49.2827, lng: -123.1207 },
  'montreal': { lat: 45.5017, lng: -73.5673 },
  'mexico city': { lat: 19.4326, lng: -99.1332 },
  'sao paulo': { lat: -23.5505, lng: -46.6333 },
};

/**
 * Attempt to resolve coordinates from a location string (city, state, country, hub name).
 */
export function resolveLocationCoordinates(locationStr?: string | null): LatLng | null {
  if (!locationStr || typeof locationStr !== 'string') return null;

  const normalized = locationStr.toLowerCase().trim();

  // 1. Direct key match
  if (CITY_COORDINATES[normalized]) {
    return CITY_COORDINATES[normalized];
  }

  // 2. Substring match
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (normalized.includes(key)) {
      return coords;
    }
  }

  // 3. Fallback deterministic generator within continental US if unrecognized
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = ((Math.abs(hash) % 1500) / 100) + 30; // 30 to 45 deg N
  const lngOffset = -(((Math.abs(hash >> 3) % 4500) / 100) + 75); // -75 to -120 deg W

  return { lat: Number(latOffset.toFixed(4)), lng: Number(lngOffset.toFixed(4)) };
}

/**
 * Calculates straight line distance (Haversine formula in kilometers or miles).
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number, unit: 'km' | 'mi' = 'mi'): number {
  const R = unit === 'mi' ? 3958.8 : 6371; // Radius of Earth
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Spherical Linear Interpolation (Slerp) on a unit sphere.
 * Produces accurate curved great-circle arcs between two geographic coordinates.
 */
export function slerp(p1: LatLng, p2: LatLng, t: number): LatLng {
  const toRad = Math.PI / 180;
  const toDeg = 180 / Math.PI;

  const lat1 = p1.lat * toRad;
  const lon1 = p1.lng * toRad;
  const lat2 = p2.lat * toRad;
  const lon2 = p2.lng * toRad;

  // Convert to 3D Cartesian coordinates
  const v1 = {
    x: Math.cos(lat1) * Math.cos(lon1),
    y: Math.cos(lat1) * Math.sin(lon1),
    z: Math.sin(lat1),
  };
  const v2 = {
    x: Math.cos(lat2) * Math.cos(lon2),
    y: Math.cos(lat2) * Math.sin(lon2),
    z: Math.sin(lat2),
  };

  // Dot product
  let dot = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
  dot = Math.max(-1, Math.min(1, dot));

  const omega = Math.acos(dot);

  if (Math.abs(omega) < 0.0001) {
    // Points are nearly identical; fallback to linear interpolation
    return {
      lat: p1.lat + t * (p2.lat - p1.lat),
      lng: p1.lng + t * (p2.lng - p1.lng),
    };
  }

  const sinOmega = Math.sin(omega);
  const a = Math.sin((1 - t) * omega) / sinOmega;
  const b = Math.sin(t * omega) / sinOmega;

  const x = a * v1.x + b * v2.x;
  const y = a * v1.y + b * v2.y;
  const z = a * v1.z + b * v2.z;

  const lat = Math.atan2(z, Math.sqrt(x * x + y * y)) * toDeg;
  const lon = Math.atan2(y, x) * toDeg;

  return {
    lat: Number(lat.toFixed(6)),
    lng: Number(lon.toFixed(6)),
  };
}

/**
 * Generates an array of points along a great-circle arc for AIR and SEA shipments.
 */
export function getGreatCircleArc(start: LatLng, end: LatLng, numPoints: number = 60): LatLng[] {
  const points: LatLng[] = [];
  const steps = Math.max(numPoints, 10);
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    points.push(slerp(start, end, t));
  }
  return points;
}

// In-memory cache for OSRM routes to avoid excessive API requests
const osrmCache = new Map<string, LatLng[]>();

/**
 * Queries OSRM public routing API for highway driving paths (LAND shipments).
 * Falls back to direct straight line if the routing service is unavailable.
 * Guarantees that the returned route path explicitly anchors at start and end coordinates without gaps.
 */
export async function fetchOSRMRoute(start: LatLng, end: LatLng, waypoints?: LatLng[]): Promise<LatLng[]> {
  const wpStr = Array.isArray(waypoints) && waypoints.length > 0
    ? waypoints.map((w) => `${w.lat.toFixed(4)},${w.lng.toFixed(4)}`).join('|')
    : '';
  const cacheKey = `${start.lat.toFixed(4)},${start.lng.toFixed(4)}->[${wpStr}]->${end.lat.toFixed(4)},${end.lng.toFixed(4)}`;
  if (osrmCache.has(cacheKey)) {
    return osrmCache.get(cacheKey)!;
  }

  try {
    const waypointsCoordString = Array.isArray(waypoints) && waypoints.length > 0
      ? ';' + waypoints.map((w) => `${w.lng},${w.lat}`).join(';')
      : '';
    const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat}${waypointsCoordString};${end.lng},${end.lat}?overview=full&geometries=geojson`;
    const response = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (response.ok) {
      const data = await response.json();
      if (data.routes && data.routes[0]?.geometry?.coordinates) {
        const coords: LatLng[] = data.routes[0].geometry.coordinates.map(
          ([lng, lat]: [number, number]) => ({ lat, lng })
        );
        if (coords.length > 0) {
          // Prepend start coordinate if not strictly matching to eliminate marker gap
          if (coords[0].lat !== start.lat || coords[0].lng !== start.lng) {
            coords.unshift(start);
          }
          // Append end coordinate if not strictly matching to eliminate destination gap
          if (coords[coords.length - 1].lat !== end.lat || coords[coords.length - 1].lng !== end.lng) {
            coords.push(end);
          }
          osrmCache.set(cacheKey, coords);
          return coords;
        }
      }
    }
  } catch (err) {
    console.warn('[OSRM] Highway routing unavailable, falling back to direct line:', err);
  }

  // Fallback: direct line with intermediate segments
  const fallback = [start, ...(Array.isArray(waypoints) ? waypoints : []), end];
  osrmCache.set(cacheKey, fallback);
  return fallback;
}

/**
 * Interpolates an exact position along an arbitrary polyline path based on a progress ratio (0 to 1).
 */
export function interpolateAlongPath(path: LatLng[], ratio: number): LatLng {
  if (!path || path.length === 0) return { lat: 0, lng: 0 };
  if (path.length === 1 || ratio <= 0) return path[0];
  if (ratio >= 1) return path[path.length - 1];

  // Calculate segment distances
  const distances: number[] = [];
  let totalDistance = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const d = calculateDistance(path[i].lat, path[i].lng, path[i + 1].lat, path[i + 1].lng, 'km');
    distances.push(d);
    totalDistance += d;
  }

  if (totalDistance === 0) return path[0];

  const targetDistance = ratio * totalDistance;
  let accumulated = 0;

  for (let i = 0; i < distances.length; i++) {
    const segDist = distances[i];
    if (accumulated + segDist >= targetDistance || i === distances.length - 1) {
      const segmentRatio = segDist === 0 ? 0 : (targetDistance - accumulated) / segDist;
      const clampedSegRatio = Math.max(0, Math.min(1, segmentRatio));
      return {
        lat: path[i].lat + (path[i + 1].lat - path[i].lat) * clampedSegRatio,
        lng: path[i].lng + (path[i + 1].lng - path[i].lng) * clampedSegRatio,
      };
    }
    accumulated += segDist;
  }

  return path[path.length - 1];
}

/**
 * Calculates current time-based transit progress (0.0 to 1.0)
 * based on elapsed time between departure_time and estimated_arrival_time.
 */
export function calculateTimeProgress(
  departureTime?: string | null,
  estimatedArrival?: string | null,
  status?: string | null
): number {
  // If explicitly delivered, lock immediately to 100%
  if (status && status.toUpperCase().includes('DELIVERED')) {
    return 1.0;
  }

  if (departureTime && estimatedArrival) {
    const dep = new Date(departureTime).getTime();
    const eta = new Date(estimatedArrival).getTime();
    const now = Date.now();

    if (!isNaN(dep) && !isNaN(eta) && eta > dep) {
      if (now <= dep) return 0.02; // Scheduled / at origin
      if (now >= eta) return 0.98; // Arriving at destination
      const elapsed = (now - dep) / (eta - dep);
      return Math.max(0.02, Math.min(0.98, elapsed));
    }
  }

  // Fallback status milestones if timestamps unavailable
  const normalizedStatus = (status || '').toUpperCase();
  if (normalizedStatus.includes('PICKED') || normalizedStatus.includes('RECEIVED')) return 0.05;
  if (normalizedStatus.includes('DEPARTED') || normalizedStatus.includes('SORTING')) return 0.25;
  if (normalizedStatus.includes('TRANSIT')) return 0.50;
  if (normalizedStatus.includes('CUSTOMS') || normalizedStatus.includes('PORT') || normalizedStatus.includes('HUB')) return 0.70;
  if (normalizedStatus.includes('OUT FOR DELIVERY')) return 0.90;

  return 0.35;
}

/**
 * Computes bearing / compass heading in degrees (0 - 360) from start to end point.
 */
export function calculateBearing(start: LatLng, end: LatLng): number {
  const toRad = Math.PI / 180;
  const toDeg = 180 / Math.PI;

  const lat1 = start.lat * toRad;
  const lat2 = end.lat * toRad;
  const dLon = (end.lng - start.lng) * toRad;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  const brng = Math.atan2(y, x) * toDeg;
  return (brng + 360) % 360;
}

