'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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

  return (
    <div className="min-h-screen bg-white">
      {/* 1. HERO SECTION (Deep Royal Blue) */}
      <section className="bg-[#1D4ED8] text-white pt-16 pb-24 sm:pb-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading & CTA */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Looking for a trusted courier service that&apos;s quick, affordable, and dependable?
            </h1>
            <p className="text-blue-100 text-base sm:text-lg font-normal max-w-xl">
              Whether it&apos;s a small package, urgent document, or bulk shipment
            </p>
            <div className="pt-2">
              <a
                href="#track"
                className="inline-block px-7 py-3.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm border border-blue-400/40 shadow-lg shadow-blue-900/30 transition-all hover:scale-105 active:scale-95"
              >
                Track Parcel
              </a>
            </div>
          </div>

          {/* Right Column: Translucent Info Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="bg-[#1E3A8A]/60 border border-blue-400/30 p-8 rounded-3xl backdrop-blur-md max-w-md shadow-2xl">
              <p className="text-white text-base sm:text-lg leading-relaxed font-medium">
                We make sure it gets to the right place, at the right time, with real-time tracking and full peace of mind.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DEDICATED TRACKING SEARCH SECTION (#track) */}
      <section id="track" className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 relative z-20 mb-20">
        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-200/80 border border-slate-100">
          <h2 className="text-2xl font-black text-slate-900 mb-6">Track Your Shipment</h2>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3.5 mb-5">
            <div className="relative flex-1">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number (e.g., TRK123456789)"
                className="w-full px-5 py-4 bg-white border border-slate-300 rounded-2xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 rounded-2xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>Track Package</span>
            </button>
          </form>

          {error && <p className="text-xs text-rose-600 mb-4 font-semibold">{error}</p>}

          {/* Sample Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="text-slate-400 font-medium">Try these sample tracking numbers:</span>
            {['TRK123456789', 'TRK987654321', 'TRK-1001'].map((sample) => (
              <button
                key={sample}
                type="button"
                onClick={() => setSampleTracking(sample)}
                className="px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 font-mono text-[11px] font-semibold border border-slate-200 hover:border-blue-300 transition-all"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 3. ABOUT US SECTION */}
      <section id="about" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 text-center mb-16">
          About Us
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
          {/* Feature 1 */}
          <div className="flex items-start gap-4">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-2 shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1.5">Real-Time Tracking</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Monitor your shipment at all times with our live GPS tracking system and instant updates.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-start gap-4">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-2 shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1.5">Affordable & Transparent Pricing</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                No hidden fees. Get competitive rates with full transparency on all costs.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-start gap-4">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-2 shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1.5">Trusted & Secured Deliveries</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Your packages are fully insured and handled with care by our professional team.
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="flex items-start gap-4">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-2 shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1.5">Fast Online Booking</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Schedule pickups in just a few clicks – our user-friendly platform saves you time.
              </p>
            </div>
          </div>

          {/* Feature 5 */}
          <div className="flex items-start gap-4">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-2 shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1.5">Business & Personal Deliveries</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Whether you&apos;re sending documents, parcels, or bulk shipments, we&apos;ve got you covered.
              </p>
            </div>
          </div>

          {/* Feature 6 */}
          <div className="flex items-start gap-4">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-2 shrink-0" />
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-1.5">24/7 Customer Support</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Our dedicated support team is always available to assist you with any inquiries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. OUR TRACKING SERVICES SECTION */}
      <section id="services" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 text-center mb-16">
          Our Tracking Services
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Card 1: Package Tracking */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Package Tracking</h3>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-400" /> Real-time GPS location
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-400" /> Delivery status updates
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-400" /> Estimated delivery time
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-400" /> Multiple carrier support
              </li>
            </ul>
          </div>

          {/* Card 2: Vehicle Tracking */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Vehicle Tracking</h3>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-400" /> Live vehicle location
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-400" /> Route optimization
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-400" /> Fleet management
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-400" /> Insurance approved trackers
              </li>
            </ul>
          </div>

          {/* Card 3: Smart Notifications */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Smart Notifications</h3>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-400" /> SMS & email alerts
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-400" /> Delivery confirmations
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-400" /> Delay notifications
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-400" /> Custom alert settings
              </li>
            </ul>
          </div>

          {/* Card 4: International Shipping */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">International Shipping</h3>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-400" /> Air freight tracking
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-400" /> Sea freight monitoring
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-400" /> Customs clearance updates
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-400" /> Multi-country support
              </li>
            </ul>
          </div>

          {/* Card 5: Secure Tracking */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Secure Tracking</h3>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-400" /> End-to-end encryption
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-400" /> Data privacy compliance
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-400" /> Secure API access
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-400" /> 24/7 monitoring
              </li>
            </ul>
          </div>

          {/* Card 6: Express Delivery */}
          <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-4">Express Delivery</h3>
            <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-400" /> Priority tracking
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-400" /> Same-day delivery options
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-400" /> Time-definite services
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-slate-400" /> Signature confirmation
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS SECTION */}
      <section className="bg-slate-50 py-20 px-4 sm:px-6 lg:px-8 border-y border-slate-100">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 text-center mb-16">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            {/* Step 1 */}
            <div className="space-y-4">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center font-extrabold text-xl mx-auto shadow-lg shadow-blue-600/30">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900">Enter Tracking Number</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-xs mx-auto">
                Input your unique tracking number provided by the carrier or shipping company.
              </p>
            </div>

            {/* Step 2 */}
            <div className="space-y-4">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center font-extrabold text-xl mx-auto shadow-lg shadow-blue-600/30">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900">View Real-Time Status</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-xs mx-auto">
                Access detailed tracking information with live updates on your shipment&apos;s current location.
              </p>
            </div>

            {/* Step 3 */}
            <div className="space-y-4">
              <div className="w-14 h-14 bg-blue-600 text-white rounded-full flex items-center justify-center font-extrabold text-xl mx-auto shadow-lg shadow-blue-600/30">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900">Get Notified</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-xs mx-auto">
                Receive automatic updates and notifications about your delivery status and estimated arrival.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WHAT OUR CUSTOMERS SAY (Testimonials) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 text-center mb-16">
            What Our Customers Say
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Review 1 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-6">
              <div>
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed italic">
                  &ldquo;Excellent tracking service! I can always see exactly where my packages are. The real-time updates are incredibly accurate.&rdquo;
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Sarah Johnson</h4>
                <p className="text-slate-500 text-xs">E-commerce Business Owner</p>
              </div>
            </div>

            {/* Review 2 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-6">
              <div>
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed italic">
                  &ldquo;The vehicle tracking feature has transformed our fleet management. We&apos;ve improved delivery times by 30%.&rdquo;
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Michael Chen</h4>
                <p className="text-slate-500 text-xs">Logistics Manager</p>
              </div>
            </div>

            {/* Review 3 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-6">
              <div>
                <div className="flex gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed italic">
                  &ldquo;Simple, reliable, and professional. The notifications keep me informed without being overwhelming. Highly recommend!&rdquo;
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Emily Rodriguez</h4>
                <p className="text-slate-500 text-xs">Small Business Owner</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. MULTI-CHANNEL CUSTOMER SUPPORT SECTION */}
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
            <div className="bg-blue-800/60 border border-blue-400/30 p-6 rounded-3xl backdrop-blur-md flex flex-col justify-between space-y-4 hover:scale-105 transition-transform shadow-xl">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-white text-blue-600 flex items-center justify-center mx-auto shadow-md">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold">Live Web Chat</h4>
                <p className="text-blue-100 text-xs">Instant in-browser chat with support agents.</p>
              </div>
              <span className="text-[11px] font-semibold text-emerald-300 flex items-center justify-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Available 24/7
              </span>
            </div>

            {/* 2. WhatsApp Support */}
            <a
              href="https://wa.me/14155238886?text=Hello%20ShipNGo%20Support,%20I%20need%20assistance%20with%20my%20shipment."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-800/50 border border-emerald-400/40 p-6 rounded-3xl backdrop-blur-md flex flex-col justify-between space-y-4 hover:scale-105 transition-transform shadow-xl group text-white"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                  <Phone className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold flex items-center justify-center gap-1">
                  WhatsApp Support
                  <ExternalLink className="w-3 h-3 opacity-70 group-hover:opacity-100" />
                </h4>
                <p className="text-emerald-100 text-xs font-mono">+1 (415) 523-8886</p>
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
              className="bg-sky-800/50 border border-sky-400/40 p-6 rounded-3xl backdrop-blur-md flex flex-col justify-between space-y-4 hover:scale-105 transition-transform shadow-xl group text-white"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-sky-500 text-white flex items-center justify-center mx-auto shadow-md">
                  <SendHorizontal className="w-6 h-6 ml-0.5" />
                </div>
                <h4 className="text-sm font-bold flex items-center justify-center gap-1">
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
              className="bg-blue-800/60 border border-blue-400/30 p-6 rounded-3xl backdrop-blur-md flex flex-col justify-between space-y-4 hover:scale-105 transition-transform shadow-xl group text-white"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-full bg-white text-blue-600 flex items-center justify-center mx-auto shadow-md">
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

          <a
            href="#track"
            className="inline-block px-9 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-blue-600 font-bold text-sm shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            Track Your Package
          </a>
        </div>
      </section>

      {/* 8. ENTERPRISE FOOTER */}
      <footer className="bg-[#0B1120] text-slate-400 pt-16 pb-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800 text-left">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
            {/* Brand Col */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                  <Package className="w-4 h-4" />
                </div>
                <span className="text-xl font-bold text-white tracking-tight">ShipNGo</span>
              </div>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Professional tracking solutions for businesses and individuals worldwide. Real-time GPS dispatching and 24/7 dedicated logistics.
              </p>
            </div>

            {/* Services Col */}
            <div className="space-y-3">
              <h4 className="text-white text-sm font-bold">Services</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#services" className="hover:text-white transition-colors">Package Tracking</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Vehicle Tracking</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Fleet Management</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">International Shipping</a></li>
              </ul>
            </div>

            {/* Company Col */}
            <div className="space-y-3">
              <h4 className="text-white text-sm font-bold">Company</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">Our Team</a></li>
                <li><a href="#about" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Support Col */}
            <div className="space-y-3">
              <h4 className="text-white text-sm font-bold">Support</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#contact" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">FAQ</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 text-center text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} ShipNGo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
