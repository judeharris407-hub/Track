import crypto from 'crypto';

/**
 * Generates a formatted, unique tracking ID in the format TRK-YYYY-XXXXXX
 * Example: TRK-2026-9F3K2B
 * @returns {string}
 */
export const generateTrackingNumber = () => {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // exclude ambiguous chars like O, 0, I, 1
  let randomPart = '';
  const bytes = crypto.randomBytes(6);

  for (let i = 0; i < 6; i++) {
    randomPart += chars[bytes[i] % chars.length];
  }

  return `TRK-${year}-${randomPart}`;
};

export default generateTrackingNumber;
