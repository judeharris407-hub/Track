'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Clock,
  ArrowLeft,
  AlertCircle,
  Truck,
  MessageSquare,
  RotateCw,
  Calendar,
  CheckCircle2,
  Package,
  Building2,
  Send,
  Navigation,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import api from '@/lib/api';
import socket from '@/lib/socket';
import ChatWidget from '@/components/chat/ChatWidget';

interface ParcelEvent {
  id: number;
  status: string;
  location: string;
  description: string;
  created_at: string;
}

interface Parcel {
  id: number;
  tracking_number: string;
  sender_name: string;
  recipient_name: string;
  origin: string;
  destination: string;
  status: string;
  current_location: string;
  estimated_delivery: string | null;
  created_at: string;
  updated_at: string;
  events: ParcelEvent[];
}

export default function TrackingDetailsPage() {
  const params = useParams();
  const trackingNumber = params?.trackingNumber as string;

  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);

  const fetchParcelDetails = useCallback(async () => {
    if (!trackingNumber) return;
    setLoading(true);
    setError('');

    try {
      const response = await api.get(`/public/parcels/${encodeURIComponent(trackingNumber)}`);
      if (response.data?.success && response.data?.data) {
        setParcel(response.data.data);
      } else {
        setError('No tracking record found.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to retrieve tracking details.');
    } finally {
      setLoading(false);
    }
  }, [trackingNumber]);

  useEffect(() => {
    fetchParcelDetails();

    if (!trackingNumber) return;

    // Real-time tracking updates via socket
    socket.emit('subscribe_tracking', trackingNumber.toUpperCase());

    const handleTrackingUpdate = (updatedParcel: Parcel) => {
      if (updatedParcel.tracking_number?.toUpperCase() === trackingNumber.toUpperCase()) {
        setParcel(updatedParcel);
      }
    };

    socket.on('tracking_update', handleTrackingUpdate);

    return () => {
      socket.off('tracking_update', handleTrackingUpdate);
    };
  }, [trackingNumber, fetchParcelDetails]);

  // Helper for event status icon
  const getEventIcon = (statusStr: string, isLatest: boolean) => {
    const s = statusStr?.toLowerCase() || '';
    if (s.includes('delivered')) {
      return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    }
    if (s.includes('out for delivery')) {
      return <Navigation className="w-4 h-4 text-cyan-400" />;
    }
    if (s.includes('transit') || s.includes('departed')) {
      return <Truck className="w-4 h-4 text-indigo-400" />;
    }
    if (s.includes('received') || s.includes('order')) {
      return <Package className="w-4 h-4 text-amber-400" />;
    }
    return <MapPin className="w-4 h-4 text-slate-300" />;
  };

  // Helper for status badge styling with animated pulse
  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('delivered')) {
      return {
        classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10',
        dot: 'bg-emerald-400',
        icon: CheckCircle2,
      };
    }
    if (s.includes('out for delivery')) {
      return {
        classes: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-cyan-500/10',
        dot: 'bg-cyan-400',
        icon: Navigation,
      };
    }
    if (s.includes('transit')) {
      return {
        classes: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 shadow-indigo-500/10',
        dot: 'bg-indigo-400',
        icon: Truck,
      };
    }
    return {
      classes: 'bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-amber-500/10',
      dot: 'bg-amber-400',
      icon: Package,
    };
  };

  // Progress Stepper calculation
  const getProgressStep = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('delivered')) return 4;
    if (s.includes('out for delivery')) return 3;
    if (s.includes('transit')) return 2;
    return 1;
  };

  const currentStep = parcel ? getProgressStep(parcel.status) : 1;
  const statusInfo = parcel ? getStatusBadge(parcel.status) : null;
  const StatusIcon = statusInfo?.icon || Package;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors bg-slate-900/60 px-3.5 py-2 rounded-xl border border-slate-800"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tracking Search
        </Link>
        <button
          onClick={fetchParcelDetails}
          className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 transition-all border border-slate-800 hover:border-slate-700 flex items-center gap-2 text-xs font-semibold"
          title="Refresh tracking data"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Refresh Data</span>
        </button>
      </div>

      {loading ? (
        <div className="glass-card p-16 rounded-3xl text-center border border-slate-800">
          <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs text-slate-400 font-mono tracking-wider">Connecting to global logistics dispatch...</p>
        </div>
      ) : error ? (
        <div className="glass-card p-16 rounded-3xl text-center border-rose-500/20 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto mb-5">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Tracking Record Not Found</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30"
          >
            Try Another Tracking Number
          </Link>
        </div>
      ) : parcel ? (
        <div className="space-y-8">
          {/* Main Status Header Card */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl relative overflow-hidden border border-slate-800 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-6">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-slate-400 font-bold block mb-1">
                  Official Tracking Number
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold font-mono text-white flex items-center gap-3">
                  {parcel.tracking_number}
                </h1>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Pulsing Animated Status Badge */}
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border shadow-md ${
                    statusInfo?.classes
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${statusInfo?.dot} animate-ping`} />
                  <StatusIcon className="w-4 h-4" />
                  <span>{parcel.status}</span>
                </div>

                <button
                  onClick={() => setIsChatOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all hover:scale-105"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Ask Live Agent</span>
                </button>
              </div>
            </div>

            {/* Visual Step Progress Bar */}
            <div className="mb-8 pt-2">
              <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-semibold mb-3">
                <span className={currentStep >= 1 ? 'text-indigo-400' : 'text-slate-500'}>
                  1. Order Received
                </span>
                <span className={currentStep >= 2 ? 'text-indigo-400' : 'text-slate-500'}>
                  2. In Transit
                </span>
                <span className={currentStep >= 3 ? 'text-cyan-400' : 'text-slate-500'}>
                  3. Out for Delivery
                </span>
                <span className={currentStep >= 4 ? 'text-emerald-400' : 'text-slate-500'}>
                  4. Delivered
                </span>
              </div>
              <div className="w-full bg-slate-800/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-500"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* Key Information Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-left pt-2 border-t border-slate-800">
              <div>
                <span className="text-xs text-slate-500 font-medium block mb-1">Origin Hub</span>
                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-200">
                  <MapPin className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="truncate">{parcel.origin}</span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-0.5 truncate font-medium">
                  Sender: {parcel.sender_name}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-500 font-medium block mb-1">Destination</span>
                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-200">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">{parcel.destination}</span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-0.5 truncate font-medium">
                  Recipient: {parcel.recipient_name}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-500 font-medium block mb-1">Current Facility</span>
                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-200">
                  <Truck className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span className="truncate">{parcel.current_location || 'In Transit'}</span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-0.5 font-mono">
                  Sync: {new Date(parcel.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div>
                <span className="text-xs text-slate-500 font-medium block mb-1">Est. Delivery</span>
                <div className="flex items-center gap-1.5 text-sm font-bold text-slate-200">
                  <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">
                    {parcel.estimated_delivery
                      ? new Date(parcel.estimated_delivery).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'Pending Schedule'}
                  </span>
                </div>
                <span className="text-[11px] text-emerald-400 font-semibold block mt-0.5">
                  Guaranteed Dispatch
                </span>
              </div>
            </div>
          </div>

          {/* Polished Vertical Checkpoint Timeline */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-white flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-indigo-400" />
                <span>Live Checkpoint Progress</span>
              </h2>
              <span className="text-xs font-mono text-indigo-300 font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                {parcel.events?.length || 0} Milestones Logged
              </span>
            </div>

            {parcel.events && parcel.events.length > 0 ? (
              <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-700/80 space-y-8 ml-3">
                {parcel.events.map((event, idx) => {
                  const isLatest = idx === 0;
                  return (
                    <div key={event.id || idx} className="relative group">
                      {/* Checkpoint Node Icon */}
                      <div
                        className={`absolute -left-[33px] sm:-left-[41px] top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isLatest
                            ? 'bg-indigo-600 border-indigo-400 ring-4 ring-indigo-500/20 shadow-lg shadow-indigo-600/30'
                            : 'bg-slate-900 border-slate-700 group-hover:border-slate-500'
                        }`}
                      >
                        {getEventIcon(event.status, isLatest)}
                      </div>

                      {/* Checkpoint details card */}
                      <div
                        className={`p-5 rounded-2xl border transition-all ${
                          isLatest
                            ? 'bg-slate-900/90 border-indigo-500/40 shadow-lg shadow-indigo-950/40'
                            : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{event.status}</span>
                            {isLatest && (
                              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                                Latest Checkpoint
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 font-mono">
                            {new Date(event.created_at).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="text-xs text-indigo-300 font-semibold flex items-center gap-1.5 mb-1.5">
                          <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{event.location}</span>
                        </div>
                        {event.description && (
                          <p className="text-xs text-slate-400 leading-relaxed">{event.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No checkpoint events logged yet.</p>
            )}
          </div>
        </div>
      ) : null}

      {/* Embedded Live Chat Widget Bound to Current Tracking ID */}
      <ChatWidget trackingNumber={trackingNumber} defaultOpen={isChatOpen} />
    </div>
  );
}
