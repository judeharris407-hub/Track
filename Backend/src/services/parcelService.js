import { query } from '../config/db.js';
import { generateTrackingNumber } from '../utils/generateTrackingNumber.js';

/**
 * Fetch a parcel by tracking number along with its event history ordered by created_at DESC.
 * @param {string} trackingNumber
 * @returns {Promise<Object|null>}
 */
export const getParcelByTrackingNumber = async (trackingNumber) => {
  const parcelQuery = `
    SELECT 
      id,
      tracking_number,
      sender_name,
      sender_phone,
      sender_email,
      recipient_name,
      recipient_phone,
      recipient_email,
      origin,
      origin_lat,
      origin_lng,
      destination,
      destination_lat,
      destination_lng,
      status,
      current_location,
      current_lat,
      current_lng,
      route_history,
      departure_time,
      estimated_arrival_time,
      shipment_type,
      estimated_delivery,
      created_at,
      updated_at
    FROM parcels
    WHERE UPPER(tracking_number) = UPPER($1);
  `;

  const parcelResult = await query(parcelQuery, [trackingNumber.trim()]);

  if (parcelResult.rows.length === 0) {
    return null;
  }

  const parcel = parcelResult.rows[0];

  const eventsQuery = `
    SELECT 
      id,
      parcel_id,
      status,
      location,
      lat,
      lng,
      description,
      created_by,
      created_at
    FROM parcel_events
    WHERE parcel_id = $1
    ORDER BY created_at DESC;
  `;

  const eventsResult = await query(eventsQuery, [parcel.id]);

  return {
    ...parcel,
    events: eventsResult.rows,
  };
};

/**
 * Create a new parcel with coordinates, history, unique tracking number and initial event.
 * @param {Object} parcelData
 * @param {number} [userId]
 * @returns {Promise<Object>}
 */
