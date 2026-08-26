import axios from 'axios';
import dotenv from 'dotenv';
import telegramService from './telegramService.js';
import twilioService from './twilioService.js';

dotenv.config();

const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || '';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';

/**
 * Extracts a tracking number from text message (e.g. TRK-1001, TRK-2024-XXXX, TRK123456789)
 * @param {string} text
 * @returns {string|null}
 */
export const extractTrackingNumber = (text) => {
  if (!text || typeof text !== 'string') return null;
  const match = text.match(/\b(TRK(?:[-_]?[A-Z0-9]+)+)\b/i);
  return match ? match[1].toUpperCase() : null;
};

/**
 * Normalizes an inbound Telegram Bot Webhook payload
 * @param {Object} body - Telegram webhook body
 * @returns {Object|null}
 */
export const normalizeTelegramPayload = (body) => {
  if (!body) return null;

  const message =
    body.message ||
    body.edited_message ||
    body.channel_post ||
    (body.chat && body.text ? body : null);
  if (!message || !message.text) return null;

  const chatId = message.chat ? message.chat.id.toString() : (body.chat_id ? body.chat_id.toString() : '');
  const fromUser = message.from || {};
  const senderName = [fromUser.first_name, fromUser.last_name].filter(Boolean).join(' ') || fromUser.username || `Telegram User (${chatId})`;
  const text = message.text.trim();
  const trackingNumber = extractTrackingNumber(text);

  return {
    channel: 'telegram',
    externalContactId: chatId,
    guestId: `tg_${chatId}`,
    senderName,
    text,
    trackingNumber,
    rawPayload: body,
  };
};

/**
 * Normalizes an inbound WhatsApp Cloud API / Meta Webhook payload
 * @param {Object} body - WhatsApp webhook body
 * @returns {Object|null}
 */
export const normalizeWhatsAppPayload = (body) => {
  if (!body || !body.entry || !body.entry[0]) return null;

  const change = body.entry[0].changes && body.entry[0].changes[0];
  const value = change ? change.value : null;

  if (!value || !value.messages || !value.messages[0]) return null;

  const message = value.messages[0];
  const contact = (value.contacts && value.contacts[0]) || {};
  const fromPhone = message.from; // Phone number (e.g. "15551234567")
  const senderName = contact.profile ? contact.profile.name : `WhatsApp (${fromPhone})`;

  let text = '';
  if (message.type === 'text' && message.text) {
    text = message.text.body;
  } else if (message.type === 'button' && message.button) {
    text = message.button.text;
  } else if (message.type === 'interactive' && message.interactive) {
    text = message.interactive.button_reply?.title || message.interactive.list_reply?.title || '';
  }

  if (!text) return null;

  const trackingNumber = extractTrackingNumber(text);

  return {
    channel: 'whatsapp',
    externalContactId: fromPhone,
    guestId: `wa_${fromPhone}`,
    senderName,
    text: text.trim(),
    trackingNumber,
    rawPayload: body,
  };
};

/**
 * Sends an outbound message to external channel adapter (Telegram, WhatsApp)
 * @param {string} channel - 'telegram' | 'whatsapp' | 'web'
 * @param {string} externalContactId - Telegram chat_id or WhatsApp phone number
 * @param {string} text - Message body
 * @returns {Promise<{ success: boolean, externalMessageId?: string, error?: string }>}
 */
export const sendOutboundMessage = async (channel, externalContactId, text) => {
  if (!channel || !externalContactId || !text) {
    return { success: false, error: 'Missing channel, externalContactId, or text' };
  }

  const normalizedChannel = channel.toLowerCase();

  // 1. Telegram Dispatch
  if (normalizedChannel === 'telegram') {
    const result = await telegramService.sendMessage(externalContactId, text);
    return {
      success: result.success,
      externalMessageId: result.data?.message_id?.toString(),
      error: result.error,
    };
  }

  // 2. WhatsApp Outbound Dispatch (Twilio / Meta API)
  if (normalizedChannel === 'whatsapp') {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      const twResult = await twilioService.sendWhatsAppMessage(externalContactId, text);
      return {
        success: twResult.success,
        externalMessageId: twResult.data?.sid,
        error: twResult.error,
      };
    }

    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
      console.log(`[ChannelService] WhatsApp API credentials not configured. Simulated dispatch to WhatsApp ${externalContactId}: "${text}"`);
      return { success: true, externalMessageId: `sim_wa_${Date.now()}` };
    }

    try {
      const url = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
      const response = await axios.post(
        url,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: externalContactId,
          type: 'text',
          text: { body: text },
        },
        {
          headers: {
            Authorization: `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return {
        success: true,
        externalMessageId: response.data?.messages?.[0]?.id,
      };
    } catch (err) {
      console.error('[ChannelService] Error dispatching WhatsApp message:', err.response?.data || err.message);
      return { success: false, error: err.response?.data?.error?.message || err.message };
    }
  }

  return { success: true, externalMessageId: `local_${Date.now()}` };
};

export default {
  extractTrackingNumber,
  normalizeTelegramPayload,
  normalizeWhatsAppPayload,
  sendOutboundMessage,
};
