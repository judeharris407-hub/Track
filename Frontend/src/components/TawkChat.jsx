'use client';

import TawkMessengerReact from '@tawk.to/tawk-messenger-react';

export default function TawkChat() {
  const propertyId = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID || '6a97ac1f8d100b34420d9b59';
  const widgetId = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID || '1k1g7gpqe';

  return (
    <TawkMessengerReact
      propertyId={propertyId}
      widgetId={widgetId}
    />
  );
}
