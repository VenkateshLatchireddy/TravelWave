"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripController = void 0;
const Trip_1 = require("../models/Trip");
const gemini_service_1 = require("../services/gemini.service");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
class TripController {
    static instance;
    geminiService;
    constructor() {
        this.geminiService = gemini_service_1.GeminiService.getInstance();
    }
    static getInstance() {
        if (!TripController.instance) {
            TripController.instance = new TripController();
        }
        return TripController.instance;
    }
    generateTrip = async (req, res) => {
        try {
            const { destination, durationDays, budgetTier, interests, travelDates } = req.body;
            const userId = req.user.userId;
            logger_1.logger.info(`Generating trip for user ${userId} to ${destination}`);
            const aiResponse = await this.geminiService.generateTripPlan({
                destination,
                durationDays,
                budgetTier,
                interests: interests || [],
                travelDates,
            });
            const trip = new Trip_1.Trip({
                userId,
                destination,
                durationDays,
                budgetTier,
                interests: interests || [],
                travelDates: travelDates || {},
                itinerary: aiResponse.itinerary,
                hotels: aiResponse.hotels,
                estimatedBudget: aiResponse.estimatedBudget,
                packingList: aiResponse.packingList,
                status: 'Generated',
                isPublic: false,
                viewCount: 0,
            });
            await trip.save();
            res.status(201).json({
                success: true,
                data: trip,
                message: 'Trip generated successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Trip generation error:', error);
            throw error;
        }
    };
    getTrips = async (req, res) => {
        try {
            const userId = req.user.userId;
            const { status, limit = 10, page = 1 } = req.query;
            const query = { userId };
            if (status) {
                query.status = status;
            }
            const skip = (Number(page) - 1) * Number(limit);
            const [trips, total] = await Promise.all([
                Trip_1.Trip.find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(Number(limit)),
                Trip_1.Trip.countDocuments(query),
            ]);
            res.status(200).json({
                success: true,
                data: {
                    trips,
                    pagination: {
                        page: Number(page),
                        limit: Number(limit),
                        total,
                        pages: Math.ceil(total / Number(limit)),
                    },
                },
            });
        }
        catch (error) {
            logger_1.logger.error('Get trips error:', error);
            throw error;
        }
    };
    getTripById = async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            const trip = await Trip_1.Trip.findOne({ _id: id, userId });
            if (!trip) {
                throw new errors_1.NotFoundError('Trip not found');
            }
            trip.viewCount += 1;
            await trip.save();
            res.status(200).json({
                success: true,
                data: trip,
            });
        }
        catch (error) {
            logger_1.logger.error('Get trip by id error:', error);
            throw error;
        }
    };
    updateTrip = async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            const trip = await Trip_1.Trip.findOne({ _id: id, userId });
            if (!trip) {
                throw new errors_1.NotFoundError('Trip not found');
            }
            const updates = req.body;
            if (updates.itinerary) {
                trip.itinerary = updates.itinerary;
                trip.status = 'Modified';
            }
            if (updates.hotels) {
                trip.hotels = updates.hotels;
            }
            if (updates.estimatedBudget) {
                trip.estimatedBudget = {
                    ...trip.estimatedBudget,
                    ...updates.estimatedBudget,
                };
            }
            if (updates.packingList) {
                trip.packingList = updates.packingList;
            }
            if (updates.isPublic !== undefined) {
                trip.isPublic = updates.isPublic;
            }
            if (updates.interests) {
                trip.interests = updates.interests;
            }
            await trip.save();
            res.status(200).json({
                success: true,
                data: trip,
                message: 'Trip updated successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Update trip error:', error);
            throw error;
        }
    };
    deleteTrip = async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            const trip = await Trip_1.Trip.findOneAndDelete({ _id: id, userId });
            if (!trip) {
                throw new errors_1.NotFoundError('Trip not found');
            }
            res.status(200).json({
                success: true,
                message: 'Trip deleted successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Delete trip error:', error);
            throw error;
        }
    };
    addActivity = async (req, res) => {
        try {
            const { id } = req.params;
            const { dayNumber, activity } = req.body;
            const userId = req.user.userId;
            if (!dayNumber || !activity) {
                throw new errors_1.ValidationError('Day number and activity are required');
            }
            const trip = await Trip_1.Trip.findOne({ _id: id, userId });
            if (!trip) {
                throw new errors_1.NotFoundError('Trip not found');
            }
            const day = trip.itinerary.find(d => d.dayNumber === dayNumber);
            if (!day) {
                throw new errors_1.NotFoundError(`Day ${dayNumber} not found`);
            }
            activity.isCustom = true;
            day.activities.push(activity);
            trip.status = 'Modified';
            await trip.save();
            res.status(200).json({
                success: true,
                data: trip,
                message: 'Activity added successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Add activity error:', error);
            throw error;
        }
    };
    removeActivity = async (req, res) => {
        try {
            const { id } = req.params;
            const { dayNumber, activityIndex } = req.body;
            const userId = req.user.userId;
            if (dayNumber === undefined || activityIndex === undefined) {
                throw new errors_1.ValidationError('Day number and activity index are required');
            }
            const trip = await Trip_1.Trip.findOne({ _id: id, userId });
            if (!trip) {
                throw new errors_1.NotFoundError('Trip not found');
            }
            const day = trip.itinerary.find(d => d.dayNumber === dayNumber);
            if (!day) {
                throw new errors_1.NotFoundError(`Day ${dayNumber} not found`);
            }
            if (activityIndex < 0 || activityIndex >= day.activities.length) {
                throw new errors_1.ValidationError('Invalid activity index');
            }
            day.activities.splice(activityIndex, 1);
            trip.status = 'Modified';
            await trip.save();
            res.status(200).json({
                success: true,
                data: trip,
                message: 'Activity removed successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Remove activity error:', error);
            throw error;
        }
    };
    regenerateDay = async (req, res) => {
        try {
            const { id } = req.params;
            const { dayNumber, feedback } = req.body;
            const userId = req.user.userId;
            if (!dayNumber) {
                throw new errors_1.ValidationError('Day number is required');
            }
            const trip = await Trip_1.Trip.findOne({ _id: id, userId });
            if (!trip) {
                throw new errors_1.NotFoundError('Trip not found');
            }
            const dayIndex = trip.itinerary.findIndex(d => d.dayNumber === dayNumber);
            if (dayIndex === -1) {
                throw new errors_1.NotFoundError(`Day ${dayNumber} not found`);
            }
            const aiResponse = await this.geminiService.regenerateSpecificDay(trip, dayNumber, feedback || 'Make it more interesting');
            trip.itinerary[dayIndex] = {
                ...trip.itinerary[dayIndex],
                ...aiResponse,
            };
            trip.status = 'Modified';
            await trip.save();
            res.status(200).json({
                success: true,
                data: trip,
                message: `Day ${dayNumber} regenerated successfully`,
            });
        }
        catch (error) {
            logger_1.logger.error('Regenerate day error:', error);
            throw error;
        }
    };
    updatePackingList = async (req, res) => {
        try {
            const { id } = req.params;
            const { packingList } = req.body;
            const userId = req.user.userId;
            if (!packingList || !Array.isArray(packingList)) {
                throw new errors_1.ValidationError('Valid packing list is required');
            }
            const trip = await Trip_1.Trip.findOne({ _id: id, userId });
            if (!trip) {
                throw new errors_1.NotFoundError('Trip not found');
            }
            trip.packingList = packingList;
            await trip.save();
            res.status(200).json({
                success: true,
                data: trip,
                message: 'Packing list updated successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Update packing list error:', error);
            throw error;
        }
    };
    togglePackingItem = async (req, res) => {
        try {
            const { id } = req.params;
            const { itemId } = req.params;
            const userId = req.user.userId;
            const trip = await Trip_1.Trip.findOne({ _id: id, userId });
            if (!trip) {
                throw new errors_1.NotFoundError('Trip not found');
            }
            const item = trip.packingList.find(p => p._id?.toString() === itemId);
            if (!item) {
                throw new errors_1.NotFoundError('Packing item not found');
            }
            item.isPacked = !item.isPacked;
            await trip.save();
            res.status(200).json({
                success: true,
                data: trip,
                message: `Packing item ${item.isPacked ? 'checked' : 'unchecked'} successfully`,
            });
        }
        catch (error) {
            logger_1.logger.error('Toggle packing item error:', error);
            throw error;
        }
    };
    generatePackingList = async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            const trip = await Trip_1.Trip.findOne({ _id: id, userId });
            if (!trip) {
                throw new errors_1.NotFoundError('Trip not found');
            }
            const newPackingList = await this.geminiService.generatePackingList(trip);
            if (newPackingList.length === 0) {
                throw new errors_1.ValidationError('Could not generate packing list. Please try again.');
            }
            trip.packingList = newPackingList;
            await trip.save();
            res.status(200).json({
                success: true,
                data: trip,
                message: 'Packing list regenerated successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Generate packing list error:', error);
            throw error;
        }
    };
    shareTrip = async (req, res) => {
        try {
            const { id } = req.params;
            const userId = req.user.userId;
            const trip = await Trip_1.Trip.findOne({ _id: id, userId });
            if (!trip) {
                throw new errors_1.NotFoundError('Trip not found');
            }
            const shareToken = require('crypto').randomBytes(16).toString('hex');
            trip.shareToken = shareToken;
            trip.isPublic = true;
            await trip.save();
            const shareUrl = `${process.env.FRONTEND_URL}/shared/${shareToken}`;
            res.status(200).json({
                success: true,
                data: {
                    shareUrl,
                    shareToken: trip.shareToken,
                },
                message: 'Trip shared successfully',
            });
        }
        catch (error) {
            logger_1.logger.error('Share trip error:', error);
            throw error;
        }
    };
    getSharedTrip = async (req, res) => {
        try {
            const { token } = req.params;
            const trip = await Trip_1.Trip.findOne({ shareToken: token, isPublic: true });
            if (!trip) {
                throw new errors_1.NotFoundError('Shared trip not found');
            }
            trip.viewCount += 1;
            await trip.save();
            const tripData = trip.toJSON();
            delete tripData.userId;
            res.status(200).json({
                success: true,
                data: tripData,
            });
        }
        catch (error) {
            logger_1.logger.error('Get shared trip error:', error);
            throw error;
        }
    };
}
exports.TripController = TripController;
//# sourceMappingURL=trip.controller.js.map