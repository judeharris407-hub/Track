'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import {
  resolveLocationCoordinates,
  calculateDistance,
  getGreatCircleArc,
  fetchOSRMRoute,
  interpolateAlongPath,
  calculateTimeProgress,
  calculateBearing,
  LatLng,
} from '@/lib/geoUtils';
import {
  Truck,
  Plane,
  Ship,
  CheckCircle2,
  Package,
  Layers,
  Crosshair,
  Maximize2,
  Compass,
  Clock,
  Sparkles,
} from 'lucide-react';

export interface RouteCheckpoint {
  lat: number;
  lng: number;
  location_name?: string;
  status?: string;
  description?: string;
  timestamp?: string;
}

export interface ParcelMapProps {
  origin?: string;
  origin_lat?: number | null;
  origin_lng?: number | null;
  destination?: string;
  destination_lat?: number | null;
  destination_lng?: number | null;
  current_location?: string;
  current_lat?: number | null;
  current_lng?: number | null;
  status?: string;
  route_history?: RouteCheckpoint[] | null;
  shipment_type?: 'AIR' | 'SEA' | 'LAND' | string;
  departure_time?: string | null;
  estimated_arrival_time?: string | null;
  className?: string;
}

export default function ParcelMap({
  origin,
  origin_lat,
  origin_lng,
  destination,
  destination_lat,
  destination_lng,
  current_location,
  current_lat,
  current_lng,
  status = 'In Transit',
  route_history = [],
  shipment_type = 'LAND',
  departure_time,
  estimated_arrival_time,
  className = '',
}: ParcelMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  const [activeTileLayer, setActiveTileLayer] = useState<'streets' | 'osm'>('streets');

  const normalizedType = (shipment_type || 'LAND').toUpperCase();
  const isDelivered = status?.toUpperCase().includes('DELIVERED') || false;

  // Resolve Origin and Destination coordinates
  const resolvedOrigin: LatLng = (origin_lat && origin_lng)
    ? { lat: Number(origin_lat), lng: Number(origin_lng) }
    : resolveLocationCoordinates(origin) || { lat: 40.7128, lng: -74.0060 };

  const resolvedDest: LatLng = (destination_lat && destination_lng)
    ? { lat: Number(destination_lat), lng: Number(destination_lng) }
    : resolveLocationCoordinates(destination) || { lat: 34.0522, lng: -118.2437 };

  // Calculate automated time-based progress ratio (0 to 1)
  const timeProgressRatio = calculateTimeProgress(departure_time, estimated_arrival_time, status);

  // Check if explicit manual checkpoints exist beyond initial registration
  const hasManualCheckpoints = Array.isArray(route_history) && route_history.length > 1;

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    async function initializeMap() {
      const L = await import('leaflet');
      if (!isMounted || !mapContainerRef.current) return;

      // Reset existing map instance if any
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Extract valid intermediate checkpoints from route_history
      const validCheckpoints: LatLng[] = Array.isArray(route_history)
        ? route_history
            .filter((cp) => cp && cp.lat && cp.lng)
            .map((cp) => ({ lat: Number(cp.lat), lng: Number(cp.lng) }))
        : [];

      // Generate Route Polyline based on shipment type
      let fullRoutePath: LatLng[] = [];

      if (normalizedType === 'AIR' || normalizedType === 'SEA') {
        // Render curved great-circle arc for aviation and maritime transit
        if (validCheckpoints.length > 0) {
          const legs: LatLng[] = [resolvedOrigin, ...validCheckpoints, resolvedDest];
          for (let i = 0; i < legs.length - 1; i++) {
            const legArc = getGreatCircleArc(legs[i], legs[i + 1], Math.round(70 / (legs.length - 1)));
            fullRoutePath.push(...(i === 0 ? legArc : legArc.slice(1)));
          }
        } else {
          fullRoutePath = getGreatCircleArc(resolvedOrigin, resolvedDest, 70);
        }
      } else {
        // Render highway routes using OSRM for land transit
        try {
          fullRoutePath = await fetchOSRMRoute(resolvedOrigin, resolvedDest, validCheckpoints);
        } catch {
          fullRoutePath = [resolvedOrigin, ...validCheckpoints, resolvedDest];
        }
      }

      // Explicitly guarantee index 0 is resolvedOrigin and last index is resolvedDest
      if (fullRoutePath.length === 0) {
        fullRoutePath = [resolvedOrigin, resolvedDest];
      }
      if (fullRoutePath[0].lat !== resolvedOrigin.lat || fullRoutePath[0].lng !== resolvedOrigin.lng) {
        fullRoutePath.unshift(resolvedOrigin);
      }
      if (
        fullRoutePath[fullRoutePath.length - 1].lat !== resolvedDest.lat ||
        fullRoutePath[fullRoutePath.length - 1].lng !== resolvedDest.lng
      ) {
        fullRoutePath.push(resolvedDest);
      }

      if (!isMounted || !mapContainerRef.current) return;

      // Determine Cargo Position:
      // 1. If DELIVERED -> strict lock to destination coordinates
      // 2. If manual checkpoint or coordinates explicitly provided -> use explicit position
      // 3. Otherwise -> interpolate position dynamically based on elapsed time ratio along the route
      let effectiveCargoPos: LatLng;
      let isInterpolated = false;

      if (isDelivered) {
        effectiveCargoPos = resolvedDest;
      } else if (hasManualCheckpoints && current_lat && current_lng) {
        effectiveCargoPos = { lat: Number(current_lat), lng: Number(current_lng) };
      } else if (current_lat && current_lng && (Number(current_lat) !== resolvedOrigin.lat || Number(current_lng) !== resolvedOrigin.lng)) {
        effectiveCargoPos = { lat: Number(current_lat), lng: Number(current_lng) };
      } else {
        // Dynamic time-based coordinate interpolation
        effectiveCargoPos = interpolateAlongPath(fullRoutePath, timeProgressRatio);
        isInterpolated = true;
      }

      // Initialize Leaflet Map
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([effectiveCargoPos.lat, effectiveCargoPos.lng], 5);

      mapInstanceRef.current = map;

      // Tile layer
      const tileUrl =
        activeTileLayer === 'streets'
          ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
          : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      L.tileLayer(tileUrl, {
        maxZoom: 19,
        attribution: activeTileLayer === 'streets' ? '&copy; Esri' : '&copy; OpenStreetMap contributors',
      }).addTo(map);

      const allBoundsPoints: [number, number][] = [];

      // 1. Origin Marker
      const originCoord: [number, number] = [resolvedOrigin.lat, resolvedOrigin.lng];
      allBoundsPoints.push(originCoord);

      const originIcon = L.divIcon({
        className: 'custom-map-pin origin-pin',
        html: `
          <div class="flex flex-col items-center justify-end w-full h-full cursor-pointer select-none">
            <span class="bg-indigo-950/95 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap mb-1 border border-indigo-400/50">
              Origin
            </span>
            <div class="w-8 h-8 rounded-full bg-indigo-600 border-2 border-white shadow-xl flex items-center justify-center text-white shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18"/><path d="M19 21v-4"/><path d="M19 17h2v-4h-2"/><path d="M19 13h2v-4h-2"/><path d="M19 9h2V5h-2"/><path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"/><path d="M3 7V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg>
            </div>
            <div class="w-2 h-2 bg-indigo-600 rotate-45 -mt-1 border-r border-b border-white shrink-0"></div>
          </div>
        `,
        iconSize: [64, 64],
        iconAnchor: [32, 64],
      });

      const originMarker = L.marker(originCoord, { icon: originIcon }).addTo(map);
      originMarker.bindPopup(`
        <div class="text-xs p-1 font-sans">
          <span class="font-bold text-indigo-700 block uppercase tracking-wider text-[10px]">Departure Hub</span>
          <p class="font-bold text-slate-900 text-sm mt-0.5">${origin || 'Origin Facility'}</p>
          ${departure_time ? `<p class="text-[11px] text-slate-500 mt-1">Departed: ${new Date(departure_time).toLocaleString()}</p>` : ''}
          <p class="text-[10px] text-slate-400 font-mono mt-0.5">${resolvedOrigin.lat.toFixed(4)}, ${resolvedOrigin.lng.toFixed(4)}</p>
        </div>
      `);

      // 2. Intermediate Waypoints (if route_history exists)
      if (Array.isArray(route_history) && route_history.length > 0) {
        route_history.forEach((cp, index) => {
          if (cp.lat && cp.lng) {
            const cpCoord: [number, number] = [Number(cp.lat), Number(cp.lng)];
            allBoundsPoints.push(cpCoord);

            const cpIcon = L.divIcon({
              className: 'custom-map-pin checkpoint-pin',
              html: `
                <div class="w-6 h-6 rounded-full bg-white border-2 border-blue-600 shadow-md flex items-center justify-center text-blue-700 text-[10px] font-black cursor-pointer select-none">
                  ${index + 1}
                </div>
              `,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
            });

            const cpMarker = L.marker(cpCoord, { icon: cpIcon }).addTo(map);
            cpMarker.bindPopup(`
              <div class="text-xs p-1 font-sans">
                <span class="font-bold text-blue-600 block uppercase tracking-wider text-[10px]">Checkpoint #${index + 1}</span>
                <p class="font-bold text-slate-900 mt-0.5">${cp.location_name || 'Transit Hub'}</p>
                <p class="text-[11px] text-slate-600 mt-0.5">${cp.status || 'Scanned'}</p>
                ${cp.description ? `<p class="text-[10px] text-slate-500 italic mt-1">${cp.description}</p>` : ''}
                ${cp.timestamp ? `<p class="text-[10px] text-slate-400 font-mono mt-1">${new Date(cp.timestamp).toLocaleString()}</p>` : ''}
              </div>
            `);
          }
        });
      }

      // 3. Destination Marker
      const destCoord: [number, number] = [resolvedDest.lat, resolvedDest.lng];
      allBoundsPoints.push(destCoord);

      const destIcon = L.divIcon({
        className: 'custom-map-pin destination-pin',
        html: `
          <div class="flex flex-col items-center justify-end w-full h-full cursor-pointer select-none">
            <span class="bg-emerald-950/95 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap mb-1 border border-emerald-400/50">
              Destination
            </span>
            <div class="w-8 h-8 rounded-full bg-emerald-600 border-2 border-white shadow-xl flex items-center justify-center text-white shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div class="w-2 h-2 bg-emerald-600 rotate-45 -mt-1 border-r border-b border-white shrink-0"></div>
          </div>
        `,
        iconSize: [72, 64],
        iconAnchor: [36, 64],
      });

      const destMarker = L.marker(destCoord, { icon: destIcon }).addTo(map);
      destMarker.bindPopup(`
        <div class="text-xs p-1 font-sans">
          <span class="font-bold text-emerald-700 block uppercase tracking-wider text-[10px]">Delivery Destination</span>
          <p class="font-bold text-slate-900 text-sm mt-0.5">${destination || 'Delivery Address'}</p>
          ${estimated_arrival_time ? `<p class="text-[11px] text-slate-500 mt-1">Est. Arrival: ${new Date(estimated_arrival_time).toLocaleString()}</p>` : ''}
          <p class="text-[10px] text-slate-400 font-mono mt-0.5">${resolvedDest.lat.toFixed(4)}, ${resolvedDest.lng.toFixed(4)}</p>
        </div>
      `);

      // 4. Draw Polylines: Traversed vs Projected
      // Determine split index along fullRoutePath closest to effectiveCargoPos
      let closestIdx = 0;
      let minDistance = Infinity;

      fullRoutePath.forEach((pt, idx) => {
        const d = calculateDistance(pt.lat, pt.lng, effectiveCargoPos.lat, effectiveCargoPos.lng, 'km');
        if (d < minDistance) {
          minDistance = d;
          closestIdx = idx;
        }
      });

      // Construct continuous traversed line from true origin to cargo
      let traversedPoints: [number, number][] = [];
      if (isDelivered) {
        traversedPoints = fullRoutePath.map((p) => [p.lat, p.lng] as [number, number]);
      } else {
        traversedPoints = [
          [resolvedOrigin.lat, resolvedOrigin.lng],
          ...fullRoutePath.slice(1, closestIdx + 1).map((p) => [p.lat, p.lng] as [number, number]),
          [effectiveCargoPos.lat, effectiveCargoPos.lng],
        ];
      }

      // Strict validation: index 0 MUST BE resolvedOrigin
      if (
        traversedPoints.length > 0 &&
        (traversedPoints[0][0] !== resolvedOrigin.lat || traversedPoints[0][1] !== resolvedOrigin.lng)
      ) {
        traversedPoints.unshift([resolvedOrigin.lat, resolvedOrigin.lng]);
      }

      const remainingPoints: [number, number][] = isDelivered
        ? []
        : [
            [effectiveCargoPos.lat, effectiveCargoPos.lng],
            ...fullRoutePath.slice(closestIdx + 1).map((p) => [p.lat, p.lng] as [number, number]),
            [resolvedDest.lat, resolvedDest.lng],
          ];

      // Route styling theme based on shipment type
      const themeConfig = {
        AIR: {
          color: '#0284c7', // Sky-600
          glow: '#38bdf8',
          dash: '4, 8',
        },
        SEA: {
          color: '#0d9488', // Teal-600
          glow: '#2dd4bf',
          dash: '6, 8',
        },
        LAND: {
          color: '#2563eb', // Blue-600
          glow: '#60a5fa',
          dash: '6, 8',
        },
      }[normalizedType] || {
        color: '#2563eb',
        glow: '#60a5fa',
        dash: '6, 8',
      };

      // Draw Traversed Route (Solid with subtle glow)
      if (traversedPoints.length >= 2) {
        L.polyline(traversedPoints, {
          color: themeConfig.glow,
          weight: 7,
          opacity: 0.3,
          smoothFactor: 1,
        }).addTo(map);

        L.polyline(traversedPoints, {
          color: isDelivered ? '#10b981' : themeConfig.color,
          weight: 4,
          opacity: 0.9,
          smoothFactor: 1,
        }).addTo(map);
      }

      // Draw Remaining Route (Dashed projected path)
      if (!isDelivered && remainingPoints.length >= 2) {
        L.polyline(remainingPoints, {
          color: '#94a3b8',
          weight: 3,
          dashArray: themeConfig.dash,
          opacity: 0.75,
          smoothFactor: 1,
        }).addTo(map);
      }

      // 5. Cargo / Vehicle Marker (with appropriate dynamic icon)
      const cargoCoord: [number, number] = [effectiveCargoPos.lat, effectiveCargoPos.lng];
      allBoundsPoints.push(cargoCoord);

      // Compute heading bearing towards next point or destination
      const nextPoint = fullRoutePath[Math.min(closestIdx + 1, fullRoutePath.length - 1)] || resolvedDest;
      const heading = calculateBearing(effectiveCargoPos, nextPoint);

      const renderVehicleIconHtml = () => {
        if (isDelivered) {
          return `
            <div class="relative w-11 h-11 flex items-center justify-center">
              <span class="absolute w-full h-full rounded-full bg-emerald-400/40 animate-ping"></span>
              <div class="w-10 h-10 rounded-full bg-emerald-600 border-2 border-white shadow-2xl flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
              </div>
            </div>
          `;
        }

        if (normalizedType === 'AIR') {
          return `
            <div class="relative w-12 h-12 flex items-center justify-center">
              <span class="absolute w-full h-full rounded-full bg-sky-400/35 animate-ping"></span>
              <div class="relative w-11 h-11 rounded-full bg-sky-600 border-2 border-white shadow-2xl flex items-center justify-center text-white transition-transform duration-500" style="transform: rotate(${Math.round(heading)}deg);">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/></svg>
              </div>
            </div>
          `;
        }

        if (normalizedType === 'SEA') {
          return `
            <div class="relative w-12 h-12 flex items-center justify-center">
              <span class="absolute w-full h-full rounded-full bg-teal-400/35 animate-ping"></span>
              <div class="relative w-11 h-11 rounded-full bg-teal-600 border-2 border-white shadow-2xl flex items-center justify-center text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 21c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1 .6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.9.94 5.34 2.81 7.76"/><path d="M19 13V7a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v6"/><line x1="12" y1="2" x2="12" y2="10"/></svg>
              </div>
            </div>
          `;
        }

        // Default: LAND Truck
        return `
          <div class="relative w-12 h-12 flex items-center justify-center">
            <span class="absolute w-full h-full rounded-full bg-blue-500/35 animate-ping"></span>
            <div class="relative w-11 h-11 rounded-full bg-blue-600 border-2 border-white shadow-2xl flex items-center justify-center text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
            </div>
          </div>
        `;
      };

      const cargoIcon = L.divIcon({
        className: 'custom-map-pin cargo-pin',
        html: `
          <div class="flex flex-col items-center justify-center w-full h-full cursor-pointer select-none">
            <span class="${
              isDelivered ? 'bg-emerald-600' : 'bg-slate-900/95'
            } text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-xl whitespace-nowrap mb-1 border border-white/20 flex items-center gap-1.5 backdrop-blur-sm">
              <span class="w-1.5 h-1.5 rounded-full ${isDelivered ? 'bg-white' : 'bg-emerald-400'} animate-pulse"></span>
              <span>${isDelivered ? 'Delivered' : status}</span>
            </span>
            ${renderVehicleIconHtml()}
          </div>
        `,
        iconSize: [120, 80],
        iconAnchor: [60, 52],
      });

      const cargoMarker = L.marker(cargoCoord, { icon: cargoIcon, zIndexOffset: 1200 }).addTo(map);
      cargoMarker.bindPopup(`
        <div class="text-xs p-1.5 font-sans">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="w-2 h-2 rounded-full ${isDelivered ? 'bg-emerald-500' : 'bg-blue-600'} animate-ping"></span>
            <span class="font-extrabold ${isDelivered ? 'text-emerald-600' : 'text-blue-600'} uppercase tracking-wider text-[10px]">
              ${isDelivered ? 'Cargo Delivered' : `${normalizedType} Cargo Position`}
            </span>
          </div>
          <p class="font-extrabold text-slate-900 text-sm">${isDelivered ? destination : (current_location || 'En Route')}</p>
          <p class="text-[11px] text-slate-600 font-semibold mt-0.5">Status: <span class="text-blue-700">${status}</span></p>
          ${isInterpolated ? `<p class="text-[10px] text-sky-600 font-medium mt-0.5">⚡ Automated dynamic GPS interpolation: ~${Math.round(timeProgressRatio * 100)}% route completed</p>` : ''}
          <p class="text-[10px] text-slate-400 font-mono mt-1">${effectiveCargoPos.lat.toFixed(4)}, ${effectiveCargoPos.lng.toFixed(4)}</p>
        </div>
      `);

      // 6. Auto-fit bounds
      if (allBoundsPoints.length > 0) {
        const bounds = L.latLngBounds(allBoundsPoints);
        map.fitBounds(bounds, { padding: [55, 55], maxZoom: 13 });
      }

      setMapReady(true);
    }

    initializeMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    resolvedOrigin.lat,
    resolvedOrigin.lng,
    resolvedDest.lat,
    resolvedDest.lng,
    current_lat,
    current_lng,
    status,
    shipment_type,
    departure_time,
    estimated_arrival_time,
    route_history?.length,
    activeTileLayer,
  ]);

  // Handler to center on cargo
  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    const target = isDelivered ? resolvedDest : (current_lat && current_lng ? { lat: Number(current_lat), lng: Number(current_lng) } : resolvedOrigin);
    mapInstanceRef.current.flyTo([target.lat, target.lng], 9, { duration: 1.2 });
  };

  // Handler to fit all bounds
  const handleFitBounds = () => {
    if (!mapInstanceRef.current) return;
    import('leaflet').then((L) => {
      const allBoundsPoints: [number, number][] = [
        [resolvedOrigin.lat, resolvedOrigin.lng],
        [resolvedDest.lat, resolvedDest.lng],
      ];
      if (current_lat && current_lng) {
        allBoundsPoints.push([Number(current_lat), Number(current_lng)]);
      }
      mapInstanceRef.current.fitBounds(L.latLngBounds(allBoundsPoints), {
        padding: [50, 50],
        maxZoom: 13,
      });
    });
  };

  // Remaining straight-line distance
  const currentPosEstimate = isDelivered ? resolvedDest : (current_lat && current_lng ? { lat: Number(current_lat), lng: Number(current_lng) } : resolvedOrigin);
  const remainingDistance = isDelivered
    ? 0
    : calculateDistance(currentPosEstimate.lat, currentPosEstimate.lng, resolvedDest.lat, resolvedDest.lng, 'mi');

  return (
    <div className={`relative rounded-3xl overflow-hidden border border-slate-200/90 shadow-2xl bg-slate-900 ${className}`}>
      {/* HUD Floating Info Overlay (Top-Left) */}
      <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2 max-w-[85%] sm:max-w-md pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-700/60 shadow-2xl pointer-events-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
              normalizedType === 'AIR'
                ? 'bg-sky-600/20 border-sky-500/40 text-sky-400'
                : normalizedType === 'SEA'
                ? 'bg-teal-600/20 border-teal-500/40 text-teal-400'
                : 'bg-blue-600/20 border-blue-500/40 text-blue-400'
            }`}>
              {normalizedType === 'AIR' ? (
                <Plane className="w-5 h-5 animate-pulse" />
              ) : normalizedType === 'SEA' ? (
                <Ship className="w-5 h-5 animate-pulse" />
              ) : (
                <Truck className="w-5 h-5 animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-sky-400 font-mono">
                  {normalizedType} FREIGHT • {isDelivered ? 'DELIVERED' : `${Math.round(timeProgressRatio * 100)}% COMPLETE`}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-[260px]">
                {isDelivered ? destination : (current_location || 'En Route to Destination')}
              </h3>
            </div>
          </div>

          <div className="text-right border-l border-slate-800 pl-3 shrink-0">
            <span className="text-[9px] uppercase font-bold text-slate-400 block font-mono">Est. Remaining</span>
            <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono">
              {isDelivered ? '0 mi' : `~${remainingDistance} mi`}
            </span>
          </div>
        </div>
      </div>

      {/* Floating Map Controls (Top-Right) */}
      <div className="absolute top-4 right-4 z-[400] flex flex-col gap-2">
        <button
          onClick={handleRecenter}
          className="p-2.5 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-blue-600 shadow-lg border border-slate-200 transition-all active:scale-95 flex items-center justify-center cursor-pointer"
          title="Recenter on shipment location"
        >
          <Crosshair className="w-4 h-4" />
        </button>

        <button
          onClick={handleFitBounds}
          className="p-2.5 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-blue-600 shadow-lg border border-slate-200 transition-all active:scale-95 flex items-center justify-center cursor-pointer"
          title="Fit entire shipment route"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <button
          onClick={() => setActiveTileLayer((prev) => (prev === 'streets' ? 'osm' : 'streets'))}
          className="p-2.5 rounded-xl bg-white/95 hover:bg-white text-slate-700 hover:text-blue-600 shadow-lg border border-slate-200 transition-all active:scale-95 flex items-center justify-center cursor-pointer"
          title={`Switch map view (current: ${activeTileLayer === 'streets' ? 'World Street Map' : 'OpenStreetMap'})`}
        >
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Map Legend Overlay (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 z-[400] hidden sm:flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-900/85 backdrop-blur-md border border-slate-700/50 text-[11px] text-slate-200 shadow-lg pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
          <span>Origin</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${
            normalizedType === 'AIR' ? 'bg-sky-400' : normalizedType === 'SEA' ? 'bg-teal-400' : 'bg-blue-500'
          } animate-ping`}></span>
          <span className="font-semibold text-sky-300">
            {normalizedType === 'AIR' ? 'Great-Circle Flight' : normalizedType === 'SEA' ? 'Marine Corridor' : 'Highway Route'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Destination</span>
        </div>
      </div>

      {/* Map DOM Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-[380px] sm:h-[480px] bg-slate-950 z-[1]"
      />
    </div>
  );
}
