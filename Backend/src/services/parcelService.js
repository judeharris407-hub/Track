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
      destination,
      status,
      current_location,
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
 * Create a new parcel with a generated unique tracking number and initial 'Parcel Received' event.
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
    destination,
    destination_address,
    current_location,
    estimated_delivery,
    status = 'Parcel Received',
  } = parcelData;

  const originVal = origin || origin_hub || 'Origin Hub';
  const destVal = destination || destination_address || 'Destination Address';
  const trackingNumber = generateTrackingNumber();
  const initialLocation = current_location || originVal;

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
      destination,
      status,
      current_location,
      estimated_delivery
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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
    destVal,
    status,
    initialLocation,
    estimated_delivery || null,
  ]);

  const newParcel = parcelResult.rows[0];

  // Create initial checkpoint event
  const insertEventQuery = `
    INSERT INTO parcel_events (
      parcel_id,
      status,
      location,
      description,
      created_by
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const eventResult = await query(insertEventQuery, [
    newParcel.id,
    status,
    initialLocation,
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
 * @param {number|string} parcelId
 * @param {string} status
 * @param {string} location
 * @param {string} [description]
 * @param {number} [userId]
 * @returns {Promise<Object>}
 */
export const updateParcelStatus = async (parcelId, status, location, description = null, userId = null) => {
  const checkParcelResult = await query('SELECT * FROM parcels WHERE id = $1;', [parcelId]);

  if (checkParcelResult.rows.length === 0) {
    const error = new Error(`Parcel with ID ${parcelId} not found.`);
    error.status = 404;
    throw error;
  }

  // Update parcel status & current location
  const updateParcelQuery = `
    UPDATE parcels 
    SET 
      status = $1, 
      current_location = $2, 
      updated_at = CURRENT_TIMESTAMP 
    WHERE id = $3
    RETURNING *;
  `;

  const updatedParcelResult = await query(updateParcelQuery, [status, location, parcelId]);
  const updatedParcel = updatedParcelResult.rows[0];

  // Insert event history row
  const insertEventQuery = `
    INSERT INTO parcel_events (
      parcel_id,
      status,
      location,
      description,
      created_by
    ) VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const eventResult = await query(insertEventQuery, [
    parcelId,
    status,
    location,
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
      p.destination,
      p.status,
      p.current_location,
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
  getAllParcels,
};
