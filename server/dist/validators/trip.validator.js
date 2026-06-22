"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRegenerateDay = exports.validateRemoveActivity = exports.validateAddActivity = exports.validateTripUpdate = exports.validateTripGeneration = exports.regenerateDaySchema = exports.removeActivitySchema = exports.addActivitySchema = exports.tripUpdateSchema = exports.tripGenerationSchema = exports.packingItemSchema = exports.estimatedBudgetSchema = exports.hotelSchema = exports.itineraryDaySchema = exports.activitySchema = void 0;
const zod_1 = require("zod");
exports.activitySchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Activity title is required'),
    description: zod_1.z.string().optional(),
    estimatedCostINR: zod_1.z.number().min(0, 'Cost cannot be negative').default(0),
    timeOfDay: zod_1.z.enum(['Morning', 'Afternoon', 'Evening']).optional(),
    location: zod_1.z.string().optional(),
    duration: zod_1.z.string().optional(),
    isCustom: zod_1.z.boolean().default(false),
});
exports.itineraryDaySchema = zod_1.z.object({
    dayNumber: zod_1.z.number().int().positive('Day number must be positive'),
    title: zod_1.z.string().optional(),
    date: zod_1.z.date().optional(),
    activities: zod_1.z.array(exports.activitySchema).default([]),
});
exports.hotelSchema = zod_1.z.object({
    name: zod_1.z.string().min(1, 'Hotel name is required'),
    tier: zod_1.z.enum(['Budget', 'Mid-Range', 'Luxury']),
    estimatedCostNightINR: zod_1.z.number().min(0, 'Cost cannot be negative'),
    rating: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    amenities: zod_1.z.array(zod_1.z.string()).default([]),
});
exports.estimatedBudgetSchema = zod_1.z.object({
    transport: zod_1.z.number().min(0).default(0),
    accommodation: zod_1.z.number().min(0).default(0),
    food: zod_1.z.number().min(0).default(0),
    activities: zod_1.z.number().min(0).default(0),
    miscellaneous: zod_1.z.number().min(0).default(0),
    total: zod_1.z.number().min(0).default(0),
    currency: zod_1.z.literal('INR').default('INR'),
});
exports.packingItemSchema = zod_1.z.object({
    item: zod_1.z.string().min(1, 'Item name is required'),
    category: zod_1.z.enum(['Documents', 'Clothing', 'Gear', 'Electronics', 'Health', 'Other']),
    isPacked: zod_1.z.boolean().default(false),
    quantity: zod_1.z.number().int().min(1).default(1),
    notes: zod_1.z.string().optional(),
});
const parseDate = zod_1.z.preprocess((value) => {
    if (typeof value === 'string' && value.length > 0) {
        const date = new Date(value);
        return isNaN(date.getTime()) ? undefined : date;
    }
    if (value instanceof Date) {
        return value;
    }
    return undefined;
}, zod_1.z.date().optional());
exports.tripGenerationSchema = zod_1.z.object({
    destination: zod_1.z.string()
        .min(2, 'Destination is required')
        .max(100, 'Destination too long'),
    durationDays: zod_1.z.number()
        .int()
        .min(1, 'Duration must be at least 1 day')
        .max(30, 'Duration cannot exceed 30 days'),
    budgetTier: zod_1.z.enum(['Low', 'Medium', 'High']),
    interests: zod_1.z.array(zod_1.z.string()).default([]),
    travelDates: zod_1.z.object({
        start: parseDate,
        end: parseDate,
    }).optional(),
});
exports.validateTripGeneration = exports.tripGenerationSchema;
exports.tripUpdateSchema = zod_1.z.object({
    itinerary: zod_1.z.array(exports.itineraryDaySchema).optional(),
    hotels: zod_1.z.array(exports.hotelSchema).optional(),
    estimatedBudget: exports.estimatedBudgetSchema.partial().optional(),
    packingList: zod_1.z.array(exports.packingItemSchema).optional(),
    isPublic: zod_1.z.boolean().optional(),
    interests: zod_1.z.array(zod_1.z.string()).optional(),
    status: zod_1.z.enum(['Draft', 'Generated', 'Modified', 'Shared']).optional(),
});
exports.validateTripUpdate = exports.tripUpdateSchema;
exports.addActivitySchema = zod_1.z.object({
    dayNumber: zod_1.z.number().int().positive(),
    activity: exports.activitySchema,
});
exports.validateAddActivity = exports.addActivitySchema;
exports.removeActivitySchema = zod_1.z.object({
    dayNumber: zod_1.z.number().int().positive(),
    activityIndex: zod_1.z.number().int().min(0),
});
exports.validateRemoveActivity = exports.removeActivitySchema;
exports.regenerateDaySchema = zod_1.z.object({
    dayNumber: zod_1.z.number().int().positive(),
    feedback: zod_1.z.string().optional(),
});
exports.validateRegenerateDay = exports.regenerateDaySchema;
//# sourceMappingURL=trip.validator.js.map