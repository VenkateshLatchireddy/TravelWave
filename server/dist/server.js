"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const database_1 = require("./config/database");
const asyncHandler_1 = require("./middleware/asyncHandler");
const errorHandler_1 = require("./middleware/errorHandler");
const logger_1 = require("./utils/logger");
const rateLimiter_1 = require("./middleware/rateLimiter");
const trip_routes_1 = __importDefault(require("./routes/trip.routes"));
const export_routes_1 = __importDefault(require("./routes/export.routes"));
const trip_controller_1 = require("./controllers/trip.controller");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
const tripController = trip_controller_1.TripController.getInstance();
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    optionsSuccessStatus: 200,
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, compression_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(logger_1.requestLogger);
app.use((0, rateLimiter_1.rateLimiter)({
    windowMs: 15 * 60 * 1000,
    max: 1000,
}));
app.use('/api/auth', auth_routes_1.default);
app.use('/api/trips', trip_routes_1.default);
app.use('/api/export', export_routes_1.default);
app.get('/api/shared/:token', (0, asyncHandler_1.asyncHandler)(tripController.getSharedTrip));
app.get('/health', (_req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: database_1.database.getConnectionStatus() ? 'Connected' : 'Disconnected',
    });
});
app.use('/api/auth', auth_routes_1.default);
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: {
            message: 'Route not found',
            code: 'NOT_FOUND',
        },
    });
});
app.use(errorHandler_1.errorHandler);
const startServer = async () => {
    try {
        await database_1.database.connect();
        const server = app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📚 Health check: http://localhost:${PORT}/health`);
        });
        server.on('error', async (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`Port ${PORT} is already in use. Please free the port or set PORT to another value.`);
            }
            else {
                console.error('Server error:', error);
            }
            await database_1.database.disconnect();
            process.exit(1);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection:', error);
    process.exit(1);
});
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    await database_1.database.disconnect();
    process.exit(0);
});
startServer();
exports.default = app;
//# sourceMappingURL=server.js.map