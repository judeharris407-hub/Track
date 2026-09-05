'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import SkyPrimeLogo from '@/components/SkyPrimeLogo';

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 w-full h-20 bg-white/95 backdrop-blur-md border-b border-gray-100 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <SkyPrimeLogo className="h-11 w-auto" textColor="text-slate-900" subTextColor="text-blue-700" />
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
  );
};

export default Navbar;
