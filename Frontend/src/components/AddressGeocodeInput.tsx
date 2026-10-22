'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2, CheckCircle2, Crosshair, X } from 'lucide-react';
import { searchLocations, GeocodeResult } from '@/lib/geocoding';

interface AddressGeocodeInputProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  lat: string | number | null | undefined;
  lng: string | number | null | undefined;
  onCoordinatesChange: (lat: number, lng: number, locationName?: string) => void;
  onOpenMapPicker: () => void;
  placeholder?: string;
  required?: boolean;
  theme?: 'indigo' | 'emerald' | 'blue';
}

export default function AddressGeocodeInput({
  label,
  value,
  onChange,
  lat,
  lng,
  onCoordinatesChange,
  onOpenMapPicker,
  placeholder = 'e.g. Rotterdam Port, Netherlands',
  required = false,
  theme = 'indigo',
}: AddressGeocodeInputProps) {
  const [suggestions, setSuggestions] = useState<GeocodeResult[]>([]);
  const [isResolving, setIsResolving] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (queryText: string) => {
    if (!queryText || queryText.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setIsResolving(true);
    try {
      const results = await searchLocations(queryText);
      setSuggestions(results);
      setShowDropdown(results.length > 0);
    } catch (err) {
      console.error('Geocoding search failed:', err);
      setSuggestions([]);
    } finally {
      setIsResolving(false);
    }
  };

  const handleSelectSuggestion = (item: GeocodeResult) => {
    onChange(item.name || item.display_name);
    onCoordinatesChange(item.lat, item.lng, item.name || item.display_name);
    setShowDropdown(false);
  };

  const handleManualResolve = () => {
    handleSearch(value);
  };

  const hasCoords =
    lat !== null &&
    lat !== undefined &&
    lat !== '' &&
    lng !== null &&
    lng !== undefined &&
    lng !== '';

  const parsedLat = hasCoords ? Number(lat) : null;
  const parsedLng = hasCoords ? Number(lng) : null;

  const colorStyles = {
    indigo: {
      text: 'text-indigo-400',
      border: 'border-indigo-500/40',
      bgBadge: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
      ring: 'focus:ring-indigo-500',
      btn: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    },
    emerald: {
      text: 'text-emerald-400',
      border: 'border-emerald-500/40',
      bgBadge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
      ring: 'focus:ring-emerald-500',
      btn: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    },
    blue: {
      text: 'text-blue-400',
      border: 'border-blue-500/40',
      bgBadge: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
      ring: 'focus:ring-blue-500',
      btn: 'bg-blue-600 hover:bg-blue-500 text-white',
    },
  }[theme];

  return (
    <div ref={containerRef} className="space-y-1.5 relative">
      {/* Top Label & Action Row */}
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-semibold text-slate-300">
          {label} {required && <span className="text-rose-400">*</span>}
        </label>
        <button
          type="button"
          onClick={onOpenMapPicker}
          className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-lg border transition-all cursor-pointer ${colorStyles.bgBadge}`}
          title="Open interactive Leaflet map to inspect or adjust pin"
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>{hasCoords ? 'Fine-Tune on Map' : 'Pick on Map'}</span>
        </button>
      </div>

      {/* Input Group with Live Resolve */}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (e.target.value.length >= 3) {
              handleSearch(e.target.value);
            }
          }}
          placeholder={placeholder}
          required={required}
          className={`w-full pl-3.5 pr-20 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 ${colorStyles.ring}`}
        />

        <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
          {isResolving ? (
            <div className="px-2 py-1 text-slate-400 flex items-center">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            </div>
          ) : (
            <button
              type="button"
              onClick={handleManualResolve}
              className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Lookup GPS coordinates for typed address"
            >
              Resolve
            </button>
          )}
        </div>
      </div>

      {/* Instant Geocoding Autocomplete Dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-[68px] z-50 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden max-h-52 overflow-y-auto">
          <div className="px-3 py-1.5 bg-slate-950 text-[10px] uppercase font-bold text-slate-400 flex justify-between items-center border-b border-slate-800">
            <span>Nominatim Geocode Matches</span>
            <button
              type="button"
              onClick={() => setShowDropdown(false)}
              className="text-slate-500 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          {suggestions.map((item, idx) => (
            <button
              key={`${item.place_id || idx}`}
              type="button"
              onClick={() => handleSelectSuggestion(item)}
              className="w-full text-left px-3.5 py-2 hover:bg-slate-800 border-b border-slate-800/60 last:border-b-0 flex items-start justify-between gap-2.5 transition-colors cursor-pointer"
            >
              <div className="truncate">
                <p className="text-xs font-bold text-white truncate">{item.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{item.display_name}</p>
              </div>
              <span className="text-[10px] font-mono text-indigo-400 shrink-0 mt-0.5">
                {item.lat.toFixed(3)}, {item.lng.toFixed(3)}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Coordinate Status Readout Strip */}
      {hasCoords && (
        <div className="flex items-center justify-between text-[11px] font-mono px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            <span>GPS: {parsedLat?.toFixed(4)}, {parsedLng?.toFixed(4)}</span>
          </div>
          <span className="text-[10px] text-slate-500">Auto-Linked</span>
        </div>
      )}
    </div>
  );
}
