import { Router } from 'express';
import {
  handleTelegramWebhook,
  verifyWhatsAppWebhook,
  handleWhatsAppWebhook,
  handleTwilioWebhook,
} from '../controllers/public/webhookController.js';

const router = Router();

// Telegram Webhook route
router.post('/telegram', handleTelegramWebhook);

// WhatsApp Webhook routes (Meta Cloud API: GET for challenge, POST for inbound)
router.get('/whatsapp', verifyWhatsAppWebhook);
router.post('/whatsapp', handleWhatsAppWebhook);

// Twilio WhatsApp / SMS Webhook route
router.post('/twilio', handleTwilioWebhook);

export default router;
