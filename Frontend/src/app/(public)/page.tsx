'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  Search,
  Package,
  Truck,
  Bell,
  Globe,
  ShieldCheck,
  Zap,
  Star,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Boxes,
  SendHorizontal,
  MessageSquare,
  ExternalLink,
  ChevronRight,
  Clock,
  Navigation,
  Building,
  Plane,
  Ship,
  Layers,
  Cpu,
  Shield,
} from 'lucide-react';

export default function PublicLandingPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      setError('Please enter a valid tracking number.');
      return;
    }
    setError('');
    router.push(`/track/${encodeURIComponent(trackingNumber.trim().toUpperCase())}`);
  };

  const setSampleTracking = (sampleId: string) => {
    setTrackingNumber(sampleId);
    setError('');
    router.push(`/track/${encodeURIComponent(sampleId)}`);
  };

  const openTawkChat = () => {
    if (typeof window !== 'undefined' && (window as any).Tawk_API?.maximize) {
      (window as any).Tawk_API.maximize();
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* 1. HERO SECTION (Deep Blue with Delivery Van Image & Overlaid Tracking Card) */}
      <section className="bg-[#1E40AF] text-white pt-14 pb-20 sm:pb-28 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column: Headline & Action Buttons */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/25 border border-blue-400/30 text-blue-100 text-xs font-semibold backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
              Autonomous Enterprise Freight & Logistics
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.12]">
              Move what matters, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-blue-200">
                on time, every time.
              </span>
            </h1>

            <p className="text-blue-100 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
              Precision line-haul courier services, real-time GPS telemetry, and automated milestone verification engineered to keep your supply chain moving seamlessly.
            </p>

            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <a
                href="#track-box"
                className="px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xl shadow-blue-900/40 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <span>Track a Shipment</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                href="/services"
                className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/25 transition-all"
              >
                Explore Services
              </Link>
            </div>

            {/* Verification Bullet Points */}
            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-blue-100 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-300" />
                99.8% On-Time Delivery
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-300" />
                Live GPS Scan Updates
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-300" />
                180+ Global Ports
              </span>
            </div>
          </div>

          {/* Right Column: Rounded Image Card with Delivery Van & Overlaid Floating Badge */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl overflow-hidden border border-blue-400/30 shadow-2xl group bg-slate-900">
              <div className="relative h-72 sm:h-80 w-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1000"
                  alt="Delivery van on highway logistics"
                  width={1000}
                  height={800}
                  unoptimized
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              </div>

              {/* Overlaid Floating "IN TRANSIT" Live Tracking Badge Card */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-slate-950/90 border border-blue-400/40 backdrop-blur-xl text-left shadow-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[11px] font-bold text-cyan-300 font-mono">
                      IN TRANSIT: Live Tracking Active
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-600/30 text-blue-200 text-[10px] font-bold font-mono border border-blue-400/30">
                    SHP-001234
                  </span>
                </div>

                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 h-full w-3/4 rounded-full" />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-300">
                  <span className="flex items-center gap-1 font-mono">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                    JFK Air Hub &rarr; London Hub
                  </span>
                  <span className="text-cyan-300 font-semibold font-mono">ETA: 04:30 PM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURE TICKER BAR */}
      <section className="py-4 bg-slate-900 text-slate-400 border-b border-slate-800 text-xs font-bold uppercase tracking-widest overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-center gap-8 sm:gap-14 opacity-80">
          <span>PARCEL</span>
          <span>•</span>
          <span>FREIGHT</span>
          <span>•</span>
          <span>COLD CHAIN</span>
          <span>•</span>
          <span>WAREHOUSING</span>
          <span>•</span>
          <span>CUSTOMS</span>
          <span>•</span>
          <span>SAME DAY</span>
        </div>
      </section>

      {/* 3. "WHERE'S YOUR SHIPMENT?" FLOATING SEARCH BOX */}
      <section id="track-box" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 mb-16 text-left">
        <div className="bg-white p-7 sm:p-9 rounded-3xl shadow-xl shadow-slate-200/90 border border-slate-200">
          <div className="mb-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
              Live Lookup
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">Where&apos;s your shipment?</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your tracking reference to view live waypoint scans and estimated arrival time.
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5 pointer-events-none" />
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number (e.g., TRK123456789)"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 placeholder-slate-400 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-7 py-3 rounded-xl font-bold text-xs bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Track</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {error && <p className="text-xs text-rose-600 font-semibold mb-2">{error}</p>}

          {/* Quick-Pick Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-400">Quick Test:</span>
            {['TRK123456789', 'TRK987654321', 'TRK-1001'].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => setSampleTracking(sample)}
                className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-mono text-xs font-semibold rounded-lg transition-all cursor-pointer"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 4. "SERVICES BUILT AROUND YOUR DELIVERY PROMISE" GRID */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Core Solutions
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-2">
              Services built around your delivery promise.
            </h2>
          </div>
          <Link
            href="/services"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group shrink-0"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Express Delivery */}
          <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Express Delivery</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Same-day and next-day point-to-point courier delivery with guaranteed transit windows and verified doorstep signatures.
              </p>
            </div>
            <Link href="/services#express" className="text-xs font-bold text-blue-600 flex items-center gap-1 pt-2">
              <span>Explore</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 2: Last-Mile */}
          <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Last-Mile Distribution</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Hyper-local residential and commercial routing with real-time driver tracking and automated delivery window alerts.
              </p>
            </div>
            <Link href="/services#lastmile" className="text-xs font-bold text-blue-600 flex items-center gap-1 pt-2">
              <span>Explore</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: Air & Sea Freight */}
          <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Plane className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Air Freight</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Full-charter and scheduled air cargo forwarding across 180+ global airport gateways with expedited customs boarding.
              </p>
            </div>
            <Link href="/services#freight" className="text-xs font-bold text-blue-600 flex items-center gap-1 pt-2">
              <span>Explore</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 4: Ocean Cargo */}
          <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Ship className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Sea Freight</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                High-capacity full-container (FCL) and consolidated (LCL) maritime transport across major international ocean trade lanes.
              </p>
            </div>
            <Link href="/services#freight" className="text-xs font-bold text-blue-600 flex items-center gap-1 pt-2">
              <span>Explore</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 5: Customs */}
          <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Customs Clearance</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Frictionless regulatory documentation, harmonized tariff code classification, and automated cross-border duty processing.
              </p>
            </div>
            <Link href="/services#customs" className="text-xs font-bold text-blue-600 flex items-center gap-1 pt-2">
              <span>Explore</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 6: Warehousing */}
          <div className="p-7 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Warehousing & Fulfillment</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Automated barcode inventory staging, pick-and-pack fulfillment, and climate-controlled regional storage centers.
              </p>
            </div>
            <Link href="/services#warehousing" className="text-xs font-bold text-blue-600 flex items-center gap-1 pt-2">
              <span>Explore</span> <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 5. "TECHNOLOGY & LOGISTICS" SECTION (Dark Navy Contrast Band) */}
      <section className="bg-[#0B132B] text-white py-20 px-4 sm:px-6 lg:px-8 text-left border-y border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Image of Warehouse Worker Holding Tablet */}
          <div className="lg:col-span-5">
            <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 group">
              <div className="relative h-80 sm:h-96 w-full">
                <Image
                  src="https://images.unsplash.com/photo-1580674684081-7617fbf3d745?q=80&w=1000"
                  alt="Warehouse operator with digital telemetry tablet"
                  width={1000}
                  height={800}
                  unoptimized
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
              </div>

              {/* Overlaid Badge */}
              <div className="absolute bottom-4 left-4 right-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800 backdrop-blur-md">
                <span className="text-xs font-bold text-cyan-300 block">Warehouse Telemetry Node</span>
                <span className="text-[11px] text-slate-400">Automated barcode pallet staging and live dispatch.</span>
              </div>
            </div>
          </div>

          {/* Right Column: "A logistics partner that behaves like technology" & 2x2 Feature Grid */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Technology-First Freight
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                A logistics partner that behaves like technology.
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl">
                We replace traditional friction-heavy freight brokers with automated dispatch algorithms, transparent GPS telemetry, and instant API integrations.
              </p>
            </div>

            {/* 2x2 Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-[#131F37] border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs">
                  01
                </div>
                <h4 className="text-sm font-bold text-white">Fast</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Automated dispatch algorithms match shipments to the nearest vehicle in seconds, cutting dwell time.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#131F37] border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  02
                </div>
                <h4 className="text-sm font-bold text-white">Reliable</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  99.8% on-time delivery track record with end-to-end cargo insurance and verified signatures.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#131F37] border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-600/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                  03
                </div>
                <h4 className="text-sm font-bold text-white">Connected</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Seamless GPS telemetry updates and instant WhatsApp/SMS milestone alert triggers.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[#131F37] border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                  04
                </div>
                <h4 className="text-sm font-bold text-white">Scalable</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Built to handle seasonal spikes effortlessly from 10 parcels to 50,000+ freight units.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. "FOUR STEPS FROM BOOKING TO DOORSTEP" (How It Works) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-b border-slate-200/80 text-left">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
              Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              Four steps from booking to doorstep
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <span className="text-3xl font-black text-blue-600 font-mono block">01</span>
              <h3 className="text-base font-bold text-slate-900">Book</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generate an instant transparent quote and book your parcel pickup online.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <span className="text-3xl font-black text-blue-600 font-mono block">02</span>
              <h3 className="text-base font-bold text-slate-900">Pickup</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                A verified courier arrives at your location within the guaranteed dispatch window.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <span className="text-3xl font-black text-blue-600 font-mono block">03</span>
              <h3 className="text-base font-bold text-slate-900">Track</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Follow real-time GPS telemetry, hub scans, and milestone updates directly.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <span className="text-3xl font-black text-blue-600 font-mono block">04</span>
              <h3 className="text-base font-bold text-slate-900">Delivered</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Safe delivery confirmed with digital signature proof and instant receipt.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. "HUBS, FLEETS & PEOPLE" BANNER (Background Image Overlay Section) */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 text-center text-white overflow-hidden">
        {/* Background Image with Dark Navy Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=1200"
            alt="Container terminal port at night"
            fill
            unoptimized
            className="object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-[#0B132B]/90" />
        </div>

        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 bg-blue-900/60 border border-blue-400/30 px-3.5 py-1.5 rounded-full">
            Global Operations Network
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Hubs, fleets and people, <br />
            working as one system.
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl mx-auto">
            From automated customs clearing to door-to-door temperature monitoring, ShipNGo gives you total visibility over every pallet and parcel.
          </p>
          <div className="pt-2">
            <Link
              href="/services"
              className="inline-block px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xl shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
            >
              Explore Operations
            </Link>
          </div>
        </div>
      </section>

      {/* 8. "LOGISTICS THAT GROW WITH YOUR BUSINESS" SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-left">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Scale With Confidence
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Logistics that grow with your business
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Whether you are an emerging e-commerce brand or an established enterprise, our infrastructure adapts to your order volume spikes.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Real-Time GPS Tracking</h4>
                  <p className="text-[11px] text-slate-500">Monitor vehicle telemetry live on the map with milestone alerts.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Trusted & Secured Deliveries</h4>
                  <p className="text-[11px] text-slate-500">Tamper-evident seals and digital recipient signature verification.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Affordable Transparent Pricing</h4>
                  <p className="text-[11px] text-slate-500">No hidden fuel surcharges or unexpected border handling fees.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image Card with Overlaid Floating Pill */}
          <div className="lg:col-span-6 relative">
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-xl group bg-slate-900">
              <div className="relative h-72 sm:h-80 w-full">
                <Image
                  src="https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?q=80&w=1000"
                  alt="Modern fulfillment facility logistics"
                  width={1000}
                  height={800}
                  unoptimized
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Overlaid Floating Status Pill */}
              <div className="absolute bottom-4 right-4 p-3.5 rounded-2xl bg-white/95 border border-slate-200 shadow-xl backdrop-blur-md flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <div>
                  <span className="text-[11px] font-bold text-slate-900 block font-mono">Fulfillment Staging Verified</span>
                  <span className="text-[10px] text-slate-500">Facility Node Scanned</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. "CONNECTED ACROSS PORTS, HUBS & ROADS" SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-left border-t border-slate-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text & Waypoint Indicator Tags */}
          <div className="lg:col-span-5 space-y-6">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Network
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Connected across ports, hubs and roads.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Our line-haul fleet and international carrier partners provide complete visibility from origin container loading to final-mile delivery.
            </p>

            {/* Route Indicator Tags */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="px-3 py-1 rounded-full bg-slate-900 text-white font-mono text-[11px] font-bold">
                Origin
              </span>
              <span className="text-slate-400">&rarr;</span>
              <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-mono text-[11px] font-bold">
                In Transit
              </span>
              <span className="text-slate-400">&rarr;</span>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-mono text-[11px] font-bold">
                Delivered
              </span>
            </div>

            <div className="pt-2">
              <Link
                href="/services"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group"
              >
                <span>See all locations</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Right Wide Aerial Image of Cargo Port */}
          <div className="lg:col-span-7">
            <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-xl group bg-slate-900">
              <div className="relative h-72 sm:h-80 w-full">
                <Image
                  src="https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=1000"
                  alt="Aerial view of illuminated cargo port"
                  width={1000}
                  height={800}
                  unoptimized
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 10. MULTI-CHANNEL SUPPORT SECTION */}
      <section id="contact" className="bg-[#1E40AF] text-white py-16 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-5xl mx-auto space-y-10">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              24/7 Multi-Channel Support
            </h2>
            <p className="text-blue-100 text-xs sm:text-sm max-w-xl mx-auto">
              Connect instantly with our dedicated support agents via Live Web Chat, official WhatsApp, Telegram bot, or phone.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {/* 1. Live Chat */}
            <button
              type="button"
              onClick={openTawkChat}
              className="bg-blue-800/60 border border-blue-400/30 p-5 rounded-2xl backdrop-blur-md flex flex-col justify-between space-y-3 hover:scale-105 transition-transform shadow-lg text-left cursor-pointer group"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-white text-blue-600 flex items-center justify-center shadow-md">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">Live Web Chat</h4>
                <p className="text-blue-100 text-[11px]">Instant in-browser chat with agents.</p>
              </div>
              <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1 group-hover:underline">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Launch Live Chat &rarr;
              </span>
            </button>

            {/* 2. WhatsApp */}
            <a
              href="https://wa.me/237680650832?text=Hello%20ShipNGo%20Support,%20I%20need%20assistance%20with%20my%20shipment."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-800/50 border border-emerald-400/40 p-5 rounded-2xl backdrop-blur-md flex flex-col justify-between space-y-3 hover:scale-105 transition-transform shadow-lg group text-white text-left"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
                  <Phone className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold flex items-center gap-1">
                  WhatsApp Support
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </h4>
                <p className="text-emerald-100 text-[11px] font-mono">+237 680 650 832</p>
              </div>
              <span className="text-[11px] font-bold text-emerald-300 group-hover:underline">
                Open WhatsApp &rarr;
              </span>
            </a>

            {/* 3. Telegram */}
            <a
              href="https://t.me/ShipNGoSupportBot?start=support"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-sky-800/50 border border-sky-400/40 p-5 rounded-2xl backdrop-blur-md flex flex-col justify-between space-y-3 hover:scale-105 transition-transform shadow-lg group text-white text-left"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-md">
                  <SendHorizontal className="w-5 h-5 ml-0.5" />
                </div>
                <h4 className="text-sm font-bold flex items-center gap-1">
                  Telegram Bot
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </h4>
                <p className="text-sky-100 text-[11px] font-mono">@ShipNGoSupportBot</p>
              </div>
              <span className="text-[11px] font-bold text-sky-200 group-hover:underline">
                Open Telegram &rarr;
              </span>
            </a>

            {/* 4. Email */}
            <a
              href="mailto:support@shipngo.com"
              className="bg-blue-800/60 border border-blue-400/30 p-5 rounded-2xl backdrop-blur-md flex flex-col justify-between space-y-3 hover:scale-105 transition-transform shadow-lg group text-white text-left"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-white text-blue-600 flex items-center justify-center shadow-md">
                  <Mail className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold">Email Support</h4>
                <p className="text-blue-100 text-[11px] font-mono">support@shipngo.com</p>
              </div>
              <span className="text-[11px] font-bold text-blue-200 group-hover:underline">
                Send Email &rarr;
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* 11. "READY TO MOVE?" BOTTOM CALL-TO-ACTION BANNER */}
      <section className="bg-[#0B132B] text-white py-16 px-4 sm:px-6 lg:px-8 text-center border-t border-slate-800">
        <div className="max-w-3xl mx-auto space-y-5">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to move?
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
            Get your shipment moving today with live GPS telemetry, dedicated support, and verified delivery.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <a
              href="#track-box"
              className="px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              Get Started
            </a>
            <Link
              href="/contact"
              className="px-7 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all hover:scale-105"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
