import {
  createParcel as createParcelService,
  updateParcelStatus as updateParcelStatusService,
  getAllParcels as getAllParcelsService,
} from '../../services/parcelService.js';

/**
 * Creates a new parcel
 * POST /api/v1/admin/parcels
 */
export const createParcel = async (req, res, next) => {
  try {
    const {
      sender_name,
      recipient_name,
      origin,
      destination,
      current_location,
      estimated_delivery,
      status,
    } = req.body;

    if (!sender_name || !recipient_name || !origin || !destination) {
      return res.status(400).json({
        success: false,
        message: 'sender_name, recipient_name, origin, and destination are required fields.',
      });
    }

    const userId = req.user?.id || null;

    const parcel = await createParcelService(
      {
        sender_name,
        recipient_name,
        origin,
        destination,
        current_location,
        estimated_delivery,
        status,
      },
      userId
    );

    // Notify connected WebSocket clients of live updates
    const io = req.app.get('io');
    if (io) {
      io.emit('parcel_created', parcel);
    }

    return res.status(201).json({
      success: true,
      message: 'Parcel created successfully.',
      data: parcel,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Updates status and creates a checkpoint event for a parcel
 * PUT /api/v1/admin/parcels/:id/status
 */
export const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, location, description } = req.body;

    if (!status || !location) {
      return res.status(400).json({
        success: false,
        message: 'status and location are required fields.',
      });
    }

    const userId = req.user?.id || null;

    const updatedParcel = await updateParcelStatusService(
      id,
      status,
      location,
      description,
      userId
    );

    // Broadcast tracking event update to subscribed room & admin subscribers
    const io = req.app.get('io');
    if (io) {
      io.to(`track_${updatedParcel.tracking_number}`).emit('tracking_update', updatedParcel);
      io.emit('admin_parcel_updated', updatedParcel);
    }

    return res.status(200).json({
      success: true,
      message: 'Parcel status updated successfully.',
      data: updatedParcel,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Returns a paginated list of all parcels
 * GET /api/v1/admin/parcels
 */
export const listParcels = async (req, res, next) => {
  try {
    const { limit, offset, page } = req.query;

    let computedOffset = offset;
    if (page && !offset) {
      const parsedPage = Math.max(parseInt(page, 10) || 1, 1);
      const parsedLimit = parseInt(limit, 10) || 50;
      computedOffset = (parsedPage - 1) * parsedLimit;
    }

    const result = await getAllParcelsService(limit, computedOffset);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createParcel,
  updateStatus,
  listParcels,
};
