'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  Package,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Truck,
  Plane,
  Ship,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Calendar,
  X,
  Navigation,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  User,
  Phone,
  Mail,
  Building2,
  Compass,
  Crosshair,
} from 'lucide-react';
import api from '@/lib/api';
import socket from '@/lib/socket';
import AddressGeocodeInput from '@/components/AddressGeocodeInput';

const MapPickerModal = dynamic(() => import('@/components/MapPickerModal'), {
  ssr: false,
});

interface Parcel {
  id: number;
  tracking_number: string;
  sender_name: string;
  sender_phone?: string;
  sender_email?: string;
  recipient_name: string;
  recipient_phone?: string;
  recipient_email?: string;
  origin: string;
  origin_lat?: number | null;
  origin_lng?: number | null;
  destination: string;
  destination_lat?: number | null;
  destination_lng?: number | null;
  status: string;
  current_location: string;
  current_lat?: number | null;
  current_lng?: number | null;
  route_history?: any[];
  shipment_type?: string;
  departure_time?: string | null;
  estimated_arrival_time?: string | null;
  estimated_delivery: string | null;
  package_description?: string;
  created_at: string;
  event_count: number;
}

export default function AdminDashboardPage() {
  const [parcels, setParcels] = useState<Parcel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);

  // Map Picker State
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [mapPickerTarget, setMapPickerTarget] = useState<'checkpoint' | 'origin' | 'destination'>('checkpoint');
  const [mapPickerInitialSearch, setMapPickerInitialSearch] = useState('');

  // Create Form State - Full Sender & Recipient Details, Geocoding & Coordinates
  const [newSenderName, setNewSenderName] = useState('');
  const [newSenderPhone, setNewSenderPhone] = useState('');
  const [newSenderEmail, setNewSenderEmail] = useState('');
  const [newOriginHub, setNewOriginHub] = useState('');
  const [newOriginLat, setNewOriginLat] = useState('');
  const [newOriginLng, setNewOriginLng] = useState('');

  const [newRecipientName, setNewRecipientName] = useState('');
  const [newRecipientPhone, setNewRecipientPhone] = useState('');
  const [newRecipientEmail, setNewRecipientEmail] = useState('');
  const [newDestinationAddress, setNewDestinationAddress] = useState('');
  const [newDestLat, setNewDestLat] = useState('');
  const [newDestLng, setNewDestLng] = useState('');
  const [newPackageDescription, setNewPackageDescription] = useState('');

  const [newShipmentType, setNewShipmentType] = useState<'LAND' | 'AIR' | 'SEA'>('LAND');
  const [newDepartureTime, setNewDepartureTime] = useState(() => new Date().toISOString().slice(0, 16));
  const [newEstimatedArrival, setNewEstimatedArrival] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().slice(0, 16);
  });

  const [newLocation, setNewLocation] = useState('');
  const [newEstimatedDelivery, setNewEstimatedDelivery] = useState('');
  const [newStatus, setNewStatus] = useState('Parcel Received');
  const [createLoading, setCreateLoading] = useState(false);

  // Update Status Form State
  const [updateStatusVal, setUpdateStatusVal] = useState('In Transit');
  const [updateLocationVal, setUpdateLocationVal] = useState('');
  const [updateLatVal, setUpdateLatVal] = useState('');
  const [updateLngVal, setUpdateLngVal] = useState('');
  const [updateDescriptionVal, setUpdateDescriptionVal] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

  const openMapPicker = (target: 'checkpoint' | 'origin' | 'destination') => {
    setMapPickerTarget(target);
    if (target === 'origin') {
      setMapPickerInitialSearch(newOriginHub);
    } else if (target === 'destination') {
      setMapPickerInitialSearch(newDestinationAddress);
    } else {
      setMapPickerInitialSearch(updateLocationVal);
    }
    setIsMapPickerOpen(true);
  };

  const handleCoordinatesSelected = (lat: number, lng: number, suggestedName?: string) => {
    if (mapPickerTarget === 'checkpoint') {
      setUpdateLatVal(lat.toString());
      setUpdateLngVal(lng.toString());
      if (suggestedName && !updateLocationVal) {
        setUpdateLocationVal(suggestedName);
      }
    } else if (mapPickerTarget === 'origin') {
      setNewOriginLat(lat.toString());
      setNewOriginLng(lng.toString());
      if (suggestedName && !newOriginHub) {
        setNewOriginHub(suggestedName);
      }
    } else if (mapPickerTarget === 'destination') {
      setNewDestLat(lat.toString());
      setNewDestLng(lng.toString());
      if (suggestedName && !newDestinationAddress) {
        setNewDestinationAddress(suggestedName);
      }
    }
  };

  const openUpdateModal = (parcel: Parcel) => {
    setSelectedParcel(parcel);
    setUpdateStatusVal(parcel.status || 'In Transit');
    setUpdateLocationVal(parcel.current_location || parcel.destination);
    setUpdateLatVal(parcel.current_lat !== null && parcel.current_lat !== undefined ? parcel.current_lat.toString() : '');
    setUpdateLngVal(parcel.current_lng !== null && parcel.current_lng !== undefined ? parcel.current_lng.toString() : '');
    setUpdateDescriptionVal('');
    setIsUpdateModalOpen(true);
  };

  const fetchParcels = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/parcels?limit=100');
      if (response.data?.success) {
        setParcels(response.data.data.parcels || []);
      }
    } catch (err) {
      console.error('Failed to load parcels:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParcels();

    // Listen to real-time parcel creation/update socket events
    const handleParcelCreated = (newP: Parcel) => {
      setParcels((prev) => [newP, ...prev]);
    };

    const handleParcelUpdated = (updatedP: Parcel) => {
      setParcels((prev) =>
        prev.map((p) => (p.id === updatedP.id ? { ...p, ...updatedP } : p))
      );
    };

    socket.on('parcel_created', handleParcelCreated);
    socket.on('admin_parcel_updated', handleParcelUpdated);

    return () => {
      socket.off('parcel_created', handleParcelCreated);
      socket.off('admin_parcel_updated', handleParcelUpdated);
    };
  }, []);

  const handleCreateParcel = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const departureIso = newDepartureTime ? new Date(newDepartureTime).toISOString() : new Date().toISOString();
      const arrivalIso = newEstimatedArrival ? new Date(newEstimatedArrival).toISOString() : (newEstimatedDelivery ? new Date(newEstimatedDelivery).toISOString() : null);

      const response = await api.post('/admin/parcels', {
        sender_name: newSenderName,
        sender_phone: newSenderPhone,
        sender_email: newSenderEmail,
        origin_hub: newOriginHub,
        origin: newOriginHub,
        origin_lat: newOriginLat !== '' ? parseFloat(newOriginLat) : null,
        origin_lng: newOriginLng !== '' ? parseFloat(newOriginLng) : null,
        recipient_name: newRecipientName,
        recipient_phone: newRecipientPhone,
        recipient_email: newRecipientEmail,
        destination_address: newDestinationAddress,
        destination: newDestinationAddress,
        destination_lat: newDestLat !== '' ? parseFloat(newDestLat) : null,
        destination_lng: newDestLng !== '' ? parseFloat(newDestLng) : null,
        current_location: newLocation || newOriginHub,
        current_lat: newOriginLat !== '' ? parseFloat(newOriginLat) : null,
        current_lng: newOriginLng !== '' ? parseFloat(newOriginLng) : null,
        shipment_type: newShipmentType,
        departure_time: departureIso,
        estimated_arrival_time: arrivalIso,
        estimated_delivery: arrivalIso,
        package_description: newPackageDescription,
        status: newStatus,
      });

      if (response.data?.success) {
        setIsCreateModalOpen(false);
        // Reset form
        setNewSenderName('');
        setNewSenderPhone('');
        setNewSenderEmail('');
        setNewOriginHub('');
        setNewOriginLat('');
        setNewOriginLng('');
        setNewRecipientName('');
        setNewRecipientPhone('');
        setNewRecipientEmail('');
        setNewDestinationAddress('');
        setNewDestLat('');
        setNewDestLng('');
        setNewPackageDescription('');
        setNewLocation('');
        setNewEstimatedDelivery('');
        setNewStatus('Parcel Received');
        fetchParcels();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create parcel.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParcel) return;
    setUpdateLoading(true);

    try {
      const response = await api.put(`/admin/parcels/${selectedParcel.id}/status`, {
        status: updateStatusVal,
        location: updateLocationVal,
        description: updateDescriptionVal,
        lat: updateLatVal !== '' ? parseFloat(updateLatVal) : null,
        lng: updateLngVal !== '' ? parseFloat(updateLngVal) : null,
      });

      if (response.data?.success) {
        setIsUpdateModalOpen(false);
        setSelectedParcel(null);
        setUpdateLocationVal('');
        setUpdateLatVal('');
        setUpdateLngVal('');
        setUpdateDescriptionVal('');
        fetchParcels();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update parcel status.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const filteredParcels = parcels.filter((p) => {
    const matchesSearch =
      p.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.recipient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sender_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.destination.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' ||
      p.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Calculate KPIs
  const totalParcels = parcels.length;
  const inTransitCount = parcels.filter((p) => p.status?.toLowerCase().includes('transit')).length;
  const deliveredCount = parcels.filter((p) => p.status?.toLowerCase().includes('delivered')).length;
  const pendingCount = parcels.filter(
    (p) => p.status?.toLowerCase().includes('received') || p.status?.toLowerCase().includes('pending')
  ).length;

  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('delivered')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
    if (s.includes('transit') || s.includes('out for delivery')) {
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
    }
    return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  };

  const getShipmentTypeBadge = (type?: string) => {
    const t = (type || 'LAND').toUpperCase();
    if (t === 'AIR') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/30 font-mono">
          <Plane className="w-3 h-3" />
          <span>AIR</span>
        </span>
      );
    }
    if (t === 'SEA') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-400 border border-teal-500/30 font-mono">
          <Ship className="w-3 h-3" />
          <span>SEA</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono">
        <Truck className="w-3 h-3" />
        <span>LAND</span>
      </span>
    );
  };

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-indigo-500" />
            <span>Admin Logistics Dashboard</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time multi-modal dispatch monitoring, automatic geocoding, and checkpoint telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchParcels}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-all cursor-pointer"
            title="Refresh active fleet telemetry"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Shipment</span>
          </button>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Dispatched</span>
            <Package className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{totalParcels}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">Registered Shipments</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Active In Transit</span>
            <Truck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-blue-400">{inTransitCount}</div>
          <div className="text-[10px] text-blue-400/80 mt-1 font-mono">Air, Sea & Ground En Route</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Successfully Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{deliveredCount}</div>
          <div className="text-[10px] text-emerald-400/80 mt-1 font-mono">Final Destination Verified</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Origin Intake</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{pendingCount}</div>
          <div className="text-[10px] text-slate-500 mt-1 font-mono">Awaiting Departure Scan</div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search tracking #, name, city, or port..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-900 border border-slate-700/70 rounded-xl text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Parcel Received">Parcel Received</option>
            <option value="In Transit">In Transit</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      </div>

      {/* Parcels Table */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/90 text-slate-400 border-b border-slate-800 uppercase tracking-wider font-bold text-[11px]">
              <tr>
                <th className="px-5 py-4">Tracking Code</th>
                <th className="px-5 py-4">Mode</th>
                <th className="px-5 py-4">Route</th>
                <th className="px-5 py-4">Sender & Recipient</th>
                <th className="px-5 py-4">Current Hub / Telemetry</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Events</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading real-time parcel telemetry...</span>
                  </td>
                </tr>
              ) : filteredParcels.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-slate-500">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <span>No parcels found matching your criteria.</span>
                  </td>
                </tr>
              ) : (
                filteredParcels.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-white">
                      <Link
                        href={`/track/${p.tracking_number}`}
                        target="_blank"
                        className="hover:text-indigo-400 flex items-center gap-1.5 group"
                      >
                        <span>{p.tracking_number}</span>
                        <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      {getShipmentTypeBadge(p.shipment_type)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-slate-200 font-medium">{p.origin}</span>
                      <span className="text-slate-500 mx-1.5">&rarr;</span>
                      <span className="text-slate-200 font-medium">{p.destination}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{p.recipient_name}</div>
                      <div className="text-[11px] text-slate-400">From: {p.sender_name}</div>
                      {p.package_description && (
                        <div className="text-[10px] text-amber-400 font-medium truncate max-w-[200px] mt-0.5" title={p.package_description}>
                          📦 {p.package_description}
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-slate-300 font-medium">{p.current_location || '—'}</div>
                      {p.current_lat && p.current_lng ? (
                        <div className="text-[10px] text-indigo-400 font-mono flex items-center gap-1 mt-0.5">
                          <Compass className="w-3 h-3 text-indigo-400 shrink-0" />
                          <span>{Number(p.current_lat).toFixed(3)}, {Number(p.current_lng).toFixed(3)}</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-sky-400/80 italic block mt-0.5">⚡ Auto-Interpolated</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                          p.status
                        )}`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        <span>{p.status}</span>
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-400">
                      {p.event_count || 1} checkpoints
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => openUpdateModal(p)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 text-xs font-semibold transition-all hover:scale-105 cursor-pointer"
                      >
                        Update Checkpoint
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE PARCEL MODAL WITH AUTOMATED GEOCODING & ROUTE CONFIG */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="glass-card w-full max-w-2xl p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-400" />
                  <span>Register New Shipment</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automatic Nominatim address geocoding, multi-modal carrier selection, and GPS setup.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateParcel} className="space-y-6">
              {/* SHIPMENT MODE SELECTOR */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                <label className="block text-[11px] font-semibold text-slate-300">
                  Shipment Mode & Transit Channel *
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setNewShipmentType('LAND')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      newShipmentType === 'LAND'
                        ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-500/30'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Truck className="w-4 h-4" />
                    <span>LAND (Highway)</span>
                    <span className="text-[9px] font-normal opacity-80">OSRM Road Router</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewShipmentType('AIR')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      newShipmentType === 'AIR'
                        ? 'bg-sky-600 border-sky-400 text-white shadow-lg shadow-sky-600/30 ring-2 ring-sky-500/30'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Plane className="w-4 h-4" />
                    <span>AIR (Express)</span>
                    <span className="text-[9px] font-normal opacity-80">Great-Circle Arc</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewShipmentType('SEA')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      newShipmentType === 'SEA'
                        ? 'bg-teal-600 border-teal-400 text-white shadow-lg shadow-teal-600/30 ring-2 ring-teal-500/30'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Ship className="w-4 h-4" />
                    <span>SEA (Marine)</span>
                    <span className="text-[9px] font-normal opacity-80">Shipping Lanes</span>
                  </button>
                </div>
              </div>

              {/* SENDER & ORIGIN DETAILS WITH AUTO-GEOCODING */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3.5">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                  <Building2 className="w-4 h-4" />
                  <span>Origin Facility & Sender</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Sender Name / Entity *
                    </label>
                    <input
                      type="text"
                      value={newSenderName}
                      onChange={(e) => setNewSenderName(e.target.value)}
                      placeholder="e.g. Apex Global Logistics Hub"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Sender Phone
                    </label>
                    <input
                      type="text"
                      value={newSenderPhone}
                      onChange={(e) => setNewSenderPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 234-5678"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  {/* Automatic Origin Geocoding Address Input */}
                  <div className="sm:col-span-2">
                    <AddressGeocodeInput
                      label="Origin Address / Departure Hub *"
                      value={newOriginHub}
                      onChange={setNewOriginHub}
                      lat={newOriginLat}
                      lng={newOriginLng}
                      onCoordinatesChange={(lat, lng, name) => {
                        setNewOriginLat(lat.toString());
                        setNewOriginLng(lng.toString());
                        if (name && !newOriginHub) setNewOriginHub(name);
                      }}
                      onOpenMapPicker={() => openMapPicker('origin')}
                      placeholder="Type hub name or port (e.g. Rotterdam Port, JFK Terminal 4, NY)..."
                      required
                      theme="indigo"
                    />
                  </div>
                </div>
              </div>

              {/* RECIPIENT & DESTINATION DETAILS WITH AUTO-GEOCODING */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <User className="w-4 h-4" />
                  <span>Delivery Destination & Recipient</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Recipient Full Name *
                    </label>
                    <input
                      type="text"
                      value={newRecipientName}
                      onChange={(e) => setNewRecipientName(e.target.value)}
                      placeholder="e.g. Sarah Jenkins"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs focus:ring-1 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Recipient Phone
                    </label>
                    <input
                      type="text"
                      value={newRecipientPhone}
                      onChange={(e) => setNewRecipientPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 987-6543"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Recipient Email (Optional notification address)
                    </label>
                    <input
                      type="email"
                      value={newRecipientEmail}
                      onChange={(e) => setNewRecipientEmail(e.target.value)}
                      placeholder="e.g. sarah.jenkins@example.com"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Automatic Destination Geocoding Address Input */}
                  <div className="sm:col-span-2">
                    <AddressGeocodeInput
                      label="Destination Address / Port of Entry *"
                      value={newDestinationAddress}
                      onChange={setNewDestinationAddress}
                      lat={newDestLat}
                      lng={newDestLng}
                      onCoordinatesChange={(lat, lng, name) => {
                        setNewDestLat(lat.toString());
                        setNewDestLng(lng.toString());
                        if (name && !newDestinationAddress) setNewDestinationAddress(name);
                      }}
                      onOpenMapPicker={() => openMapPicker('destination')}
                      placeholder="Type destination address (e.g. 742 Evergreen Terrace, Springfield, OR)..."
                      required
                      theme="emerald"
                    />
                  </div>
                </div>
              </div>

              {/* PACKAGE SPECIFICATION & CONSIGNMENT DESCRIPTION */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3.5">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                  <Package className="w-4 h-4" />
                  <span>Consignment & Package Specification</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Brief Description of Package / Consignment
                  </label>
                  <textarea
                    rows={2}
                    value={newPackageDescription}
                    onChange={(e) => setNewPackageDescription(e.target.value)}
                    placeholder="e.g. 2x Sealed crates containing precision electronics, fragile cargo..."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs focus:ring-1 focus:ring-amber-500 resize-none placeholder:text-slate-600"
                  />
                  <span className="text-[10px] text-slate-500 block mt-1">
                    Brief summary of items or handling instructions displayed on the recipient tracking manifest.
                  </span>
                </div>
              </div>

              {/* TIMESTAMPS & SCHEDULE FOR TIME-BASED INTERPOLATION */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3.5">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-xs">
                  <Clock className="w-4 h-4" />
                  <span>Departure & Arrival Schedule (Automates Live GPS Interpolation)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Departure Timestamp
                    </label>
                    <input
                      type="datetime-local"
                      value={newDepartureTime}
                      onChange={(e) => setNewDepartureTime(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs font-mono focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Estimated Arrival Timestamp (ETA)
                    </label>
                    <input
                      type="datetime-local"
                      value={newEstimatedArrival}
                      onChange={(e) => setNewEstimatedArrival(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs font-mono focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  {createLoading ? 'Generating Tracking Telemetry...' : 'Register Shipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE CHECKPOINT MODAL WITH AUTO-GEOCODING */}
      {isUpdateModalOpen && selectedParcel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-card w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Log Checkpoint Milestone</h3>
                <span className="text-xs font-mono text-indigo-400 font-bold">
                  {selectedParcel.tracking_number}
                </span>
              </div>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {selectedParcel.package_description && (
              <div className="mb-4 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5 text-xs">
                <Package className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Manifest Cargo</span>
                  <span className="text-slate-200 font-medium">{selectedParcel.package_description}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Milestone Status
                </label>
                <select
                  value={updateStatusVal}
                  onChange={(e) => setUpdateStatusVal(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/70 rounded-xl text-white text-xs font-semibold focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Parcel Received">Parcel Received</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Out for Delivery">Out for Delivery</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Exception / Delayed">Exception / Delayed</option>
                </select>
              </div>

              {/* Automatic Checkpoint Geocoding Address Input */}
              <AddressGeocodeInput
                label="Current Location / Checkpoint Hub"
                value={updateLocationVal}
                onChange={setUpdateLocationVal}
                lat={updateLatVal}
                lng={updateLngVal}
                onCoordinatesChange={(lat, lng, name) => {
                  setUpdateLatVal(lat.toString());
                  setUpdateLngVal(lng.toString());
                  if (name && !updateLocationVal) setUpdateLocationVal(name);
                }}
                onOpenMapPicker={() => openMapPicker('checkpoint')}
                placeholder="e.g. Chicago Regional Sorting Facility, IL..."
                required
                theme="blue"
              />

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Description / Inspection Notes
                </label>
                <textarea
                  value={updateDescriptionVal}
                  onChange={(e) => setUpdateDescriptionVal(e.target.value)}
                  placeholder="Optional notes: customs clearance, sorting scan, loaded onto flight/vessel..."
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/70 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  {updateLoading ? 'Recording Checkpoint...' : 'Save & Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INTERACTIVE LEAFLET MAP PICKER MODAL WITH NOMINATIM SEARCH */}
      <MapPickerModal
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        onSelectCoordinates={handleCoordinatesSelected}
        initialLat={
          mapPickerTarget === 'checkpoint'
            ? (updateLatVal ? parseFloat(updateLatVal) : null)
            : mapPickerTarget === 'origin'
            ? (newOriginLat ? parseFloat(newOriginLat) : null)
            : (newDestLat ? parseFloat(newDestLat) : null)
        }
        initialLng={
          mapPickerTarget === 'checkpoint'
            ? (updateLngVal ? parseFloat(updateLngVal) : null)
            : mapPickerTarget === 'origin'
            ? (newOriginLng ? parseFloat(newOriginLng) : null)
            : (newDestLng ? parseFloat(newDestLng) : null)
        }
        title={
          mapPickerTarget === 'checkpoint'
            ? 'Fine-Tune Checkpoint Location'
            : mapPickerTarget === 'origin'
            ? 'Fine-Tune Origin Hub Coordinates'
            : 'Fine-Tune Delivery Destination Coordinates'
        }
        initialSearchQuery={mapPickerInitialSearch}
      />
    </div>
  );
}
