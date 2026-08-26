import express from 'express';
import { getParcelDetails } from '../controllers/public/parcelController.js';
import { getChatHistory } from '../controllers/public/chatController.js';
import { trackingRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public tracking lookup route (limited to 100 requests per 15 minutes)
router.get('/parcels/:trackingNumber', trackingRateLimiter, getParcelDetails);

// Public chat history route
router.get('/chat/history/:guestId', getChatHistory);

export default router;
