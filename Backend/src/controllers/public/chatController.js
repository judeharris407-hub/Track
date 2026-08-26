import { getChatHistoryByGuestId } from '../../services/chatService.js';

/**
 * Controller to fetch chat history by guestId
 * GET /api/v1/public/chat/history/:guestId
 */
export const getChatHistory = async (req, res, next) => {
  try {
    const { guestId } = req.params;

    if (!guestId) {
      return res.status(400).json({
        success: false,
        message: 'guestId parameter is required.',
      });
    }

    const history = await getChatHistoryByGuestId(guestId);

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getChatHistory,
};
