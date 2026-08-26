import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import createError from 'http-errors';
import dotenv from 'dotenv';
import trackingRoutes from './routes/tracking.js';
import publicRoutes from './routes/publicRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import { globalRateLimiter } from './middleware/rateLimiter.js';
import errorHandler from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// Parse strict allowed origins from process.env.ALLOWED_ORIGINS (default: http://localhost:3000)
const rawOrigins =
  process.env.ALLOWED_ORIGINS ||
  process.env.CLIENT_URL ||
  'http://localhost:3000';

const allowedOrigins = rawOrigins
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// 1. Helmet HTTP Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 2. Strict CORS Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, webhooks) or whitelisted domains
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// 3. Body Parsing Middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 4. HTTP Parameter Pollution (HPP) Protection
app.use(hpp());

// 5. Cookie Parser
app.use(cookieParser());

// 6. Global API Rate Limiter
app.use('/api', globalRateLimiter);

// Base health check route
app.get('/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/track', trackingRoutes);
app.use('/api/v1/webhooks', webhookRoutes);

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404, 'Endpoint not found'));
});

// 7. Global Centralized Error Handling Middleware
app.use(errorHandler);

export default app;
