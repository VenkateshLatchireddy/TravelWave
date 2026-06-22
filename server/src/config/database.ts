import mongoose from 'mongoose';
import { logger } from '../utils/logger';

class Database {
  private static instance: Database;
  private isConnected = false;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async connect(): Promise<void> {
    if (this.isConnected) {
      logger.info('Database already connected');
      return;
    }

    const configuredUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    const placeholderPattern = /<username>|<password>|cluster\.mongodb\.net/;
    const defaultLocalUri = 'mongodb://127.0.0.1:27017/travelwave';
    const shouldUseConfiguredUri = configuredUri && !placeholderPattern.test(configuredUri);
    const mongoUri = shouldUseConfiguredUri
      ? configuredUri
      : defaultLocalUri;

    if (!configuredUri) {
      logger.warn('MONGODB_URI not set; defaulting to local MongoDB URI.', {
        fallbackUri: defaultLocalUri,
      });
    } else if (placeholderPattern.test(configuredUri)) {
      logger.warn('MONGODB_URI contains placeholder values; using local MongoDB fallback.', {
        placeholderUri: configuredUri,
        fallbackUri: defaultLocalUri,
      });
    }

    try {
      const options: mongoose.ConnectOptions = {
        autoIndex: true,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4,
      };

      try {
        await mongoose.connect(mongoUri, options);
      } catch (error) {
        if (shouldUseConfiguredUri && mongoUri !== defaultLocalUri) {
          logger.warn('Configured MongoDB connection failed; trying local MongoDB fallback.', {
            fallbackUri: defaultLocalUri,
          });
          await mongoose.connect(defaultLocalUri, options);
        } else {
          throw error;
        }
      }

      this.isConnected = true;

      mongoose.connection.on('error', (error) => {
        logger.error('MongoDB connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        logger.warn('MongoDB disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        logger.info('MongoDB reconnected');
        this.isConnected = true;
      });

      logger.info('MongoDB connected successfully');
    } catch (error) {
      logger.error('Failed to connect to MongoDB:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    try {
      await mongoose.disconnect();
      this.isConnected = false;
      logger.info('MongoDB disconnected successfully');
    } catch (error) {
      logger.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export const database = Database.getInstance();
