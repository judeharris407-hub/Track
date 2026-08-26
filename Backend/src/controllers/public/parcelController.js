import { getParcelByTrackingNumber } from '../../services/parcelService.js';

/**
 * Controller to handle public parcel tracking lookups.
 * GET /api/v1/public/parcels/:trackingNumber
 */
export const getParcelDetails = async (req, res, next) => {
  try {
    const { trackingNumber } = req.params;

    if (!trackingNumber) {
      return res.status(400).json({
        success: false,
        message: 'Tracking number is required.',
      });
    }

    const parcel = await getParcelByTrackingNumber(trackingNumber);

    if (!parcel) {
      return res.status(404).json({
        success: false,
        message: `No parcel found matching tracking number: ${trackingNumber}`,
      });
    }

    return res.status(200).json({
      success: true,
      data: parcel,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getParcelDetails,
};
