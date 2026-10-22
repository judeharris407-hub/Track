'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Check, MapPin, Search, Compass, Navigation, Loader2 } from 'lucide-react';
import { CITY_COORDINATES } from '@/lib/geoUtils';
import { searchLocations, GeocodeResult } from '@/lib/geocoding';
import AdminMapPicker, { MapResizeController } from './AdminMapPicker';

export { MapResizeController };

interface MapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCoordinates: (lat: number, lng: number, suggestedLocation?: string) => void;
  initialLat?: number | null;
  initialLng?: number | null;
  title?: string;
  initialSearchQuery?: string;
}

export default function MapPickerModal({
  isOpen,
  onClose,
  onSelectCoordinates,
  initialLat,
  initialLng,
  title = 'Pick Coordinates on Map',
  initialSearchQuery = '',
}: MapPickerModalProps) {
  const mapInstanceRef = useRef<any>(null);

  const defaultLat = initialLat !== null && initialLat !== undefined ? Number(initialLat) : 39.8283;
  const defaultLng = initialLng !== null && initialLng !== undefined ? Number(initialLng) : -98.5795;

  const [selectedLat, setSelectedLat] = useState<number>(defaultLat);
  const [selectedLng, setSelectedLng] = useState<number>(defaultLng);
  const [locationName, setLocationName] = useState<string>('');

  // Geocoding search within modal
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResultsDropdown, setShowResultsDropdown] = useState(false);

  useEffect(() => {
    if (initialLat !== null && initialLat !== undefined) setSelectedLat(Number(initialLat));
    if (initialLng !== null && initialLng !== undefined) setSelectedLng(Number(initialLng));
    if (initialSearchQuery) setSearchQuery(initialSearchQuery);
  }, [initialLat, initialLng, initialSearchQuery]);

  // Handle Geocoding Search
  const handlePerformSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim() || searchQuery.trim().length < 2) return;

    setIsSearching(true);
    setShowResultsDropdown(true);
    try {
      const results = await searchLocations(searchQuery);
      setSearchResults(results);
    } catch (err) {
      console.error('Search locations error:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: GeocodeResult) => {
    setSelectedLat(result.lat);
    setSelectedLng(result.lng);
    setLocationName(result.display_name || result.name);
    setShowResultsDropdown(false);
    setSearchQuery(result.name || result.display_name);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([result.lat, result.lng], 12, { duration: 1.2 });
    }
  };

  const handleApplyPreset = (name: string, coords: { lat: number; lng: number }) => {
    setSelectedLat(coords.lat);
    setSelectedLng(coords.lng);
    setLocationName(`${name} Logistics Facility`);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([coords.lat, coords.lng], 10, { duration: 1.2 });
    }
  };

  const handleConfirm = () => {
    onSelectCoordinates(selectedLat, selectedLng, locationName);
    onClose();
  };

  if (!isOpen) return null;

  const popularPresets = [
    { name: 'Rotterdam Port', coords: { lat: 51.9244, lng: 4.4777 } },
    { name: 'New York (JFK)', coords: CITY_COORDINATES['jfk'] || CITY_COORDINATES['new york'] },
    { name: 'Chicago (ORD)', coords: CITY_COORDINATES['ord'] || CITY_COORDINATES['chicago'] },
    { name: 'Los Angeles (LAX)', coords: CITY_COORDINATES['lax'] || CITY_COORDINATES['los angeles'] },
    { name: 'San Francisco (SFO)', coords: CITY_COORDINATES['sfo'] || CITY_COORDINATES['san francisco'] },
    { name: 'London Heathrow (LHR)', coords: CITY_COORDINATES['heathrow'] || CITY_COORDINATES['london'] },
    { name: 'Frankfurt (FRA)', coords: CITY_COORDINATES['fra'] || CITY_COORDINATES['frankfurt'] },
    { name: 'Singapore Port', coords: { lat: 1.29027, lng: 103.851959 } },
    { name: 'Dubai Hub (DXB)', coords: CITY_COORDINATES['dxb'] || CITY_COORDINATES['dubai'] },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[94vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">{title}</h3>
              <p className="text-[11px] text-slate-400">Search address/port or click directly on the map to fine-tune</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Address Geocoding Search Bar Inside Modal */}
        <div className="p-3 bg-slate-950/90 border-b border-slate-800 relative z-20">
          <form onSubmit={handlePerformSearch} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.length >= 3) {
                    handlePerformSearch();
                  }
                }}
                placeholder="Search city, port, or address (e.g. Rotterdam Port, London LHR)..."
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              {isSearching && (
                <Loader2 className="w-4 h-4 text-indigo-400 animate-spin absolute right-3 top-2.5" />
              )}
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer flex items-center gap-1.5"
            >
              <span>Geocode</span>
            </button>
          </form>

          {/* Autocomplete / Search Results Dropdown */}
          {showResultsDropdown && searchResults.length > 0 && (
            <div className="absolute left-3 right-3 top-14 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto z-50">
              <div className="px-3 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 flex justify-between items-center">
                <span>Select Resolved Location</span>
                <button
                  type="button"
                  onClick={() => setShowResultsDropdown(false)}
                  className="text-slate-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              {searchResults.map((res, idx) => (
                <button
                  key={`${res.place_id || idx}`}
                  type="button"
                  onClick={() => handleSelectSearchResult(res)}
                  className="w-full text-left px-3.5 py-2 hover:bg-indigo-600/20 border-b border-slate-800/60 last:border-b-0 flex items-start justify-between gap-3 transition-colors cursor-pointer"
                >
                  <div className="truncate">
                    <p className="text-xs font-bold text-white truncate">{res.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{res.display_name}</p>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-400 shrink-0 mt-0.5">
                    {res.lat.toFixed(3)}, {res.lng.toFixed(3)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quick Hub Presets Bar */}
        <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] uppercase font-bold text-slate-500 shrink-0 font-mono">Hubs:</span>
          {popularPresets.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => handleApplyPreset(preset.name, preset.coords)}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-300 border border-slate-800 hover:border-indigo-500/40 transition-all shrink-0 cursor-pointer"
            >
              {preset.name}
            </button>
          ))}
        </div>

        {/* Map Container with Guaranteed Explicit Height & Leaflet Resize Controller */}
        <div className="relative flex-1 min-h-[380px] sm:min-h-[460px] h-[380px] sm:h-[460px] w-full bg-slate-950">
          <AdminMapPicker
            lat={selectedLat}
            lng={selectedLng}
            onCoordinatesChange={(newLat, newLng) => {
              setSelectedLat(newLat);
              setSelectedLng(newLng);
            }}
            onMapInstance={(map) => {
              mapInstanceRef.current = map;
            }}
            zoom={initialLat ? 11 : 4}
          />
        </div>

        {/* Coordinate Readout & Action Bar */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">LAT</span>
              <input
                type="number"
                step="0.0001"
                value={selectedLat}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) setSelectedLat(val);
                }}
                className="w-24 bg-transparent text-xs font-mono font-bold text-indigo-400 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">LNG</span>
              <input
                type="number"
                step="0.0001"
                value={selectedLng}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val)) setSelectedLng(val);
                }}
                className="w-24 bg-transparent text-xs font-mono font-bold text-indigo-400 outline-none"
              />
            </div>

            {locationName && (
              <span className="text-[11px] text-slate-400 font-medium truncate max-w-xs hidden md:inline-block">
                📍 {locationName}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Apply Selected Coordinates</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
