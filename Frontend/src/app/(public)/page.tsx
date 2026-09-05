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
  Shield,
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
  ShieldCheck,
  Clock,
  Navigation,
  CheckCheck,
  HelpCircle,
  Building,
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
    <div className="min-h-screen bg-white">
      {/* 1. HERO SECTION (Deep Royal Blue) */}
      <section className="bg-[#1D4ED8] text-white pt-16 pb-24 sm:pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading & CTA */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 text-blue-100 text-xs font-semibold backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
              Trusted Global Freight & Logistics
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Looking for a trusted courier service that&apos;s quick, affordable, and dependable?
            </h1>
            <p className="text-blue-100 text-base sm:text-lg font-normal max-w-xl">
              Whether it&apos;s a small package, urgent document, or bulk commercial shipment &mdash; we provide real-time GPS telemetry and guaranteed delivery windows.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="#track"
                className="inline-block px-7 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm border border-blue-400/40 shadow-lg shadow-blue-900/30 transition-all hover:scale-105 active:scale-95"
              >
                Track Parcel Now
              </a>
              <Link
                href="/services"
                className="inline-block px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 transition-all"
              >
                Our Services
              </Link>
            </div>
          </div>

          {/* Right Column: Translucent Info Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="bg-[#1E3A8A]/60 border border-blue-400/30 p-8 rounded-3xl backdrop-blur-md max-w-md shadow-2xl text-left space-y-4">
              <div className="flex items-center gap-1 text-amber-300">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-300" />
                ))}
              </div>
              <p className="text-white text-base sm:text-lg leading-relaxed font-medium">
                &ldquo;We make sure it gets to the right place, at the right time, with real-time tracking and full peace of mind.&rdquo;
              </p>
              <div className="pt-2 border-t border-blue-400/30 flex items-center justify-between text-xs text-blue-200">
                <span>99.8% On-Time Guarantee</span>
                <span>180+ Global Ports</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DEDICATED TRACKING SEARCH SECTION (#track) */}
      <section id="track" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 relative z-20 mb-20 text-left">
        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black text-slate-900">Track Your Shipment</h2>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline-block">
              Fast live GPS telemetry lookup
            </span>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3.5 mb-5">
            <div className="relative flex-1">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number (e.g., TRK123456789)"
                className="w-full px-5 py-4 bg-slate-50 border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 rounded-2xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0 cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Track Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {error && <p className="text-xs text-rose-600 font-semibold mb-3">{error}</p>}

          {/* Quick-Pick Sample Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500">Quick Test:</span>
            {['TRK123456789', 'TRK987654321', 'TRK-1001'].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => setSampleTracking(sample)}
                className="px-3 py-1 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-mono text-xs font-semibold rounded-lg transition-all cursor-pointer"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. LOGISTICS SERVICES WITH IMAGES */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-left">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Our Services
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-3">
            Comprehensive Logistics Solutions
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            Tailored courier and freight management designed for speed, security, and global coverage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Express Delivery with Unsplash Image */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1000"
                  alt="Express Delivery Logistics Van"
                  width={800}
                  height={500}
                  unoptimized
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-blue-600 text-white text-[11px] font-bold shadow-md">
                  Express
                </div>
              </div>
              <div className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Express Package Delivery</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Fast and reliable point-to-point transport for documents, packages, and urgent consignments with same-day and next-day options.
                </p>
              </div>
            </div>
            <div className="p-6 pt-0">
              <Link
                href="/services#express"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                <span>Learn more</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 2: Fleet & Vehicle Tracking */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div>
              <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1580674684081-7617fbf3d745?q=80&w=1000"
                  alt="Smart Warehouse and Fleet Logistics"
                  width={800}
                  height={500}
                  unoptimized
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-md">
                  Warehousing
                </div>
              </div>
              <div className="p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Truck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Fleet & Warehouse Logistics</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Advanced telematics, temperature-controlled warehousing, and active vehicle GPS tracking for commercial fleets and retail pallets.
                </p>
              </div>
            </div>
            <div className="p-6 pt-0">
              <Link
                href="/services#warehousing"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700"
              >
                <span>Learn more</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Card 3: Smart Notifications & Global Shipping */}
          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div className="p-8 space-y-5 bg-gradient-to-br from-blue-50 to-indigo-50/40 h-full flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Smart Notifications & Telemetry</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Automated milestone updates triggered via WhatsApp, SMS, and email. Instant customs clearance and delivery confirmation for full transparency.
                </p>
                <div className="space-y-2 pt-2 text-xs text-slate-700 font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Real-time GPS scan updates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Instant arrival notifications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Digital proof of delivery</span>
                  </div>
                </div>
              </div>

              <Link
                href="/services"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 pt-4"
              >
                <span>View all services</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. "HOW IT WORKS" 4-STEP PROCESS SECTION (Subtle Light Cards) */}
      <section className="bg-slate-50 py-20 px-4 sm:px-6 lg:px-8 border-y border-slate-200/80 text-left">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-100/80 px-3 py-1 rounded-full">
              Seamless Workflow
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
              How It Works
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              From initial booking to verified doorstep handover, four effortless steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1: Book */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm space-y-3 relative hover:shadow-md transition-shadow">
              <span className="text-3xl font-black text-blue-600 font-mono block">01</span>
              <h3 className="text-lg font-bold text-slate-900">Book</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generate an instant transparent quote and schedule your package dispatch online.
              </p>
            </div>

            {/* Step 2: Pickup */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm space-y-3 relative hover:shadow-md transition-shadow">
              <span className="text-3xl font-black text-blue-600 font-mono block">02</span>
              <h3 className="text-lg font-bold text-slate-900">Pickup</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                A verified courier arrives at your location within the guaranteed dispatch window.
              </p>
            </div>

            {/* Step 3: Track */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm space-y-3 relative hover:shadow-md transition-shadow">
              <span className="text-3xl font-black text-blue-600 font-mono block">03</span>
              <h3 className="text-lg font-bold text-slate-900">Track</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Follow real-time GPS telemetry, hub scans, and milestone updates directly on your device.
              </p>
            </div>

            {/* Step 4: Delivered */}
            <div className="bg-white p-7 rounded-3xl border border-slate-200 shadow-sm space-y-3 relative hover:shadow-md transition-shadow">
              <span className="text-3xl font-black text-blue-600 font-mono block">04</span>
              <h3 className="text-lg font-bold text-slate-900">Delivered</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Safe delivery confirmed with digital signature proof and instant notification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. MULTI-CHANNEL 24/7 SUPPORT GRID */}
      <section id="contact" className="bg-[#1D4ED8] text-white py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-3">
            24/7 Multi-Channel Support
          </h2>
          <p className="text-blue-100 text-sm max-w-xl mx-auto mb-14">
            Connect instantly with our dedicated support agents via Live Web Chat, official WhatsApp, Telegram bot, or phone.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mb-12">
            {/* 1. Live Web Chat */}
            <button
              type="button"
              onClick={openTawkChat}
              className="bg-blue-800/60 border border-blue-400/30 p-6 rounded-3xl backdrop-blur-md flex flex-col justify-between space-y-4 hover:scale-105 transition-transform shadow-xl text-left cursor-pointer group"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-md">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">Live Web Chat</h4>
                <p className="text-blue-100 text-xs">Instant in-browser chat with live support agents.</p>
              </div>
              <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1 group-hover:underline">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Launch Live Chat &rarr;
              </span>
            </button>

            {/* 2. WhatsApp Support */}
            <a
              href="https://wa.me/237680650832?text=Hello%20ShipNGo%20Support,%20I%20need%20assistance%20with%20my%20shipment."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-800/50 border border-emerald-400/40 p-6 rounded-3xl backdrop-blur-md flex flex-col justify-between space-y-4 hover:scale-105 transition-transform shadow-xl group text-white text-left"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                  <Phone className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold flex items-center gap-1">
                  WhatsApp Support
                  <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                </h4>
                <p className="text-emerald-100 text-xs font-mono">+237 680 650 832</p>
              </div>
              <span className="text-[11px] font-bold text-emerald-300 group-hover:underline">
                Open WhatsApp &rarr;
              </span>
            </a>

            {/* 3. Telegram Bot */}
            <a
              href="https://t.me/ShipNGoSupportBot?start=support"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-sky-800/50 border border-sky-400/40 p-6 rounded-3xl backdrop-blur-md flex flex-col justify-between space-y-4 hover:scale-105 transition-transform shadow-xl group text-white text-left"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-md">
                  <SendHorizontal className="w-6 h-6 ml-0.5" />
                </div>
                <h4 className="text-sm font-bold flex items-center gap-1">
                  Telegram Bot
                  <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                </h4>
                <p className="text-sky-100 text-xs font-mono">@ShipNGoSupportBot</p>
              </div>
              <span className="text-[11px] font-bold text-sky-200 group-hover:underline">
                Open Telegram &rarr;
              </span>
            </a>

            {/* 4. Email Support */}
            <a
              href="mailto:support@shipngo.com"
              className="bg-blue-800/60 border border-blue-400/30 p-6 rounded-3xl backdrop-blur-md flex flex-col justify-between space-y-4 hover:scale-105 transition-transform shadow-xl group text-white text-left"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-md">
                  <Mail className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold">Email Support</h4>
                <p className="text-blue-100 text-xs font-mono">support@shipngo.com</p>
              </div>
              <span className="text-[11px] font-bold text-blue-200 group-hover:underline">
                Send Email &rarr;
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* 6. HIGH-CONTRAST BOTTOM CALL-TO-ACTION BANNER ("Ready to move your package?") */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8 text-center border-t border-slate-800">
        <div className="max-w-4xl mx-auto space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to move your package?
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto leading-relaxed">
            Get your shipment on the road with real-time GPS tracking and guaranteed delivery windows.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <a
              href="#track"
              className="px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              Track Shipment Now
            </a>
            <Link
              href="/contact"
              className="px-8 py-3.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-all hover:scale-105"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
