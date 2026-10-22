'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export interface AdminMapPickerProps {
  lat: number;
  lng: number;
  onCoordinatesChange: (lat: number, lng: number) => void;
  onMapInstance?: (map: L.Map) => void;
  zoom?: number;
  className?: string;
}

/**
 * Controller inside MapContainer to force Leaflet to recalculate
 * map container size as soon as modal finishes opening animation.
 */
export function MapResizeController({ onMapReady }: { onMapReady?: (map: L.Map) => void }) {
  const map = useMap();

  useEffect(() => {
    if (onMapReady) {
      onMapReady(map);
    }

    // Force Leaflet to recalculate map container size after modal open animation
    map.invalidateSize();

    const timer1 = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    const timer2 = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    const timer3 = setTimeout(() => {
      map.invalidateSize();
    }, 600);

    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      window.removeEventListener('resize', handleResize);
    };
  }, [map, onMapReady]);

  return null;
}

/**
 * Handles map click events to place coordinates
 */
function MapClickHandler({ onCoordinatesChange }: { onCoordinatesChange: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      const fixedLat = Number(e.latlng.lat.toFixed(5));
      const fixedLng = Number(e.latlng.lng.toFixed(5));
      onCoordinatesChange(fixedLat, fixedLng);
    },
  });
  return null;
}

/**
 * Flies to new coordinates when props change externally (e.g. from geocode search)
 */
function MapFlyToHandler({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const prevCoords = useRef({ lat, lng });

  useEffect(() => {
    if (prevCoords.current.lat !== lat || prevCoords.current.lng !== lng) {
      map.flyTo([lat, lng], Math.max(map.getZoom(), 11), { duration: 1 });
      prevCoords.current = { lat, lng };
    }
  }, [lat, lng, map]);

  return null;
}

export default function AdminMapPicker({
  lat,
  lng,
  onCoordinatesChange,
  onMapInstance,
  zoom = 10,
  className = '',
}: AdminMapPickerProps) {
  // Custom Draggable Pin
  const customIcon = useMemo(() => {
    return L.divIcon({
      className: 'custom-picker-pin',
      html: `
        <div class="flex flex-col items-center cursor-move" style="transform: translate(-50%, -100%);">
          <span class="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-indigo-300/40 mb-1 whitespace-nowrap">
            Drag to Fine-Tune
          </span>
          <div class="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-500 border-2 border-white shadow-xl flex items-center justify-center text-white">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div class="w-2 h-2 bg-indigo-600 rounded-full mt-0.5"></div>
        </div>
      `,
      iconSize: [36, 52],
      iconAnchor: [18, 52],
    });
  }, []);

  const markerEventHandlers = useMemo(
    () => ({
      dragend(e: any) {
        const marker = e.target;
        const position = marker.getLatLng();
        onCoordinatesChange(Number(position.lat.toFixed(5)), Number(position.lng.toFixed(5)));
      },
    }),
    [onCoordinatesChange]
  );

  return (
    <div
      className={`w-full h-full relative overflow-hidden ${className}`}
      style={{ minHeight: '380px', height: '100%', width: '100%' }}
    >
      <MapContainer
        center={[lat, lng]}
        zoom={zoom}
        zoomControl={true}
        style={{ height: '100%', width: '100%', minHeight: '380px' }}
        className="w-full h-full z-0"
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          maxZoom={19}
          subdomains="abcd"
        />

        {/* Modal Animation Resize Controller */}
        <MapResizeController onMapReady={onMapInstance} />

        {/* Map Click Event Handler */}
        <MapClickHandler onCoordinatesChange={onCoordinatesChange} />

        {/* External Prop Geocode FlyTo Handler */}
        <MapFlyToHandler lat={lat} lng={lng} />

        {/* Draggable Marker */}
        <Marker
          position={[lat, lng]}
          draggable={true}
          icon={customIcon}
          eventHandlers={markerEventHandlers}
        />
      </MapContainer>
    </div>
  );
}
