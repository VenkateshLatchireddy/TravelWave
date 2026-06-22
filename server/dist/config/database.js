"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = require("../utils/logger");
class Database {
    static instance;
    isConnected = false;
    constructor() { }
    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
    async connect() {
        if (this.isConnected) {
            logger_1.logger.info('Database already connected');
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
            logger_1.logger.warn('MONGODB_URI not set; defaulting to local MongoDB URI.', {
                fallbackUri: defaultLocalUri,
            });
        }
        else if (placeholderPattern.test(configuredUri)) {
            logger_1.logger.warn('MONGODB_URI contains placeholder values; using local MongoDB fallback.', {
                placeholderUri: configuredUri,
                fallbackUri: defaultLocalUri,
            });
        }
        try {
            const options = {
                autoIndex: true,
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                family: 4,
            };
            try {
                await mongoose_1.default.connect(mongoUri, options);
            }
            catch (error) {
                if (shouldUseConfiguredUri && mongoUri !== defaultLocalUri) {
                    logger_1.logger.warn('Configured MongoDB connection failed; trying local MongoDB fallback.', {
                        fallbackUri: defaultLocalUri,
                    });
                    await mongoose_1.default.connect(defaultLocalUri, options);
                }
                else {
                    throw error;
                }
            }
            this.isConnected = true;
            mongoose_1.default.connection.on('error', (error) => {
                logger_1.logger.error('MongoDB connection error:', error);
                this.isConnected = false;
            });
            mongoose_1.default.connection.on('disconnected', () => {
                logger_1.logger.warn('MongoDB disconnected');
                this.isConnected = false;
            });
            mongoose_1.default.connection.on('reconnected', () => {
                logger_1.logger.info('MongoDB reconnected');
                this.isConnected = true;
            });
            logger_1.logger.info('MongoDB connected successfully');
        }
        catch (error) {
            logger_1.logger.error('Failed to connect to MongoDB:', error);
            throw error;
        }
    }
    async disconnect() {
        if (!this.isConnected) {
            return;
        }
        try {
            await mongoose_1.default.disconnect();
            this.isConnected = false;
            logger_1.logger.info('MongoDB disconnected successfully');
        }
        catch (error) {
            logger_1.logger.error('Error disconnecting from MongoDB:', error);
            throw error;
        }
    }
    getConnectionStatus() {
        return this.isConnected;
    }
}
exports.database = Database.getInstance();
//# sourceMappingURL=database.js.map