import pool from '../../config/db.js';

export const createShipment = async (req, res, next) => {
  try {
    const { tracking_number, current_status, estimated_delivery, carrier } = req.body;
    const result = await pool.query(
      `INSERT INTO shipments (tracking_number, current_status, estimated_delivery, carrier)
       VALUES ($1, $2, $3, $4)
       RETURNING *;`,
      [tracking_number, current_status, estimated_delivery, carrier]
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    next(error);
  }
};
