import { registerChatHandlers } from './chatHandler.js';

export const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket client connected: ${socket.id}`);

    // Register chat event handlers (join_thread, send_message)
    registerChatHandlers(io, socket);

    socket.on('subscribe_tracking', (trackingNumber) => {
      socket.join(`track_${trackingNumber}`);
      console.log(`Socket ${socket.id} subscribed to track_${trackingNumber}`);
    });

    socket.on('disconnect', () => {
      console.log(`Socket client disconnected: ${socket.id}`);
    });
  });
};
