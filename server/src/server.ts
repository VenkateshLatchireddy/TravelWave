import 'dotenv/config';
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { database } from './config/database';
import { asyncHandler } from './middleware/asyncHandler';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './utils/logger';
import { rateLimiter } from './middleware/rateLimiter';

import tripRoutes from './routes/trip.routes';
import exportRoutes from './routes/export.routes';
import { TripController } from './controllers/trip.controller';


import authRoutes from './routes/auth.routes';
// We'll add more routes as we progress

const app: Express = express();
const PORT = process.env.PORT || 5000;


const tripController = TripController.getInstance();

// Security middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://travel-wave-eta.vercel.app',
  'https://travelwave.vercel.app',
  process.env.FRONTEND_URL,
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('dev'));
app.use(requestLogger);

// Global rate limiter
app.use(rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 1000,
}));

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/export', exportRoutes);
app.get('/api/shared/:token', asyncHandler(tripController.getSharedTrip));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: database.getConnectionStatus() ? 'Connected' : 'Disconnected',
  });
});

// API routes
app.use('/api/auth', authRoutes);
// app.use('/api/trips', tripRoutes); // We'll add this in next step

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      code: 'NOT_FOUND',
    },
  });
});

// Global error handler
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await database.connect();

    // Start express server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 Health check: http://localhost:${PORT}/health`);
    });

    server.on('error', async (error: any) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Please free the port or set PORT to another value.`);
      } else {
        console.error('Server error:', error);
      }
      await database.disconnect();
      process.exit(1);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await database.disconnect();
  process.exit(0);
});

startServer();

export default app;
