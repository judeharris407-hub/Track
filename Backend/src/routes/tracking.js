import express from 'express';
import pool from '../config/db.js';
import { trackingRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.get('/:trackingNumber', trackingRateLimiter, async (req, res) => {
  const { trackingNumber } = req.params;

  try {
    const shipmentResult = await pool.query(
      'SELECT * FROM shipments WHERE UPPER(tracking_number) = UPPER($1);',
      [trackingNumber]
    );

    if (shipmentResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tracking number not found' });
    }

    const shipment = shipmentResult.rows[0];

    const eventsResult = await pool.query(
      'SELECT description, location, timestamp FROM tracking_events WHERE shipment_id = $1 ORDER BY id DESC;',
      [shipment.id]
    );

    const eventsRows = eventsResult.rows;

    res.json({
      tracking_number: shipment.tracking_number,
      current_status: shipment.current_status,
      estimated_delivery: shipment.estimated_delivery,
      carrier: shipment.carrier,
      history: eventsRows
    });
  } catch (error) {
    console.error('Error fetching tracking data:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
