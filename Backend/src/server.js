import http from 'http';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import app from './app.js';
import pool from './config/db.js';
import initDb from './config/initDb.js';
import { initSocket } from './sockets/index.js';

dotenv.config();

const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

// Create HTTP server
const server = http.createServer(app);

// Integrate Socket.IO with CORS settings
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Attach Socket.IO to express app so routes can emit events if needed
app.set('io', io);

// Initialize Socket.IO connection handlers
initSocket(io);

// Initialize database schema and start server
const startServer = async () => {
  try {
    await initDb();
  } catch (err) {
    console.warn('Database initialization notice:', err.message);
  }

  // Start HTTP & WebSocket server
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Socket.IO listening for connections from ${CLIENT_URL}`);
  });
};

startServer();

export { server, io };
