import express from 'express';
import { login, register } from '../controllers/admin/adminAuthController.js';
import {
  createParcel,
  updateStatus,
  listParcels,
} from '../controllers/admin/adminParcelController.js';
import {
  getThreads,
  getThreadDetails,
  updateThreadStatus,
} from '../controllers/admin/adminChatController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// ================= AUTHENTICATION =================
// Public login endpoint with rate limiting (10 attempts per 15 mins)
router.post('/login', authRateLimiter, login);

// Protected user registration endpoint
router.post('/register', authenticateToken, register);

// ================= PARCEL MANAGEMENT =================
// List all packages (paginated)
router.get('/parcels', authenticateToken, listParcels);

// Create a new package
router.post('/parcels', authenticateToken, createParcel);

// Update parcel status & checkpoint event
router.put('/parcels/:id/status', authenticateToken, updateStatus);

// ================= LIVE CHAT MANAGEMENT =================
// List chat threads (supports ?status=open|closed)
router.get('/chat/threads', authenticateToken, getThreads);

// Get specific thread details and message history
router.get('/chat/threads/:threadId', authenticateToken, getThreadDetails);

// Update thread status (open / closed)
router.put('/chat/threads/:threadId/status', authenticateToken, updateThreadStatus);

export default router;
