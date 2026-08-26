import {
  getAllThreads,
  getThreadById,
  updateThreadStatus as updateThreadStatusService,
} from '../../services/chatService.js';

/**
 * Returns all active or past chat threads
 * GET /api/v1/admin/chat/threads
 */
export const getThreads = async (req, res, next) => {
  try {
    const { status } = req.query;
    const threads = await getAllThreads(status);

    return res.status(200).json({
      success: true,
      data: threads,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Returns thread metadata and message history
 * GET /api/v1/admin/chat/threads/:threadId
 */
export const getThreadDetails = async (req, res, next) => {
  try {
    const { threadId } = req.params;

    if (!threadId) {
      return res.status(400).json({
        success: false,
        message: 'threadId parameter is required.',
      });
    }

    const details = await getThreadById(threadId);

    if (!details) {
      return res.status(404).json({
        success: false,
        message: `Thread with ID ${threadId} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: details,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Updates thread status to 'open' or 'closed'
 * PUT /api/v1/admin/chat/threads/:threadId/status
 */
export const updateThreadStatus = async (req, res, next) => {
  try {
    const { threadId } = req.params;
    const { status = 'closed' } = req.body;

    const validStatuses = ['open', 'closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status '${status}'. Must be 'open' or 'closed'.`,
      });
    }

    const updatedThread = await updateThreadStatusService(threadId, status);

    const io = req.app.get('io');
    if (io) {
      io.to(`thread_${threadId}`).emit('thread_status_updated', {
        threadId,
        status: updatedThread.status,
      });
      io.emit('admin_thread_updated', updatedThread);
    }

    return res.status(200).json({
      success: true,
      message: `Thread status updated to '${status}'.`,
      data: updatedThread,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Convenience handler to close a thread
 */
export const closeThread = async (req, res, next) => {
  req.body = { ...req.body, status: 'closed' };
  return updateThreadStatus(req, res, next);
};

export default {
  getThreads,
  getThreadDetails,
  updateThreadStatus,
  closeThread,
};
