import {
  findOrCreateThread,
  saveMessage,
  getThreadMessages,
  getThreadById,
} from '../services/chatService.js';
import { sendOutboundMessage } from '../services/channelService.js';
import telegramService from '../services/telegramService.js';
import twilioService from '../services/twilioService.js';

/**
 * Attaches real-time chat event handlers to a socket connection.
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
export const registerChatHandlers = (io, socket) => {
  /**
   * join_thread: For guests to initiate/join a chat thread
   * Accepts guestId & trackingNumber, creates/finds thread,
   * joins room `thread_<thread_id>`, and emits `thread_history` back to the client.
   */
  socket.on('join_thread', async (payload, callback) => {
    try {
      const data = typeof payload === 'string' ? JSON.parse(payload) : (payload || {});
      const { guestId, trackingNumber, channel, externalContactId } = data;

      if (!guestId) {
        const errorResponse = { success: false, error: 'guestId is required' };
        socket.emit('error_message', errorResponse);
        if (typeof callback === 'function') callback(errorResponse);
        return;
      }

      const thread = await findOrCreateThread(
        guestId,
        trackingNumber,
        channel || 'web',
        externalContactId || null
      );
      const room = `thread_${thread.id}`;

      socket.join(room);
      console.log(`[Socket] Guest socket ${socket.id} joined room ${room} for guest ${guestId} via ${thread.channel}`);

      const messages = await getThreadMessages(thread.id);

      const historyData = {
        thread,
        messages,
      };

      // Emit thread history to the requesting client
      socket.emit('thread_history', historyData);

      if (typeof callback === 'function') {
        callback({ success: true, data: historyData });
      }
    } catch (error) {
      console.error('[Socket] Error in join_thread handler:', error);
      const errorResponse = { success: false, error: error.message || 'Failed to join thread' };
      socket.emit('error_message', errorResponse);
      if (typeof callback === 'function') callback(errorResponse);
    }
  });

  /**
   * agent_join_thread: For support agents to join an active thread room
   * Accepts threadId, joins socket to room `thread_<thread_id>`, and emits history.
   */
  socket.on('agent_join_thread', async (payload, callback) => {
    try {
      const data = typeof payload === 'string' ? JSON.parse(payload) : (payload || {});
      const threadId = typeof data === 'number' || typeof data === 'string' ? data : data.threadId;

      if (!threadId) {
        const errorResponse = { success: false, error: 'threadId is required' };
        socket.emit('error_message', errorResponse);
        if (typeof callback === 'function') callback(errorResponse);
        return;
      }

      const threadData = await getThreadById(threadId);

      if (!threadData) {
        const errorResponse = { success: false, error: `Thread ${threadId} not found` };
        socket.emit('error_message', errorResponse);
        if (typeof callback === 'function') callback(errorResponse);
        return;
      }

      const room = `thread_${threadId}`;
      socket.join(room);
      console.log(`[Socket] Support agent socket ${socket.id} joined room ${room}`);

      // Emit thread history to the joining agent
      socket.emit('thread_history', threadData);

      if (typeof callback === 'function') {
        callback({ success: true, data: threadData });
      }
    } catch (error) {
      console.error('[Socket] Error in agent_join_thread handler:', error);
      const errorResponse = { success: false, error: error.message || 'Failed to join thread as agent' };
      socket.emit('error_message', errorResponse);
      if (typeof callback === 'function') callback(errorResponse);
    }
  });

  /**
   * send_message: Accepts threadId, senderType ('guest' | 'support' | 'system'), and message.
   * If agent replies to external channel (telegram, whatsapp), dispatches outbound API first,
   * then saves to database and emits `receive_message` to room `thread_<thread_id>`.
   */
  socket.on('send_message', async (payload, callback) => {
    try {
      const data = typeof payload === 'string' ? JSON.parse(payload) : (payload || {});
      let { threadId, guestId, trackingNumber, channel, externalContactId, senderType = 'guest', message } = data;

      if (!message || !message.trim()) {
        const errorResponse = { success: false, error: 'message is required' };
        socket.emit('error_message', errorResponse);
        if (typeof callback === 'function') callback(errorResponse);
        return;
      }

      // If threadId is not provided, resolve or create thread using guestId
      if (!threadId && guestId) {
        const thread = await findOrCreateThread(
          guestId,
          trackingNumber,
          channel || 'web',
          externalContactId || null
        );
        threadId = thread.id;
        const room = `thread_${threadId}`;
        socket.join(room);
      }

      if (!threadId) {
        const errorResponse = { success: false, error: 'threadId or guestId is required' };
        socket.emit('error_message', errorResponse);
        if (typeof callback === 'function') callback(errorResponse);
        return;
      }

      const validSenderTypes = ['guest', 'support', 'system'];
      const normalizedSenderType = validSenderTypes.includes(senderType) ? senderType : 'guest';
      const cleanMessage = message.trim();
      const numThreadId = parseInt(threadId, 10);

      // Check if thread belongs to an external channel (Telegram, WhatsApp) and message is from Support
      const threadRecord = await getThreadById(numThreadId);
      const thread = threadRecord?.thread;

      if (thread && normalizedSenderType === 'support' && thread.channel && thread.channel !== 'web' && thread.external_contact_id) {
        if (thread.channel === 'telegram') {
          console.log(`[Socket] Dispatching Telegram outbound reply to ${thread.external_contact_id}...`);
          const tgResult = await telegramService.sendMessage(thread.external_contact_id, cleanMessage);
          console.log('[Socket] Telegram dispatch result:', tgResult);
        } else if (thread.channel === 'whatsapp') {
          console.log(`[Socket] Dispatching Twilio WhatsApp outbound reply to ${thread.external_contact_id}...`);
          const waResult = await twilioService.sendWhatsAppMessage(thread.external_contact_id, cleanMessage);
          console.log('[Socket] Twilio WhatsApp dispatch result:', waResult);
        } else {
          console.log(`[Socket] Dispatching outbound reply to ${thread.channel} (${thread.external_contact_id})...`);
          const dispatchResult = await sendOutboundMessage(
            thread.channel,
            thread.external_contact_id,
            cleanMessage
          );
          console.log(`[Socket] Outbound dispatch result for ${thread.channel}:`, dispatchResult);
        }
      }

      // Save message in database
      const savedMessage = await saveMessage(
        numThreadId,
        normalizedSenderType,
        cleanMessage
      );

      const room = `thread_${numThreadId}`;

      // Broadcast receive_message to all clients in the thread room
      io.to(room).emit('receive_message', savedMessage);
      console.log(`[Socket] Message broadcasted to ${room} by ${normalizedSenderType}: ${savedMessage.id}`);

      // Notify global admin dashboard of chat activity
      io.emit('admin_chat_activity', {
        threadId: numThreadId,
        message: savedMessage,
      });

      if (thread) {
        io.emit('admin_thread_updated', {
          ...thread,
          last_message: savedMessage.message,
          last_message_sender: savedMessage.sender_type,
          last_message_time: savedMessage.created_at,
          updated_at: savedMessage.created_at,
        });
      }

      if (typeof callback === 'function') {
        callback({ success: true, data: savedMessage });
      }
    } catch (error) {
      console.error('[Socket] Error in send_message handler:', error);
      const errorResponse = { success: false, error: error.message || 'Failed to send message' };
      socket.emit('error_message', errorResponse);
      if (typeof callback === 'function') callback(errorResponse);
    }
  });
};

export default registerChatHandlers;
