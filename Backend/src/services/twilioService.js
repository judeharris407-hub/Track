import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Normalizes phone number into Twilio WhatsApp format: "whatsapp:+1234567890"
 * @param {string} phone
 * @returns {string}
 */
export const formatWhatsAppNumber = (phone) => {
  if (!phone) return '';
  let cleaned = phone.trim();
  if (cleaned.startsWith('whatsapp:')) {
    return cleaned;
  }
  if (!cleaned.startsWith('+')) {
    cleaned = `+${cleaned}`;
  }
  return `whatsapp:${cleaned}`;
};

/**
 * Strips the "whatsapp:" prefix and non-numeric chars (except leading +)
 * @param {string} phone
 * @returns {string}
 */
export const cleanWhatsAppNumber = (phone) => {
  if (!phone) return '';
  return phone.replace(/^whatsapp:/i, '').trim();
};

/**
 * Sends an outbound WhatsApp message via Twilio REST API
 * @param {string} to - Destination phone number (with or without 'whatsapp:' prefix)
 * @param {string} body - Message body
 * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
 */
export const sendWhatsAppMessage = async (to, body) => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

  if (!to || !body) {
    return { success: false, error: 'Recipient phone number (to) and body are required' };
  }

  const formattedTo = formatWhatsAppNumber(to);

  // Simulation mode if credentials are placeholder or missing
  if (
    !accountSid ||
    !authToken ||
    accountSid === 'your_account_sid' ||
    authToken === 'your_auth_token'
  ) {
    console.log(
      `[TwilioService] Twilio credentials not configured. Simulated dispatch to WhatsApp ${formattedTo}: "${body}"`
    );
    return {
      success: true,
      data: {
        sid: `sim_tw_${Date.now()}`,
        to: formattedTo,
        from: fromNumber,
        body,
        status: 'queued',
      },
    };
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const params = new URLSearchParams();
    params.append('From', fromNumber);
    params.append('To', formattedTo);
    params.append('Body', body);

    const authHeader = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const response = await axios.post(url, params.toString(), {
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    const errorDetails = error.response?.data || error.message;
    console.error(`[TwilioService] Error sending WhatsApp message to ${formattedTo}:`, errorDetails);
    return {
      success: false,
      error: error.response?.data?.message || error.message,
    };
  }
};

export default {
  sendWhatsAppMessage,
  formatWhatsAppNumber,
  cleanWhatsAppNumber,
};
