'use client';

import { useEffect, useRef, useCallback } from 'react';
import TawkMessengerReact from '@tawk.to/tawk-messenger-react';

interface TawkChatProps {
  trackingNumber?: string;
  customerName?: string;
}

export default function TawkChat({
  trackingNumber,
  customerName,
}: TawkChatProps = {}) {
  const tawkMessengerRef = useRef<any>(null);

  const syncAttributes = useCallback(() => {
    if (typeof window !== 'undefined' && (window as any).Tawk_API?.setAttributes) {
      const attributes: Record<string, string> = {
        context: trackingNumber ? 'Active Parcel Tracking Inquiry' : 'General Visitor Inquiry',
      };

      if (trackingNumber) {
        attributes.trackingNumber = trackingNumber;
      }
      if (customerName) {
        attributes.name = customerName;
      } else if (trackingNumber) {
        attributes.name = `Guest (${trackingNumber})`;
      }

      (window as any).Tawk_API.setAttributes(attributes, (error: any) => {
        if (error) {
          console.warn('[Tawk.to] Could not set visitor attributes:', error);
        }
      });

      if (trackingNumber && (window as any).Tawk_API.addTags) {
        (window as any).Tawk_API.addTags([trackingNumber, 'ParcelInquiry'], () => {});
      }
    }
  }, [trackingNumber, customerName]);

  const handleBeforeLoad = () => {
    if (typeof window !== 'undefined') {
      const w = window as any;
      w.Tawk_API = w.Tawk_API || {};
      const previousOnLoad = w.Tawk_API.onLoad;

      w.Tawk_API.onLoad = function () {
        if (typeof previousOnLoad === 'function') {
          previousOnLoad();
        }
        syncAttributes();
      };
    }
  };

  useEffect(() => {
    syncAttributes();
  }, [syncAttributes]);

  return (
    <TawkMessengerReact
      propertyId={process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID || '6a97ac1f8d100b34420d9b59'}
      widgetId={process.env.NEXT_PUBLIC_TAWK_WIDGET_ID || '1k1g7gpqe'}
      ref={tawkMessengerRef}
      onBeforeLoad={handleBeforeLoad}
      onLoad={syncAttributes}
    />
  );
}
