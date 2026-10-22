import {
  createParcel as createParcelService,
  updateParcelStatus as updateParcelStatusService,
  updateParcelLocation as updateParcelLocationService,
  getAllParcels as getAllParcelsService,
} from '../../services/parcelService.js';
import { sendParcelStatusEmail } from '../../services/emailService.js';

/**
 * Creates a new parcel
 * POST /api/v1/admin/parcels
 */
export const createParcel = async (req, res, next) => {
  try {
    const {
      sender_name,
      sender_phone,
      sender_email,
      origin,
      origin_hub,
      origin_lat,
      origin_lng,
      recipient_name,
      recipient_phone,
      recipient_email,
      destination,
      destination_address,
      destination_lat,
      destination_lng,
      current_location,
      current_lat,
      current_lng,
      route_history,
      departure_time,
      estimated_arrival_time,
      shipment_type,
      estimated_delivery,
      status,
    } = req.body;

    const originVal = origin || origin_hub;
    const destVal = destination || destination_address;

    if (!sender_name || !recipient_name || !originVal || !destVal) {
      return res.status(400).json({
        success: false,
        message: 'sender_name, recipient_name, origin (origin_hub), and destination (destination_address) are required fields.',
      });
    }

    const userId = req.user?.id || null;

    const parcel = await createParcelService(
      {
        sender_name,
        sender_phone,
        sender_email,
        origin: originVal,
        origin_hub: originVal,
        origin_lat,
        origin_lng,
        recipient_name,
        recipient_phone,
        recipient_email,
        destination: destVal,
        destination_address: destVal,
        destination_lat,
        destination_lng,
        current_location,
        current_lat,
        current_lng,
        route_history,
        departure_time,
        estimated_arrival_time,
        shipment_type: shipment_type || 'LAND',
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
    const { status, location, description, lat, lng, current_lat, current_lng } = req.body;

    if (!status || !location) {
      return res.status(400).json({
        success: false,
        message: 'status and location are required fields.',
      });
    }

    const userId = req.user?.id || null;
    const coords = (lat !== undefined && lng !== undefined) 
      ? { lat, lng } 
      : (current_lat !== undefined && current_lng !== undefined ? { lat: current_lat, lng: current_lng } : null);

    const updatedParcel = await updateParcelStatusService(
      id,
      status,
      location,
      description,
      userId,
      coords
    );

    // Broadcast tracking event update to subscribed room & admin subscribers
    const io = req.app.get('io');
    if (io) {
      io.to(`track_${updatedParcel.tracking_number}`).emit('tracking_update', updatedParcel);
      io.emit('admin_parcel_updated', updatedParcel);
    }

    // Trigger automated email notification via Resend if recipient email exists
    try {
      if (updatedParcel && updatedParcel.recipient_email) {
        await sendParcelStatusEmail(updatedParcel, location, description);
      }
    } catch (emailError) {
      console.error(
        `[EmailNotificationError] Failed to send status update email for parcel ${updatedParcel.tracking_number}:`,
        emailError.message || emailError
      );
      // Gracefully continue without failing the HTTP response
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
 * Updates parcel location coordinates & adds checkpoint to route history
 * PUT /api/v1/admin/parcels/:id/location
 */
export const updateLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      lat,
      lng,
      current_lat,
      current_lng,
      location,
      status,
      description,
      departure_time,
      estimated_arrival_time,
      shipment_type,
    } = req.body;

    const chosenLat = lat !== undefined ? lat : current_lat;
    const chosenLng = lng !== undefined ? lng : current_lng;

    if (chosenLat === undefined || chosenLng === undefined || chosenLat === null || chosenLng === null || chosenLat === '' || chosenLng === '') {
      return res.status(400).json({
        success: false,
        message: 'lat and lng coordinates are required.',
      });
    }

    const userId = req.user?.id || null;

    const updatedParcel = await updateParcelLocationService(
      id,
      {
        lat: chosenLat,
        lng: chosenLng,
        location,
        status,
        description,
        departure_time,
        estimated_arrival_time,
        shipment_type,
      },
      userId
    );

    // Broadcast live map tracking update to customer room and admin dashboard
    const io = req.app.get('io');
    if (io) {
      io.to(`track_${updatedParcel.tracking_number}`).emit('tracking_update', updatedParcel);
      io.emit('admin_parcel_updated', updatedParcel);
    }

    return res.status(200).json({
      success: true,
      message: 'Parcel coordinates and route history updated successfully.',
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
  updateLocation,
  listParcels,
};
