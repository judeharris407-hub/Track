'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  LayoutDashboard,
  MessageSquare,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { AuthProvider, useAuth } from '@/lib/authContext';

function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  useEffect(() => {
    // If on login page, don't redirect
    if (pathname === '/admin/login') return;

    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [pathname, isAuthenticated, isLoading, router]);

  // Render clean layout without sidebar on login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#080c14]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xs text-slate-400 font-mono">Verifying enterprise credentials...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    {
      label: 'Shipment Management',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Agent Live Chat Desk',
      href: '/admin/chat',
      icon: MessageSquare,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#080c14]">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950/90 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          {/* Brand */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <Link href="/admin/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-sm text-white block">TrackPulse</span>
                <span className="text-[10px] text-indigo-400 font-mono tracking-wider uppercase font-semibold">
                  Admin Platform
                </span>
              </div>
            </Link>
          </div>

          {/* Nav Links */}
          <nav className="p-3 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile & footer actions */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-slate-300 transition-all border border-white/5"
          >
            <span>Public Tracking Portal</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          {user && (
            <div className="flex items-center gap-2.5 px-2 py-1.5 bg-slate-900/60 rounded-xl border border-white/5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold text-xs">
                {user.name ? user.name[0].toUpperCase() : 'A'}
              </div>
              <div className="flex-1 min-w-0 truncate">
                <span className="text-xs font-semibold text-white block truncate">{user.name}</span>
                <span className="text-[10px] text-slate-400 block truncate capitalize">{user.role || 'Agent'}</span>
              </div>
            </div>
          )}

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors border border-rose-500/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Admin Main Viewport */}
      <div className="flex-1 flex flex-col overflow-y-auto max-h-screen">
        <main className="p-4 sm:p-8 flex-1">{children}</main>
      </div>
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <AdminShell>{children}</AdminShell>
    </AuthProvider>
  );
}
