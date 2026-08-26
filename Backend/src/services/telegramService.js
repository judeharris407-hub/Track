import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

/**
 * Sends an outbound message to a Telegram chat using Telegram Bot API
 * @param {string|number} chatId - Telegram chat ID
 * @param {string} text - Message content to send
 * @param {Object} [options={}] - Additional Telegram sendMessage options (e.g. parse_mode)
 * @returns {Promise<{ success: boolean, data?: any, error?: string }>}
 */
export const sendMessage = async (chatId, text, options = {}) => {
  if (!chatId || !text) {
    return { success: false, error: 'chatId and text are required' };
  }

  const token = process.env.TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN;

  if (!token || token === 'your_token_here') {
    console.log(
      `[TelegramService] TELEGRAM_BOT_TOKEN is not configured. Simulated dispatch to Telegram Chat ${chatId}: "${text}"`
    );
    return {
      success: true,
      data: {
        message_id: `sim_tg_${Date.now()}`,
        chat: { id: chatId },
        text,
      },
    };
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const payload = {
      chat_id: chatId,
      text,
      parse_mode: options.parse_mode || 'HTML',
      ...options,
    };

    const response = await axios.post(url, payload);

    return {
      success: true,
      data: response.data?.result,
    };
  } catch (error) {
    const errorDetails = error.response?.data || error.message;
    console.error(`[TelegramService] Failed to send message to Telegram chat ${chatId}:`, errorDetails);
    return {
      success: false,
      error: error.response?.data?.description || error.message,
    };
  }
};

export default {
  sendMessage,
};
