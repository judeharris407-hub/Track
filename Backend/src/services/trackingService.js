import pool from '../config/db.js';

export const findShipmentByTrackingNumber = async (trackingNumber) => {
  const result = await pool.query(
    'SELECT * FROM shipments WHERE UPPER(tracking_number) = UPPER($1);',
    [trackingNumber]
  );
  return result.rows[0] || null;
};
