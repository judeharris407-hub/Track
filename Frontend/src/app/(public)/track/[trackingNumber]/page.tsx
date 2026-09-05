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
  Navigation,
  Phone,
  Mail,
  User,
  Building2,
} from 'lucide-react';
import api from '@/lib/api';
import socket from '@/lib/socket';
import TawkChat from '@/components/TawkChat';

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
  updated_at: string;
  events: ParcelEvent[];
}

export default function TrackingDetailsPage() {
  const params = useParams();
  const trackingNumber = params?.trackingNumber as string;

  const [parcel, setParcel] = useState<Parcel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    }
    if (s.includes('out for delivery')) {
      return <Navigation className="w-4 h-4 text-cyan-600" />;
    }
    if (s.includes('transit') || s.includes('departed')) {
      return <Truck className="w-4 h-4 text-blue-600" />;
    }
    if (s.includes('received') || s.includes('order')) {
      return <Package className="w-4 h-4 text-amber-500" />;
    }
    return <MapPin className="w-4 h-4 text-slate-400" />;
  };

  // Helper for status badge styling with animated pulse
  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('delivered')) {
      return {
        classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        icon: CheckCircle2,
      };
    }
    if (s.includes('out for delivery')) {
      return {
        classes: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        dot: 'bg-cyan-500',
        icon: Navigation,
      };
    }
    if (s.includes('transit')) {
      return {
        classes: 'bg-blue-50 text-blue-700 border-blue-200',
        dot: 'bg-blue-600',
        icon: Truck,
      };
    }
    return {
      classes: 'bg-amber-50 text-amber-700 border-amber-200',
      dot: 'bg-amber-500',
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
      {/* Top Action Buttons (Preserved) */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm hover:border-slate-300"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Tracking Search
        </Link>
        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchParcelDetails}
            className="p-2.5 sm:px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 transition-all border border-slate-200 hover:border-slate-300 shadow-sm flex items-center gap-2 text-xs font-semibold cursor-pointer"
            title="Refresh tracking data"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && (window as any).Tawk_API?.maximize) {
                (window as any).Tawk_API.maximize();
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-600/25 transition-all hover:scale-105 cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Ask Live Agent</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white p-16 rounded-3xl text-center border border-slate-200 shadow-sm">
          <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs text-slate-500 font-mono tracking-wider">Connecting to global logistics dispatch...</p>
        </div>
      ) : error ? (
        <div className="bg-white p-16 rounded-3xl text-center border border-rose-200 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 mx-auto mb-5">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Tracking Record Not Found</h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-8 leading-relaxed">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-lg shadow-blue-600/30"
          >
            Try Another Tracking Number
          </Link>
        </div>
      ) : parcel ? (
        <div className="space-y-8">
          {/* Main Status Header Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-slate-400 font-bold block mb-1">
                  Official Tracking Number
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold font-mono text-slate-900 flex items-center gap-3">
                  {parcel.tracking_number}
                </h1>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Pulsing Animated Status Badge */}
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border shadow-sm ${
                    statusInfo?.classes
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${statusInfo?.dot} animate-ping`} />
                  <StatusIcon className="w-4 h-4" />
                  <span>{parcel.status}</span>
                </div>
              </div>
            </div>

            {/* Visual Step Progress Bar */}
            <div className="mb-8 pt-2">
              <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-semibold mb-3">
                <span className={currentStep >= 1 ? 'text-blue-600' : 'text-slate-400'}>
                  1. Order Received
                </span>
                <span className={currentStep >= 2 ? 'text-blue-600' : 'text-slate-400'}>
                  2. In Transit
                </span>
                <span className={currentStep >= 3 ? 'text-cyan-600' : 'text-slate-400'}>
                  3. Out for Delivery
                </span>
                <span className={currentStep >= 4 ? 'text-emerald-600' : 'text-slate-400'}>
                  4. Delivered
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-500 transition-all duration-500"
                  style={{ width: `${(currentStep / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* Quick Status Highlights Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-8 text-left">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Origin</span>
                <span className="text-xs font-bold text-slate-800 truncate block mt-0.5">{parcel.origin}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Destination</span>
                <span className="text-xs font-bold text-slate-800 truncate block mt-0.5">{parcel.destination}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Node</span>
                <span className="text-xs font-bold text-blue-600 truncate block mt-0.5">
                  {parcel.current_location || 'In Transit'}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Est. Delivery</span>
                <span className="text-xs font-bold text-emerald-600 truncate block mt-0.5">
                  {parcel.estimated_delivery
                    ? new Date(parcel.estimated_delivery).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Scheduled on Time'}
                </span>
              </div>
            </div>

            {/* STRUCTURED SENDER & RECIPIENT INFORMATION CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {/* Sender Information Card */}
              <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200/80">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Sender Information</h3>
                    <span className="text-[11px] text-slate-500">Origin dispatch entity & contact</span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-start gap-2.5">
                    <User className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Name</span>
                      <span className="font-bold text-slate-900">{parcel.sender_name || '—'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Origin Address / Hub</span>
                      <span className="font-semibold text-slate-800">{parcel.origin || '—'}</span>
                    </div>
                  </div>

                  {parcel.sender_phone && (
                    <div className="flex items-start gap-2.5">
                      <Phone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] text-slate-400 font-medium block">Phone</span>
                        <span className="font-mono font-semibold text-slate-800">{parcel.sender_phone}</span>
                      </div>
                    </div>
                  )}

                  {parcel.sender_email && (
                    <div className="flex items-start gap-2.5">
                      <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] text-slate-400 font-medium block">Email</span>
                        <span className="font-mono font-semibold text-slate-800">{parcel.sender_email}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recipient Information Card */}
              <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200/80">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Recipient Information</h3>
                    <span className="text-[11px] text-slate-500">Customer destination & delivery details</span>
                  </div>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-start gap-2.5">
                    <User className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Name</span>
                      <span className="font-bold text-slate-900">{parcel.recipient_name || '—'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Destination Address</span>
                      <span className="font-semibold text-slate-800">{parcel.destination || '—'}</span>
                    </div>
                  </div>

                  {parcel.recipient_phone && (
                    <div className="flex items-start gap-2.5">
                      <Phone className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] text-slate-400 font-medium block">Phone</span>
                        <span className="font-mono font-semibold text-slate-800">{parcel.recipient_phone}</span>
                      </div>
                    </div>
                  )}

                  {parcel.recipient_email && (
                    <div className="flex items-start gap-2.5">
                      <Mail className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] text-slate-400 font-medium block">Email</span>
                        <span className="font-mono font-semibold text-slate-800">{parcel.recipient_email}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Polished Vertical Checkpoint Timeline */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/60">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-blue-600" />
                <span>Live Checkpoint Progress</span>
              </h2>
              <span className="text-xs font-mono text-blue-700 font-semibold px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200">
                {parcel.events?.length || 0} Milestones Logged
              </span>
            </div>

            {parcel.events && parcel.events.length > 0 ? (
              <div className="relative pl-6 sm:pl-8 border-l-2 border-slate-200 space-y-8 ml-3">
                {parcel.events.map((event, idx) => {
                  const isLatest = idx === 0;
                  return (
                    <div key={event.id || idx} className="relative group">
                      {/* Checkpoint Node Icon */}
                      <div
                        className={`absolute -left-[33px] sm:-left-[41px] top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isLatest
                            ? 'bg-blue-600 border-blue-400 ring-4 ring-blue-100 shadow-md'
                            : 'bg-white border-slate-300 group-hover:border-slate-400'
                        }`}
                      >
                        {getEventIcon(event.status, isLatest)}
                      </div>

                      {/* Checkpoint details card */}
                      <div
                        className={`p-5 rounded-2xl border transition-all ${
                          isLatest
                            ? 'bg-blue-50/40 border-blue-200 shadow-sm'
                            : 'bg-slate-50/50 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-900 text-sm">{event.status}</span>
                            {isLatest && (
                              <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 border border-blue-200">
                                Latest Checkpoint
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500 font-mono">
                            {new Date(event.created_at).toLocaleString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <div className="text-xs text-blue-700 font-semibold flex items-center gap-1.5 mb-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                          <span>{event.location}</span>
                        </div>
                        {event.description && (
                          <p className="text-xs text-slate-600 leading-relaxed">{event.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No checkpoint events logged yet.</p>
            )}
          </div>
        </div>
      ) : null}

      {/* Synchronize Tawk.to Live Chat with Current Parcel Details */}
      <TawkChat
        trackingNumber={parcel?.tracking_number || trackingNumber}
        customerName={parcel?.recipient_name}
      />
    </div>
  );
}
