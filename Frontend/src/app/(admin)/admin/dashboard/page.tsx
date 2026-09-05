'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Plus,
  Search,
  Filter,
  RefreshCw,
  Truck,
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
} from 'lucide-react';
import api from '@/lib/api';
import socket from '@/lib/socket';

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
  destination: string;
  status: string;
  current_location: string;
  estimated_delivery: string | null;
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

  // Create Form State - Full Sender & Recipient Details
  const [newSenderName, setNewSenderName] = useState('');
  const [newSenderPhone, setNewSenderPhone] = useState('');
  const [newSenderEmail, setNewSenderEmail] = useState('');
  const [newOriginHub, setNewOriginHub] = useState('');

  const [newRecipientName, setNewRecipientName] = useState('');
  const [newRecipientPhone, setNewRecipientPhone] = useState('');
  const [newRecipientEmail, setNewRecipientEmail] = useState('');
  const [newDestinationAddress, setNewDestinationAddress] = useState('');

  const [newLocation, setNewLocation] = useState('');
  const [newEstimatedDelivery, setNewEstimatedDelivery] = useState('');
  const [newStatus, setNewStatus] = useState('Parcel Received');
  const [createLoading, setCreateLoading] = useState(false);

  // Update Status Form State
  const [updateStatusVal, setUpdateStatusVal] = useState('In Transit');
  const [updateLocationVal, setUpdateLocationVal] = useState('');
  const [updateDescriptionVal, setUpdateDescriptionVal] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);

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
      const response = await api.post('/admin/parcels', {
        sender_name: newSenderName,
        sender_phone: newSenderPhone,
        sender_email: newSenderEmail,
        origin_hub: newOriginHub,
        origin: newOriginHub,
        recipient_name: newRecipientName,
        recipient_phone: newRecipientPhone,
        recipient_email: newRecipientEmail,
        destination_address: newDestinationAddress,
        destination: newDestinationAddress,
        current_location: newLocation || newOriginHub,
        estimated_delivery: newEstimatedDelivery ? new Date(newEstimatedDelivery).toISOString() : null,
        status: newStatus,
      });

      if (response.data?.success) {
        setIsCreateModalOpen(false);
        // Reset form
        setNewSenderName('');
        setNewSenderPhone('');
        setNewSenderEmail('');
        setNewOriginHub('');
        setNewRecipientName('');
        setNewRecipientPhone('');
        setNewRecipientEmail('');
        setNewDestinationAddress('');
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
      });

      if (response.data?.success) {
        setIsUpdateModalOpen(false);
        setSelectedParcel(null);
        setUpdateLocationVal('');
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

  return (
    <div className="space-y-7">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-white">Shipment Management</h1>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
              Live Synchronized
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Monitor, register, and update package checkpoints with real-time customer broadcast
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchParcels}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Shipment</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Total Packages</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-white font-mono">{totalParcels}</span>
            <span className="text-[11px] text-slate-500 font-medium">All Records</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Active In Transit</span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-cyan-400 font-mono">{inTransitCount}</span>
            <span className="text-[11px] text-cyan-500/80 font-medium">En Route</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Successfully Delivered</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-400 font-mono">{deliveredCount}</span>
            <span className="text-[11px] text-emerald-500/80 font-medium">Completed</span>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Pending / Received</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-400 font-mono">{pendingCount}</span>
            <span className="text-[11px] text-amber-500/80 font-medium">At Hub</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="glass-card p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tracking, recipient, route..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/70 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
          />
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
                <th className="px-5 py-4">Route</th>
                <th className="px-5 py-4">Sender & Recipient</th>
                <th className="px-5 py-4">Current Hub</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Events</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
                    <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading real-time parcel data...</span>
                  </td>
                </tr>
              ) : filteredParcels.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-500">
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
                      <span className="text-slate-200 font-medium">{p.origin}</span>
                      <span className="text-slate-500 mx-1.5">&rarr;</span>
                      <span className="text-slate-200 font-medium">{p.destination}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-white">{p.recipient_name}</div>
                      <div className="text-[11px] text-slate-400">From: {p.sender_name}</div>
                    </td>
                    <td className="px-5 py-4 text-slate-400 font-medium">{p.current_location || '—'}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusBadge(
                          p.status
                        )}`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-400">{p.event_count || 1} checkpoints</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedParcel(p);
                          setUpdateStatusVal(p.status || 'In Transit');
                          setUpdateLocationVal(p.current_location || p.destination);
                          setIsUpdateModalOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600 text-indigo-300 hover:text-white font-bold text-xs transition-all border border-indigo-500/20 hover:border-indigo-500 shadow-sm cursor-pointer"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE PARCEL MODAL WITH STRUCTURED SENDER & RECIPIENT GROUPS */}
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
                  Enter complete sender, recipient, and routing parameters.
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
              {/* SENDER DETAILS GROUP */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3.5">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                  <Building2 className="w-4 h-4" />
                  <span>Sender Details</span>
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
                      Origin Address / Hub *
                    </label>
                    <input
                      type="text"
                      value={newOriginHub}
                      onChange={(e) => setNewOriginHub(e.target.value)}
                      placeholder="e.g. JFK Terminal 4, New York, NY"
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

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Sender Email
                    </label>
                    <input
                      type="email"
                      value={newSenderEmail}
                      onChange={(e) => setNewSenderEmail(e.target.value)}
                      placeholder="e.g. dispatch@apexlogistics.com"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* RECIPIENT DETAILS GROUP */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <User className="w-4 h-4" />
                  <span>Customer / Recipient Details</span>
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
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Destination Address *
                    </label>
                    <input
                      type="text"
                      value={newDestinationAddress}
                      onChange={(e) => setNewDestinationAddress(e.target.value)}
                      placeholder="e.g. 742 Evergreen Terrace, Springfield, OR"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500"
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
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Recipient Email
                    </label>
                    <input
                      type="email"
                      value={newRecipientEmail}
                      onChange={(e) => setNewRecipientEmail(e.target.value)}
                      placeholder="e.g. sarah.jenkins@example.com"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700/80 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* SHIPMENT LOGISTICS PARAMS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Current Facility Node
                  </label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="Optional (defaults to Origin)"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Initial Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-xs font-semibold focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="Parcel Received">Parcel Received</option>
                    <option value="In Transit">In Transit</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Estimated Delivery Date
                  </label>
                  <input
                    type="date"
                    value={newEstimatedDelivery}
                    onChange={(e) => setNewEstimatedDelivery(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500"
                  />
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
                  {createLoading ? 'Generating Tracking ID...' : 'Register Shipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
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

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Current Location / Hub Name
                </label>
                <input
                  type="text"
                  value={updateLocationVal}
                  onChange={(e) => setUpdateLocationVal(e.target.value)}
                  placeholder="e.g. Chicago Regional Sorting Facility, IL"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/70 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Milestone Details & Notes
                </label>
                <textarea
                  value={updateDescriptionVal}
                  onChange={(e) => setUpdateDescriptionVal(e.target.value)}
                  placeholder="e.g. Cleared customs and transferred to regional logistics carrier."
                  rows={3}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700/70 rounded-xl text-white text-xs focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUpdateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
                >
                  {updateLoading ? 'Broadcasting Event...' : 'Publish Checkpoint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
