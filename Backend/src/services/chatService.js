import { query } from '../config/db.js';

/**
 * Finds an existing active thread for guest_id / external_contact_id or creates a new chat_threads entry.
 * @param {string} guestId
 * @param {string} [trackingNumber]
 * @param {string} [channel='web']
 * @param {string} [externalContactId]
 * @returns {Promise<Object>}
 */
export const findOrCreateThread = async (
  guestId,
  trackingNumber = null,
  channel = 'web',
  externalContactId = null
) => {
  const normalizedChannel = channel ? channel.toLowerCase() : 'web';
  const resolvedExternalContactId =
    externalContactId || (normalizedChannel !== 'web' && guestId ? guestId.toString() : null);

  let existingThread = null;

  // 1. If external_contact_id and channel are provided, lookup by external identifier
  if (resolvedExternalContactId) {
    const externalQuery = `
      SELECT id, guest_id, tracking_number, channel, external_contact_id, status, created_at, updated_at
      FROM chat_threads
      WHERE external_contact_id = $1 AND channel = $2 AND status != 'closed'
      ORDER BY created_at DESC
      LIMIT 1;
    `;
    const extResult = await query(externalQuery, [resolvedExternalContactId, normalizedChannel]);
    if (extResult.rows.length > 0) {
      existingThread = extResult.rows[0];
    }
  }

  // 2. Fallback to lookup by guest_id
  if (!existingThread && guestId) {
    const guestQuery = `
      SELECT id, guest_id, tracking_number, channel, external_contact_id, status, created_at, updated_at
      FROM chat_threads
      WHERE guest_id = $1 AND status != 'closed'
      ORDER BY created_at DESC
      LIMIT 1;
    `;
    const guestResult = await query(guestQuery, [guestId]);
    if (guestResult.rows.length > 0) {
      existingThread = guestResult.rows[0];
    }
  }

  // If existing thread was found, sync tracking number or externalContactId if needed
  if (existingThread) {
    let needsUpdate = false;
    let newTrackingNumber = existingThread.tracking_number;
    let newExternalContactId = existingThread.external_contact_id;

    if (trackingNumber && existingThread.tracking_number !== trackingNumber) {
      newTrackingNumber = trackingNumber;
      needsUpdate = true;
    }

    if (resolvedExternalContactId && !existingThread.external_contact_id) {
      newExternalContactId = resolvedExternalContactId;
      needsUpdate = true;
    }

    if (needsUpdate) {
      const updateResult = await query(
        `UPDATE chat_threads 
         SET tracking_number = $1, external_contact_id = $2, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $3 
         RETURNING *;`,
        [newTrackingNumber, newExternalContactId, existingThread.id]
      );
      return updateResult.rows[0];
    }

    return existingThread;
  }

  // 3. Create new thread
  const createThreadQuery = `
    INSERT INTO chat_threads (guest_id, tracking_number, channel, external_contact_id, status)
    VALUES ($1, $2, $3, $4, 'open')
    RETURNING id, guest_id, tracking_number, channel, external_contact_id, status, created_at, updated_at;
  `;

  const newThreadResult = await query(createThreadQuery, [
    guestId,
    trackingNumber || null,
    normalizedChannel,
    resolvedExternalContactId || null,
  ]);

  return newThreadResult.rows[0];
};

/**
 * Inserts a message record into chat_messages and updates thread timestamp.
 * @param {number} threadId
 * @param {string} senderType - 'guest' | 'support' | 'system'
 * @param {string} message
 * @returns {Promise<Object>}
 */
export const saveMessage = async (threadId, senderType, message) => {
  const insertMessageQuery = `
    INSERT INTO chat_messages (thread_id, sender_type, message)
    VALUES ($1, $2, $3)
    RETURNING id, thread_id, sender_type, message, created_at;
  `;

  const messageResult = await query(insertMessageQuery, [threadId, senderType, message]);

  // Update thread's updated_at timestamp
  await query('UPDATE chat_threads SET updated_at = CURRENT_TIMESTAMP WHERE id = $1;', [threadId]);

  return messageResult.rows[0];
};

