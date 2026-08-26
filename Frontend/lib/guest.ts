/**
 * Utility to manage persistent guest identification for public visitors and live chat.
 * Stores and retrieves a unique guest ID from localStorage with document.cookie fallback.
 */

const GUEST_STORAGE_KEY = 'track_guest_id';

export const getOrCreateGuestId = (): string => {
  if (typeof window === 'undefined') {
    return 'guest_ssr';
  }

  try {
    let guestId = localStorage.getItem(GUEST_STORAGE_KEY);

    if (!guestId) {
      // Check cookies as fallback
      const cookieMatch = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${GUEST_STORAGE_KEY}=`));

      if (cookieMatch) {
        guestId = cookieMatch.split('=')[1];
      }
    }

    if (!guestId) {
      // Generate a unique alphanumeric guest string
      const randomStr = Math.random().toString(36).substring(2, 9);
      const timeStr = Date.now().toString(36);
      guestId = `guest_${timeStr}_${randomStr}`;

      // Persist in localStorage and 1-year cookie
      localStorage.setItem(GUEST_STORAGE_KEY, guestId);
      document.cookie = `${GUEST_STORAGE_KEY}=${guestId}; path=/; max-age=31536000; SameSite=Lax`;
    }

    return guestId;
  } catch (err) {
    console.warn('Error reading or setting guest ID in client storage:', err);
    return `guest_tmp_${Math.random().toString(36).substring(2, 8)}`;
  }
};

export default getOrCreateGuestId;
