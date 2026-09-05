import Link from 'next/link';
import { ShieldAlert, Phone, Mail, MapPin } from 'lucide-react';
import SkyPrimeLogo from '@/components/SkyPrimeLogo';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* SkyPrime Logistics Header Bar */}
      <header className="sticky top-0 w-full h-20 bg-white/95 backdrop-blur-md border-b border-gray-100 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <SkyPrimeLogo className="h-11 w-auto" textColor="text-slate-900" subTextColor="text-blue-600" />
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link href="/services" className="hover:text-blue-600 transition-colors">
              Services
            </Link>
            <Link href="/about" className="hover:text-blue-600 transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-blue-600 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin/login"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:text-blue-600 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
              <span>Admin</span>
            </Link>
            <Link
              href="/#track-box"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/25 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Track Package</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Public Body */}
      <main className="flex-1">{children}</main>

      {/* Global Enterprise Dark Footer */}
      <footer className="bg-[#0B1120] text-slate-400 pt-16 pb-12 px-4 sm:px-6 lg:px-8 border-t border-slate-800 text-left">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
            {/* Brand Col */}
            <div className="lg:col-span-2 space-y-4">
              <Link href="/" className="inline-block">
                <SkyPrimeLogo className="h-11 w-auto" textColor="text-white" subTextColor="text-cyan-400" />
              </Link>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                Professional courier and global freight tracking solutions for businesses and individuals worldwide. Real-time GPS dispatching and 24/7 dedicated customer support.
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
                <span>100 Logistics Way, Suite 400, New York, NY 10001</span>
              </div>
            </div>

            {/* Services Col */}
            <div className="space-y-3">
              <h4 className="text-white text-sm font-bold">Services</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/services#express" className="hover:text-white transition-colors">Express Package Delivery</Link></li>
                <li><Link href="/services#lastmile" className="hover:text-white transition-colors">Fleet & Last-Mile Delivery</Link></li>
                <li><Link href="/services#freight" className="hover:text-white transition-colors">Air & Ocean Freight</Link></li>
                <li><Link href="/services#customs" className="hover:text-white transition-colors">Customs Clearance</Link></li>
                <li><Link href="/services#warehousing" className="hover:text-white transition-colors">Warehousing & Fulfillment</Link></li>
              </ul>
            </div>

            {/* Company Col */}
            <div className="space-y-3">
              <h4 className="text-white text-sm font-bold">Company</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/about#values" className="hover:text-white transition-colors">Our Core Values</Link></li>
                <li><Link href="/services" className="hover:text-white transition-colors">Carrier Network</Link></li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Contact Support</Link></li>
              </ul>
            </div>

            {/* Support Col */}
            <div className="space-y-3">
              <h4 className="text-white text-sm font-bold">Direct Support</h4>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  <a href="tel:+18005927447" className="hover:text-white font-mono">+1 (800) 592-7447</a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <a href="mailto:support@skyprimelogistics.com" className="hover:text-white font-mono">support@skyprimelogistics.com</a>
                </li>
                <li><Link href="/contact" className="hover:text-white transition-colors">Help Desk</Link></li>
                <li><Link href="/admin/login" className="text-blue-400 hover:text-blue-300 transition-colors font-semibold">Admin Portal</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>&copy; {new Date().getFullYear()} SkyPrime Logistics Inc. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/about" className="hover:text-slate-400 transition-colors">Privacy Policy</Link>
              <Link href="/about" className="hover:text-slate-400 transition-colors">Terms of Service</Link>
              <Link href="/contact" className="hover:text-slate-400 transition-colors">Security</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