/**
 * Returns message history for a given thread ordered by created_at ASC.
 * @param {number} threadId
 * @returns {Promise<Array>}
 */
export const getThreadMessages = async (threadId) => {
  const messagesQuery = `
    SELECT id, thread_id, sender_type, message, created_at
    FROM chat_messages
    WHERE thread_id = $1
    ORDER BY created_at ASC;
  `;

  const result = await query(messagesQuery, [threadId]);
  return result.rows;
};

/**
 * Retrieves chat history (thread and messages) for a given guestId.
 * @param {string} guestId
 * @returns {Promise<Object>}
 */
export const getChatHistoryByGuestId = async (guestId) => {
  const threadQuery = `
    SELECT id, guest_id, tracking_number, channel, external_contact_id, status, created_at, updated_at
    FROM chat_threads
    WHERE guest_id = $1
    ORDER BY created_at DESC
    LIMIT 1;
  `;

  const threadResult = await query(threadQuery, [guestId]);

  if (threadResult.rows.length === 0) {
    return {
      thread: null,
      messages: [],
    };
  }

  const thread = threadResult.rows[0];
  const messages = await getThreadMessages(thread.id);

  return {
    thread,
    messages,
  };
};

/**
 * Returns a specific thread and its message history by threadId.
 * @param {number|string} threadId
 * @returns {Promise<Object|null>}
 */
export const getThreadById = async (threadId) => {
  const threadResult = await query(
    'SELECT id, guest_id, tracking_number, channel, external_contact_id, status, created_at, updated_at FROM chat_threads WHERE id = $1;',
    [threadId]
  );

  if (threadResult.rows.length === 0) {
    return null;
  }

  const thread = threadResult.rows[0];
  const messages = await getThreadMessages(thread.id);

  return {
    thread,
    messages,
  };
};

/**
 * Fetches chat threads optionally filtered by status ('open' | 'closed'), joined with the latest message and timestamp.
 * @param {string} [status]
 * @returns {Promise<Array>}
 */
export const getAllThreads = async (status = null) => {
  const threadsQuery = `
    SELECT 
      ct.id,
      ct.guest_id,
      ct.tracking_number,
      ct.channel,
      ct.external_contact_id,
      ct.status,
      ct.created_at,
      ct.updated_at,
      lm.message AS last_message,
      lm.sender_type AS last_message_sender,
      lm.created_at AS last_message_time,
      COALESCE(mc.message_count, 0) AS total_messages
    FROM chat_threads ct
    LEFT JOIN LATERAL (
      SELECT message, sender_type, created_at
      FROM chat_messages
      WHERE thread_id = ct.id
      ORDER BY created_at DESC
      LIMIT 1
    ) lm ON true
    LEFT JOIN LATERAL (
      SELECT COUNT(*) AS message_count
      FROM chat_messages
      WHERE thread_id = ct.id
    ) mc ON true
    WHERE ($1::text IS NULL OR ct.status = $1)
    ORDER BY ct.updated_at DESC;
  `;

  const filterStatus = status ? status.toLowerCase() : null;
  const result = await query(threadsQuery, [filterStatus]);
  return result.rows;
};

/**
 * Updates chat_threads status to 'open' or 'closed'.
 * @param {number|string} threadId
 * @param {string} status - 'open' | 'closed'
 * @returns {Promise<Object>}
 */
export const updateThreadStatus = async (threadId, status) => {
  const checkResult = await query('SELECT * FROM chat_threads WHERE id = $1;', [threadId]);

  if (checkResult.rows.length === 0) {
    const error = new Error(`Chat thread with ID ${threadId} not found.`);
    error.status = 404;
    throw error;
  }

  const updateResult = await query(
    `UPDATE chat_threads 
     SET status = $1, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $2 
     RETURNING id, guest_id, tracking_number, channel, external_contact_id, status, created_at, updated_at;`,
    [status, threadId]
  );

  return updateResult.rows[0];
};

export default {
  findOrCreateThread,
  saveMessage,
  getThreadMessages,
  getChatHistoryByGuestId,
  getThreadById,
  getAllThreads,
  updateThreadStatus,
};
