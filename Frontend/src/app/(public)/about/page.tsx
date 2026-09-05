'use client';

import Link from 'next/link';
import {
  Package,
  ShieldCheck,
  Zap,
  Globe2,
  Users,
  HeartHandshake,
  Leaf,
  Award,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 py-16 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100">
            About SkyPrime Logistics
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            A modern logistics company built for smart, reliable delivery.
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            We combine high-performance courier fleets, automated dispatch algorithms, and real-time GPS telemetry to deliver peace of mind for every shipment.
          </p>
        </div>

        {/* 2-Column Main Section: "Our Story" (Left) & "Our Core Values" (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Our Story */}
          <div className="lg:col-span-6 space-y-6 bg-slate-50 p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm">
            <div className="space-y-2 border-b border-slate-200 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Our Story
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Delivering Excellence Since Day One
              </h2>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <p>
                SkyPrime Logistics was founded to eliminate the uncertainty and delays that often plague parcel delivery and freight transportation. By focusing on real-time tracking, reliable transit times, and dedicated customer support, we established ourselves as a dependable logistics partner for individuals and growing businesses.
              </p>
              <p>
                From humble beginnings as an express urban courier, we expanded into multi-channel regional distribution, bonded warehousing, and international air and ocean cargo forwarding.
              </p>
              <p>
                Today, we process thousands of parcels daily across 180+ global gateways, backed by automated dispatching and verified digital proof-of-delivery systems.
              </p>
            </div>

            {/* Metrics Bar */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 text-center">
              <div className="p-3 bg-white rounded-2xl border border-slate-200">
                <span className="text-2xl font-black text-blue-600 block">99.8%</span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">On-Time Rate</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-200">
                <span className="text-2xl font-black text-blue-600 block">180+</span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Global Ports</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-slate-200">
                <span className="text-2xl font-black text-blue-600 block">24/7</span>
                <span className="text-[10px] text-slate-500 font-semibold uppercase">Live Support</span>
              </div>
            </div>
          </div>

          {/* Right Column: Our Core Values */}
          <div id="values" className="lg:col-span-6 space-y-6">
            <div className="space-y-2 border-b border-slate-200 pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                Our Core Values
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                What Guides Every Shipment
              </h2>
            </div>

            <div className="space-y-4">
              {/* Value 1 */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Customer Focus & Transparency</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    We prioritize open communication, accurate live GPS tracking updates, and 24/7 live assistance so you always know where your package is.
                  </p>
                </div>
              </div>

              {/* Value 2 */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Security & Integrity</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Verified chain-of-custody protocols, tamper-evident seals, and digital recipient signatures protect your cargo from pickup to doorstep.
                  </p>
                </div>
              </div>

              {/* Value 3 */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Speed & Reliability</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Optimized courier routing and express dispatch ensure strict adherence to agreed delivery windows without compromise.
                  </p>
                </div>
              </div>

              {/* Value 4 */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Leaf className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Eco-Conscious Logistics</h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Committed to reducing carbon footprints through fleet electrification and route density algorithms that minimize excess mileage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action Bar */}
        <div className="bg-[#1D4ED8] rounded-3xl p-8 sm:p-12 text-white text-center space-y-5 shadow-xl">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ready to partner with a modern logistics provider?
          </h3>
          <p className="text-blue-100 text-xs sm:text-sm max-w-xl mx-auto">
            Experience the difference of transparent, dependable parcel delivery with SkyPrime Logistics.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/#track"
              className="px-7 py-3 rounded-xl bg-white hover:bg-slate-50 text-blue-600 font-bold text-xs shadow-lg transition-all"
            >
              Track Package
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs border border-blue-400/40 transition-all"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
