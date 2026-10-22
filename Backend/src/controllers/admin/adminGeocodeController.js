import axios from 'axios';

// Simple in-memory cache for repeated lookups
const geocodeCache = new Map();

/**
 * Address Geocoding using OpenStreetMap Nominatim API
 * GET /api/v1/admin/geocode?q=Rotterdam+Port
 */
export const geocodeAddress = async (req, res, next) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Search query parameter "q" is required.',
      });
    }

    const queryStr = q.trim().toLowerCase();

    // Check memory cache
    if (geocodeCache.has(queryStr)) {
      return res.status(200).json({
        success: true,
        cached: true,
        data: geocodeCache.get(queryStr),
      });
    }

    // Call Nominatim API
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        format: 'json',
        q: queryStr,
        limit: 8,
        addressdetails: 1,
      },
      headers: {
        'User-Agent': 'TrackLogisticsApp/1.0 (logistics-support@enterprise.track)',
        'Accept-Language': 'en',
      },
      timeout: 6000,
    });

    const results = (response.data || []).map((item) => ({
      place_id: item.place_id,
      name: item.name || item.display_name.split(',')[0],
      display_name: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      type: item.type || item.class,
      importance: item.importance,
    }));

    // Cache results (max 200 items in cache)
    if (geocodeCache.size > 200) {
      const firstKey = geocodeCache.keys().next().value;
      geocodeCache.delete(firstKey);
    }
    geocodeCache.set(queryStr, results);

    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.warn('[GeocodeWarning] Primary Nominatim call failed, attempting OpenStreetMap Photon API fallback:', error.message || error);

    try {
      const photonRes = await axios.get('https://photon.komoot.io/api/', {
        params: {
          q: queryStr,
          limit: 8,
        },
        timeout: 4000,
      });

      if (photonRes.data && Array.isArray(photonRes.data.features)) {
        const photonResults = photonRes.data.features.map((feat) => {
          const props = feat.properties || {};
          const [lng, lat] = feat.geometry?.coordinates || [0, 0];
          const name = props.name || props.city || props.country || queryStr;
          const parts = [props.name, props.city, props.state, props.country].filter(Boolean);
          return {
            place_id: props.osm_id || `${lat},${lng}`,
            name,
            display_name: parts.join(', ') || name,
            lat,
            lng,
            type: props.osm_value || props.type || 'location',
            importance: 0.7,
          };
        });

        if (photonResults.length > 0) {
          geocodeCache.set(queryStr, photonResults);
          return res.status(200).json({
            success: true,
            data: photonResults,
          });
        }
      }
    } catch (photonErr) {
      console.error('[GeocodeError] Photon fallback also failed:', photonErr.message || photonErr);
    }

    // Non-blocking fallback: return empty list on failure
    return res.status(200).json({
      success: true,
      data: [],
      warning: 'Geocoding service temporarily unavailable; please enter coordinates manually or use map picker.',
    });
  }
};

export default {
  geocodeAddress,
};
