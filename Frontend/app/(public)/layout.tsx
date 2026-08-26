import Link from 'next/link';
import { Package, ShieldAlert, ChevronRight } from 'lucide-react';
import ChatWidget from '@/components/chat/ChatWidget';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900">
      {/* ShipNGo Enterprise Header Bar */}
      <header className="sticky top-0 w-full h-20 bg-white/95 backdrop-blur-md border-b border-gray-100 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">
              Ship<span className="text-blue-600">N</span>Go
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link href="/#services" className="hover:text-blue-600 transition-colors">
              Services
            </Link>
            <Link href="/#about" className="hover:text-blue-600 transition-colors">
              About
            </Link>
            <Link href="/#contact" className="hover:text-blue-600 transition-colors">
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
              href="/#track"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/25 transition-all hover:scale-105 active:scale-95"
            >
              <span>Track Package</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Public Body */}
      <main className="flex-1">{children}</main>

      {/* Reusable Live Support Chat Widget */}
      <ChatWidget />
    </div>
  );
}
