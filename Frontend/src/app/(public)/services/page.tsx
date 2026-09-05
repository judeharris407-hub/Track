'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  Zap,
  Truck,
  Bell,
  Globe,
  Building,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Clock,
  Package,
} from 'lucide-react';

export default function ServicesPage() {
  const servicesList = [
    {
      id: 'express',
      title: 'Express Package Delivery',
      tagline: 'Guaranteed same-day and next-day point-to-point courier speed',
      description:
        'Fast and dependable point-to-point transit for urgent documents, high-value electronics, and e-commerce parcels. Includes live driver telemetry and verified doorstep signatures.',
      features: [
        'Guaranteed delivery windows (Same-Day & Next-Day)',
        'Real-time GPS scan updates at every checkpoint',
        'Direct chain-of-custody signature verification',
        'Priority courier dispatch within 60 minutes',
      ],
      icon: Zap,
      badge: 'Fastest Speed',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=1000',
    },
    {
      id: 'fleet',
      title: 'Fleet & Vehicle Tracking',
      tagline: 'Live GPS monitoring and telematics for commercial vehicles',
      description:
        'Comprehensive line-haul fleet telematics providing real-time vehicle coordinates, driver route optimization, and milestone delivery notifications.',
      features: [
        'Live vehicle GPS mapping with 30-second refresh rates',
        'Automated geofencing and arrival alert triggers',
        'Fuel efficiency and route density optimization',
        'Fleet temperature monitoring for sensitive cargo',
      ],
      icon: Truck,
      badge: 'Fleet Telematics',
      image: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?q=80&w=1000',
    },
    {
      id: 'notifications',
      title: 'Smart Notifications & Telemetry',
      tagline: 'Automated multi-channel milestone alerts for senders & receivers',
      description:
        'Keep your customers informed at every stage with automated SMS, WhatsApp, and email notifications triggered upon dispatch, hub arrival, and delivery.',
      features: [
        'Automated WhatsApp, SMS, and Email alert triggers',
        'Customizable milestone status notifications',
        'Instant digital proof-of-delivery receipts with photos',
        'Customer satisfaction and recipient feedback collection',
      ],
      icon: Bell,
      badge: '24/7 Alerts',
    },
    {
      id: 'international',
      title: 'International Shipping & Freight',
      tagline: 'Worldwide air and ocean freight across 180+ global gateways',
      description:
        'Seamless cross-border freight forwarding connecting major international airports and maritime ports with integrated customs clearance and duty processing.',
      features: [
        'Full container (FCL) and consolidated (LCL) ocean freight',
        'Priority air freight chartering for urgent shipments',
        'Harmonized customs classification and brokerage',
        'Comprehensive marine and air cargo insurance',
      ],
      icon: Globe,
      badge: 'Global Coverage',
    },
    {
      id: 'warehousing',
      title: 'Smart Warehousing & Fulfillment',
      tagline: 'Modern automated inventory storage and regional staging',
      description:
        'Strategically positioned logistics hubs offering barcode inventory tracking, pick-and-pack fulfillment, and rapid regional dispatch.',
      features: [
        'Secure pallet staging with 24/7 security monitoring',
        'Same-day order picking, packing, and courier staging',
        'Live inventory reporting via administrative dashboard',
        'Climate-controlled storage zones for sensitive goods',
      ],
      icon: Building,
      badge: 'Fulfillment Hubs',
    },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 py-16 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100">
            Our Logistics Solutions
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Reliable services tailored for your shipping needs.
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            From local express courier parcel deliveries to worldwide air and ocean freight, SkyPrime Logistics delivers with precision, speed, and transparency.
          </p>
        </div>

        {/* Multi-Card Layout with Clean Brand Styling */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {servicesList.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.id}
                id={service.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {service.image ? (
                    <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                      <Image
                        src={service.image}
                        alt={service.title}
                        width={800}
                        height={500}
                        unoptimized
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-blue-600 text-white text-[11px] font-bold shadow-md">
                        {service.badge}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 pb-0 flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-100">
                        {service.badge}
                      </span>
                    </div>
                  )}

                  <div className="p-6 space-y-3">
                    {service.image && (
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                    )}
                    <h3 className="text-xl font-bold text-slate-900">{service.title}</h3>
                    <p className="text-xs font-semibold text-blue-600">{service.tagline}</p>
                    <p className="text-xs text-slate-600 leading-relaxed">{service.description}</p>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {service.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-700">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    href="/contact"
                    className="w-full py-2.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Request Rate Quote</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="bg-[#1D4ED8] rounded-3xl p-8 sm:p-12 text-white text-center space-y-5 shadow-xl">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
            Need custom enterprise shipping or bulk freight?
          </h3>
          <p className="text-blue-100 text-xs sm:text-sm max-w-xl mx-auto">
            Our enterprise logistics team provides dedicated account managers, scheduled pickups, and tiered volume discounts.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="px-7 py-3 rounded-xl bg-white hover:bg-slate-50 text-blue-600 font-bold text-xs shadow-lg transition-all"
            >
              Contact Enterprise Sales
            </Link>
            <Link
              href="/#track"
              className="px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-600 text-white font-bold text-xs border border-blue-400/40 transition-all"
            >
              Track Active Parcel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