export const createParcel = async (parcelData, userId = null) => {
  const {
    sender_name,
    sender_phone = null,
    sender_email = null,
    recipient_name,
    recipient_phone = null,
    recipient_email = null,
    origin,
    origin_hub,
    origin_lat = null,
    origin_lng = null,
    destination,
    destination_address,
    destination_lat = null,
    destination_lng = null,
    current_location,
    current_lat = null,
    current_lng = null,
    route_history = null,
    departure_time = null,
    estimated_arrival_time = null,
    shipment_type = 'LAND',
    estimated_delivery,
    status = 'Parcel Received',
  } = parcelData;

  const originVal = origin || origin_hub || 'Origin Hub';
  const destVal = destination || destination_address || 'Destination Address';
  const trackingNumber = generateTrackingNumber();
  const initialLocation = current_location || originVal;

  const parsedOriginLat = origin_lat !== null && origin_lat !== undefined && origin_lat !== '' ? parseFloat(origin_lat) : null;
  const parsedOriginLng = origin_lng !== null && origin_lng !== undefined && origin_lng !== '' ? parseFloat(origin_lng) : null;
  const parsedDestLat = destination_lat !== null && destination_lat !== undefined && destination_lat !== '' ? parseFloat(destination_lat) : null;
  const parsedDestLng = destination_lng !== null && destination_lng !== undefined && destination_lng !== '' ? parseFloat(destination_lng) : null;
  const parsedCurrentLat = current_lat !== null && current_lat !== undefined && current_lat !== '' ? parseFloat(current_lat) : parsedOriginLat;
  const parsedCurrentLng = current_lng !== null && current_lng !== undefined && current_lng !== '' ? parseFloat(current_lng) : parsedOriginLng;

  let initialRouteHistory = Array.isArray(route_history) ? route_history : [];
  if (initialRouteHistory.length === 0 && parsedCurrentLat !== null && parsedCurrentLng !== null) {
    initialRouteHistory.push({
      lat: parsedCurrentLat,
      lng: parsedCurrentLng,
      location_name: initialLocation,
      status,
      timestamp: new Date().toISOString(),
    });
  }

  const arrivalVal = estimated_arrival_time || estimated_delivery || null;
  const departureVal = departure_time || new Date().toISOString();

  const insertParcelQuery = `
    INSERT INTO parcels (
      tracking_number,
      sender_name,
      sender_phone,
      sender_email,
      recipient_name,
      recipient_phone,
      recipient_email,
      origin,
      origin_lat,
      origin_lng,
      destination,
      destination_lat,
      destination_lng,
      status,
      current_location,
      current_lat,
      current_lng,
      route_history,
      departure_time,
      estimated_arrival_time,
      shipment_type,
      estimated_delivery
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
    RETURNING *;
  `;

  const parcelResult = await query(insertParcelQuery, [
    trackingNumber,
    sender_name,
    sender_phone,
    sender_email,
    recipient_name,
    recipient_phone,
    recipient_email,
    originVal,
    parsedOriginLat,
    parsedOriginLng,
    destVal,
    parsedDestLat,
    parsedDestLng,
    status,
    initialLocation,
    parsedCurrentLat,
    parsedCurrentLng,
    JSON.stringify(initialRouteHistory),
    departureVal,
    arrivalVal,
    shipment_type || 'LAND',
    arrivalVal,
  ]);

  const newParcel = parcelResult.rows[0];

  // Create initial checkpoint event
  const insertEventQuery = `
    INSERT INTO parcel_events (
      parcel_id,
      status,
      location,
      lat,
      lng,
      description,
      created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;

  const eventResult = await query(insertEventQuery, [
    newParcel.id,
    status,
    initialLocation,
    parsedCurrentLat,
    parsedCurrentLng,
    'Shipment registered and parcel received at origin hub.',
    userId,
  ]);

  return {
    ...newParcel,
    events: [eventResult.rows[0]],
  };
};

/**
 * Updates a parcel's status & current location and records a new checkpoint event in parcel_events.
 * Supports coordinates update and route_history checkpoint tracking.
 * @param {number|string} parcelId
 * @param {string} status
 * @param {string} location
 * @param {string} [description]
 * @param {number} [userId]
 * @param {Object} [coords] - { lat, lng }
 * @returns {Promise<Object>}
 */
export const updateParcelStatus = async (parcelId, status, location, description = null, userId = null, coords = null) => {
  const checkParcelResult = await query('SELECT * FROM parcels WHERE id = $1;', [parcelId]);

  if (checkParcelResult.rows.length === 0) {
    const error = new Error(`Parcel with ID ${parcelId} not found.`);
    error.status = 404;
    throw error;
  }

  const existingParcel = checkParcelResult.rows[0];
  const hasCoords = coords && coords.lat !== null && coords.lat !== undefined && coords.lat !== '' &&
                    coords.lng !== null && coords.lng !== undefined && coords.lng !== '';
  
  const targetLat = hasCoords ? parseFloat(coords.lat) : null;
  const targetLng = hasCoords ? parseFloat(coords.lng) : null;

  const newCheckpointJson = hasCoords ? JSON.stringify([{
    lat: targetLat,
    lng: targetLng,
    location_name: location,
    status: status,
    description: description || `Package status updated to ${status}`,
    timestamp: new Date().toISOString(),
  }]) : null;

  // Update parcel status, current location, and append to route_history if coordinates provided
  const updateParcelQuery = `
    UPDATE parcels 
    SET 
      status = $1, 
      current_location = $2, 
      current_lat = COALESCE($3, current_lat),
      current_lng = COALESCE($4, current_lng),
      route_history = CASE 
        WHEN $5::jsonb IS NOT NULL THEN COALESCE(route_history, '[]'::jsonb) || $5::jsonb
        ELSE route_history
      END,
      updated_at = CURRENT_TIMESTAMP 
    WHERE id = $6
    RETURNING *;
  `;

  const updatedParcelResult = await query(updateParcelQuery, [
    status,
    location,
    targetLat,
    targetLng,
    newCheckpointJson,
    parcelId,
  ]);
  const updatedParcel = updatedParcelResult.rows[0];

  // Insert event history row
  const insertEventQuery = `
    INSERT INTO parcel_events (
      parcel_id,
      status,
      location,
      lat,
      lng,
      description,
      created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;

  const eventResult = await query(insertEventQuery, [
    parcelId,
    status,
    location,
    targetLat,
    targetLng,
    description || `Package status updated to ${status}`,
    userId,
  ]);

  const allEvents = await query(
    'SELECT * FROM parcel_events WHERE parcel_id = $1 ORDER BY created_at DESC;',
    [parcelId]
  );

  return {
    ...updatedParcel,
    latest_event: eventResult.rows[0],
    events: allEvents.rows,
  };
};

/**
 * Dedicated service to update a parcel's location coordinates, milestone, and route history.
 * @param {number|string} parcelId
 * @param {Object} locationData - { lat, lng, location, status, description }
 * @param {number} [userId]
 * @returns {Promise<Object>}
 */
export const updateParcelLocation = async (parcelId, locationData, userId = null) => {
  const { lat, lng, location, status, description, departure_time, estimated_arrival_time, shipment_type } = locationData;

  const checkParcelResult = await query('SELECT * FROM parcels WHERE id = $1;', [parcelId]);
  if (checkParcelResult.rows.length === 0) {
    const error = new Error(`Parcel with ID ${parcelId} not found.`);
    error.status = 404;
    throw error;
  }

  const existingParcel = checkParcelResult.rows[0];
  const numLat = parseFloat(lat);
  const numLng = parseFloat(lng);

  if (isNaN(numLat) || isNaN(numLng)) {
    const error = new Error('Valid lat and lng numeric coordinates are required.');
    error.status = 400;
    throw error;
  }

  const targetLocation = location || existingParcel.current_location || `Coordinates (${numLat.toFixed(4)}, ${numLng.toFixed(4)})`;
  const targetStatus = status || existingParcel.status || 'In Transit';
  const targetDesc = description || `Coordinate checkpoint updated: ${numLat.toFixed(4)}, ${numLng.toFixed(4)}`;

  const newCheckpointJson = JSON.stringify([{
    lat: numLat,
    lng: numLng,
    location_name: targetLocation,
    status: targetStatus,
    description: targetDesc,
    timestamp: new Date().toISOString(),
  }]);

  const updateParcelQuery = `
    UPDATE parcels 
    SET 
      current_lat = $1,
      current_lng = $2,
      current_location = $3,
      status = $4,
      route_history = COALESCE(route_history, '[]'::jsonb) || $5::jsonb,
      departure_time = COALESCE($6, departure_time),
      estimated_arrival_time = COALESCE($7, estimated_arrival_time),
      shipment_type = COALESCE($8, shipment_type),
      updated_at = CURRENT_TIMESTAMP 
    WHERE id = $9
    RETURNING *;
  `;

  const updatedParcelResult = await query(updateParcelQuery, [
    numLat,
    numLng,
    targetLocation,
    targetStatus,
    newCheckpointJson,
    departure_time || null,
    estimated_arrival_time || null,
    shipment_type || null,
    parcelId,
  ]);
  const updatedParcel = updatedParcelResult.rows[0];

  // Insert event
  const insertEventQuery = `
    INSERT INTO parcel_events (
      parcel_id,
      status,
      location,
      lat,
      lng,
      description,
      created_by
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;

  const eventResult = await query(insertEventQuery, [
    parcelId,
    targetStatus,
    targetLocation,
    numLat,
    numLng,
    targetDesc,
    userId,
  ]);

  const allEvents = await query(
    'SELECT * FROM parcel_events WHERE parcel_id = $1 ORDER BY created_at DESC;',
    [parcelId]
  );

  return {
    ...updatedParcel,
    latest_event: eventResult.rows[0],
    events: allEvents.rows,
  };
};

/**
 * Returns a paginated list of all parcels for the administrative dashboard.
 * @param {number} [limit=50]
 * @param {number} [offset=0]
 * @returns {Promise<Object>}
 */
export const getAllParcels = async (limit = 50, offset = 0) => {
  const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
  const parsedOffset = Math.max(parseInt(offset, 10) || 0, 0);

  const countResult = await query('SELECT COUNT(*) FROM parcels;');
  const total = parseInt(countResult.rows[0].count, 10);

  const parcelsQuery = `
    SELECT 
      p.id,
      p.tracking_number,
      p.sender_name,
      p.sender_phone,
      p.sender_email,
      p.recipient_name,
      p.recipient_phone,
      p.recipient_email,
      p.origin,
      p.origin_lat,
      p.origin_lng,
      p.destination,
      p.destination_lat,
      p.destination_lng,
      p.status,
      p.current_location,
      p.current_lat,
      p.current_lng,
      p.route_history,
      p.departure_time,
      p.estimated_arrival_time,
      p.shipment_type,
      p.estimated_delivery,
      p.created_at,
      p.updated_at,
      COUNT(e.id) AS event_count
    FROM parcels p
    LEFT JOIN parcel_events e ON p.id = e.parcel_id
    GROUP BY p.id
    ORDER BY p.created_at DESC
    LIMIT $1 OFFSET $2;
  `;

  const result = await query(parcelsQuery, [parsedLimit, parsedOffset]);

  return {
    total,
    limit: parsedLimit,
    offset: parsedOffset,
    page: Math.floor(parsedOffset / parsedLimit) + 1,
    totalPages: Math.ceil(total / parsedLimit),
    parcels: result.rows,
  };
};

export default {
  getParcelByTrackingNumber,
  createParcel,
  updateParcelStatus,
  updateParcelLocation,
  getAllParcels,
};
