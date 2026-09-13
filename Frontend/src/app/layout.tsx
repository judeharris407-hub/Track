import type { Metadata } from 'next';
import './globals.css';
import TawkChat from '@/components/TawkChat';

export const metadata: Metadata = {
  title: 'SkyPrime Logistics | Enterprise Tracking & Global Freight',
  description: 'Precision line-haul courier services, real-time GPS telemetry, and automated milestone verification engineered to keep your supply chain moving seamlessly.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-white text-slate-900 selection:bg-blue-600 selection:text-white">
        {children}
        <TawkChat />
      </body>
    </html>
  );
}
