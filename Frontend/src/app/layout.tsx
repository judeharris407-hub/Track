import type { Metadata } from 'next';
import './globals.css';
import TawkChat from '@/components/TawkChat';

export const metadata: Metadata = {
  title: 'ShipNGo | Trusted Courier & Real-Time Tracking Logistics',
  description: 'Fast, affordable, and dependable courier service with real-time GPS tracking and live customer support.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-white text-slate-900 selection:bg-blue-500 selection:text-white">
        {children}
        <TawkChat />
      </body>
    </html>
  );
}
