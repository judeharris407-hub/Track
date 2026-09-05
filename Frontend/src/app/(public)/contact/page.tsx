'use client';

import { useState } from 'react';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Logistics Inquiry',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: 'General Logistics Inquiry',
        message: '',
      });
    }, 1000);
  };

  const openTawkChat = () => {
    if (typeof window !== 'undefined' && (window as any).Tawk_API?.maximize) {
      (window as any).Tawk_API.maximize();
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 py-16 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3.5 py-1.5 rounded-full border border-blue-100">
            Contact Us
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
            We&apos;re here to help 24/7.
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Have questions regarding tracking, commercial freight rates, or scheduled pickups? Reach out to our dedicated operations team anytime.
          </p>
        </div>

        {/* 2-Column Contact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Send us a message form */}
          <div className="lg:col-span-7 bg-slate-50 p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
            <div className="space-y-1 border-b border-slate-200 pb-4">
              <h2 className="text-2xl font-bold text-slate-900">Send us a Message</h2>
              <p className="text-xs text-slate-500">
                Submit your inquiry and an operations specialist will respond within 15 minutes.
              </p>
            </div>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-emerald-900">Message Received!</h3>
                <p className="text-xs text-emerald-700">
                  Thank you for contacting SkyPrime Logistics. A support representative has been assigned to your ticket.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2 rounded-xl bg-white border border-emerald-300 text-xs font-semibold text-emerald-800 hover:bg-emerald-100/50 transition-colors"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. name@company.com"
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Subject / Category
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value="General Logistics Inquiry">General Logistics Inquiry</option>
                    <option value="Parcel Tracking Assistance">Parcel Tracking Assistance</option>
                    <option value="Commercial Freight Quote">Commercial Freight Rate Quote</option>
                    <option value="Customs & Duty Support">Customs & Duty Support</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Enter details about your shipment or question..."
                    className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'Sending Message...' : 'Submit Inquiry'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Contact Information Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-4">
                Contact Information
              </h2>

              <ul className="space-y-5 text-xs text-slate-700">
                <li className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">
                      Phone Number
                    </span>
                    <a href="tel:+18005927447" className="text-sm font-bold text-slate-900 hover:text-blue-600 font-mono">
                      +1 (800) 592-7447
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">
                      Support Email
                    </span>
                    <a href="mailto:support@skyprimelogistics.com" className="text-sm font-bold text-slate-900 hover:text-blue-600 font-mono">
                      support@skyprimelogistics.com
                    </a>
                  </div>
                </li>

                <li className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">
                      Headquarters Address
                    </span>
                    <span className="text-sm font-bold text-slate-900 block">
                      100 Logistics Way, Suite 400
                    </span>
                    <span className="text-xs text-slate-500">New York, NY 10001, USA</span>
                  </div>
                </li>

                <li className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 font-semibold block uppercase tracking-wider">
                      Operating Hours
                    </span>
                    <span className="text-sm font-bold text-slate-900 block">
                      24 Hours / 7 Days a Week
                    </span>
                    <span className="text-xs text-emerald-600 font-semibold">
                      Live Dispatch Desk Active
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Instant Live Chat Card */}
            <div className="p-6 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Need immediate live help?</h4>
                  <p className="text-[11px] text-slate-600">Chat with a live customer agent now.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={openTawkChat}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer shrink-0"
              >
                Launch Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
