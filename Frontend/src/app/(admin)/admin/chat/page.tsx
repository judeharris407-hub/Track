'use client';

import {
  MessageSquare,
  ExternalLink,
  BellRing,
  PackageCheck,
  Users2,
  ShieldCheck,
  Headphones,
  Inbox,
  ArrowUpRight,
  Radio,
} from 'lucide-react';

export default function AdminLiveChatDeskPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-2xl font-black text-white tracking-tight">Support Operations Desk</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              External Desk Connected
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time multi-agent customer support operations powered by tawk.to
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <Radio className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            24/7 Agent Availability
          </span>
        </div>
      </div>

      {/* Main Enterprise Launcher Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/80 border border-slate-800 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
        {/* Subtle Decorative Glow Background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 max-w-3xl space-y-8">
          {/* Card Top Icon & Title */}
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-lg shadow-indigo-600/20 shrink-0">
              <Headphones className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                tawk.to Agent Operations Console
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Customer live chat inquiries are handled securely via our dedicated tawk.to agent dashboard. Click below to launch the agent console, manage active customer sessions, and reply in real time.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
            {/* Primary Action Button */}
            <a
              href="https://dashboard.tawk.to"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] group cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Open tawk.to Agent Console</span>
              <ArrowUpRight className="w-4 h-4 text-indigo-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            {/* Secondary Action Button */}
            <a
              href="https://dashboard.tawk.to/#/chat"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-sm border border-slate-700/80 transition-all hover:scale-[1.02] active:scale-[0.98] group cursor-pointer"
            >
              <Inbox className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
              <span>Open Direct Inbox</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
            </a>
          </div>

          {/* Feature Highlights Grid */}
          <div className="pt-6 border-t border-slate-800/80">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Integrated Console Features
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Feature 1 */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <BellRing className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white">Instant Push Notifications</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Mobile & desktop alerts keep support agents notified for rapid first response times.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <PackageCheck className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white">Pre-Chat Parcel Data</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Customer tracking numbers and browser context automatically attached to chat sessions.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2 hover:border-slate-700 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Users2 className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold text-white">Multi-Agent Support</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Concurrent support agent access with department routing and internal whisper notes.
                </p>
              </div>
            </div>
          </div>

          {/* Security & Access Notice */}
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-300">
            <ShieldCheck className="w-4 h-4 shrink-0 text-indigo-400" />
            <span>
              Access credentials are tied to your registered tawk.to agent email. Contact the team lead if you need agent seat provisioning.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
