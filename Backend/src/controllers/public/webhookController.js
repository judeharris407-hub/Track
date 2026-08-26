import {
  normalizeTelegramPayload,
  normalizeWhatsAppPayload,
  extractTrackingNumber,
} from '../../services/channelService.js';
import {
  findOrCreateThread,
  saveMessage,
} from '../../services/chatService.js';
import { cleanWhatsAppNumber } from '../../services/twilioService.js';

const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'track_webhook_verify_token_123';

/**
 * Handles incoming Telegram Webhook updates
 * POST /api/v1/webhooks/telegram
 */
export const handleTelegramWebhook = async (req, res, next) => {
  try {
    const normalized = normalizeTelegramPayload(req.body);

    if (!normalized || !normalized.text) {
      // Return 200 OK so Telegram doesn't retry non-message updates
      return res.status(200).json({ success: true, message: 'Non-message update ignored.' });
    }

    const { guestId, trackingNumber, channel, externalContactId, text } = normalized;

    // Find or create active thread
    const thread = await findOrCreateThread(guestId, trackingNumber, channel, externalContactId);

    // Save guest message in DB
    const savedMessage = await saveMessage(thread.id, 'guest', text);

    // Broadcast via Socket.IO to support desk
    const io = req.app.get('io');
    if (io) {
      const room = `thread_${thread.id}`;
      io.to(room).emit('receive_message', savedMessage);
      io.emit('admin_chat_activity', {
        threadId: thread.id,
        message: savedMessage,
      });
      io.emit('admin_thread_updated', {
        ...thread,
        last_message: savedMessage.message,
        last_message_sender: savedMessage.sender_type,
        last_message_time: savedMessage.created_at,
        updated_at: savedMessage.created_at,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Telegram message processed successfully.',
      data: {
        threadId: thread.id,
        messageId: savedMessage.id,
      },
    });
  } catch (error) {
    console.error('[Webhook] Error handling Telegram webhook:', error);
    next(error);
  }
};

/**
 * Handles WhatsApp Webhook verification challenge
 * GET /api/v1/webhooks/whatsapp
 */
export const verifyWhatsAppWebhook = (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
    console.log('[Webhook] WhatsApp webhook verified successfully.');
    return res.status(200).send(challenge);
  }

  return res.status(403).json({
    success: false,
    message: 'Verification token mismatch or invalid mode.',
  });
};

/**
 * Handles incoming WhatsApp Cloud API Webhook updates
 * POST /api/v1/webhooks/whatsapp
 */
export const handleWhatsAppWebhook = async (req, res, next) => {
  try {
    const normalized = normalizeWhatsAppPayload(req.body);

    if (!normalized || !normalized.text) {
      return res.status(200).json({ success: true, message: 'Non-message update ignored.' });
    }

    const { guestId, trackingNumber, channel, externalContactId, text } = normalized;

    // Find or create active thread
    const thread = await findOrCreateThread(guestId, trackingNumber, channel, externalContactId);

    // Save message in DB
    const savedMessage = await saveMessage(thread.id, 'guest', text);

    // Broadcast via Socket.IO
    const io = req.app.get('io');
    if (io) {
      const room = `thread_${thread.id}`;
      io.to(room).emit('receive_message', savedMessage);
      io.emit('admin_chat_activity', {
        threadId: thread.id,
        message: savedMessage,
      });
      io.emit('admin_thread_updated', {
        ...thread,
        last_message: savedMessage.message,
        last_message_sender: savedMessage.sender_type,
        last_message_time: savedMessage.created_at,
        updated_at: savedMessage.created_at,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'WhatsApp message processed successfully.',
      data: {
        threadId: thread.id,
        messageId: savedMessage.id,
      },
    });
  } catch (error) {
    console.error('[Webhook] Error handling WhatsApp webhook:', error);
    next(error);
  }
};

/**
 * Handles incoming Twilio WhatsApp / SMS Webhook updates
 * POST /api/v1/webhooks/twilio
 */
export const handleTwilioWebhook = async (req, res, next) => {
  try {
    const from = req.body.From || req.body.from || '';
    const body = req.body.Body || req.body.body || '';
    const profileName = req.body.ProfileName || req.body.profileName || '';

    if (!from || !body.trim()) {
      res.type('text/xml');
      return res.status(200).send('<Response></Response>');
    }

    const cleanContactId = cleanWhatsAppNumber(from) || from;
    const trackingNumber = extractTrackingNumber(body);
    const channel = 'whatsapp';

    // Find or create active thread for this WhatsApp contact
    const thread = await findOrCreateThread(
      cleanContactId,
      trackingNumber,
      channel,
      cleanContactId
    );

    // Save incoming message in database
    const savedMessage = await saveMessage(thread.id, 'guest', body.trim());

    // Broadcast real-time updates over Socket.IO to connected admin clients
    const io = req.app.get('io');
    if (io) {
      const room = `thread_${thread.id}`;
      io.to(room).emit('receive_message', savedMessage);
      io.emit('admin_chat_activity', {
        threadId: thread.id,
        message: savedMessage,
        profileName,
      });
      io.emit('admin_thread_updated', {
        ...thread,
        last_message: savedMessage.message,
        last_message_sender: savedMessage.sender_type,
        last_message_time: savedMessage.created_at,
        updated_at: savedMessage.created_at,
      });
    }

    // Return valid empty TwiML response with HTTP 200 OK
    res.type('text/xml');
    return res.status(200).send('<Response></Response>');
  } catch (error) {
    console.error('[Webhook] Error handling Twilio webhook:', error);
    next(error);
  }
};

export default {
  handleTelegramWebhook,
  verifyWhatsAppWebhook,
  handleWhatsAppWebhook,
  handleTwilioWebhook,
};
