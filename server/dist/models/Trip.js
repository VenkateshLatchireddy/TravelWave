"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Trip = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ActivitySchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, 'Activity title is required'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    estimatedCostINR: {
        type: Number,
        default: 0,
        min: 0,
    },
    timeOfDay: {
        type: String,
        enum: ['Morning', 'Afternoon', 'Evening'],
    },
    location: {
        type: String,
        trim: true,
    },
    duration: {
        type: String,
        trim: true,
    },
    isCustom: {
        type: Boolean,
        default: false,
    },
});
const ItineraryDaySchema = new mongoose_1.Schema({
    dayNumber: {
        type: Number,
        required: true,
        min: 1,
    },
    date: {
        type: Date,
    },
    title: {
        type: String,
        trim: true,
    },
    activities: [ActivitySchema],
});
const HotelSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Hotel name is required'],
        trim: true,
    },
    tier: {
        type: String,
        enum: ['Budget', 'Mid-Range', 'Luxury'],
        required: true,
    },
    estimatedCostNightINR: {
        type: Number,
        required: true,
        min: 0,
    },
    rating: {
        type: String,
        trim: true,
    },
    location: {
        type: String,
        trim: true,
    },
    amenities: [String],
});
const EstimatedBudgetSchema = new mongoose_1.Schema({
    transport: {
        type: Number,
        default: 0,
        min: 0,
    },
    accommodation: {
        type: Number,
        default: 0,
        min: 0,
    },
    food: {
        type: Number,
        default: 0,
        min: 0,
    },
    activities: {
        type: Number,
        default: 0,
        min: 0,
    },
    miscellaneous: {
        type: Number,
        default: 0,
        min: 0,
    },
    total: {
        type: Number,
        default: 0,
        min: 0,
    },
    currency: {
        type: String,
        default: 'INR',
        enum: ['INR'],
    },
});
const PackingItemSchema = new mongoose_1.Schema({
    item: {
        type: String,
        required: [true, 'Item name is required'],
        trim: true,
    },
    category: {
        type: String,
        enum: ['Documents', 'Clothing', 'Gear', 'Electronics', 'Health', 'Other'],
        required: true,
    },
    isPacked: {
        type: Boolean,
        default: false,
    },
    quantity: {
        type: Number,
        min: 1,
        default: 1,
    },
    notes: {
        type: String,
        trim: true,
    },
});
const TripSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
    },
    destination: {
        type: String,
        required: [true, 'Destination is required'],
        trim: true,
    },
    durationDays: {
        type: Number,
        required: [true, 'Duration in days is required'],
        min: [1, 'Duration must be at least 1 day'],
        max: [30, 'Duration cannot exceed 30 days'],
    },
    budgetTier: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        required: [true, 'Budget tier is required'],
    },
    interests: {
        type: [String],
        default: [],
    },
    travelDates: {
        start: Date,
        end: Date,
    },
    itinerary: {
        type: [ItineraryDaySchema],
        default: [],
    },
    hotels: {
        type: [HotelSchema],
        default: [],
    },
    estimatedBudget: {
        type: EstimatedBudgetSchema,
        default: () => ({
            transport: 0,
            accommodation: 0,
            food: 0,
            activities: 0,
            miscellaneous: 0,
            total: 0,
            currency: 'INR',
        }),
    },
    packingList: {
        type: [PackingItemSchema],
        default: [],
    },
    status: {
        type: String,
        enum: ['Draft', 'Generated', 'Modified', 'Shared'],
        default: 'Draft',
    },
    isPublic: {
        type: Boolean,
        default: false,
    },
    shareToken: {
        type: String,
    },
    viewCount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
    toJSON: {
        transform: (doc, ret) => {
            delete ret.__v;
            return ret;
        },
    },
});
TripSchema.index({ userId: 1, createdAt: -1 });
TripSchema.index({ userId: 1, status: 1 });
TripSchema.index({ destination: 1, 'itinerary.dayNumber': 1 });
TripSchema.index({ shareToken: 1 }, { unique: true, sparse: true });
TripSchema.virtual('totalDays').get(function () {
    return this.itinerary.length;
});
TripSchema.pre('save', function (next) {
    if (this.estimatedBudget) {
        const budget = this.estimatedBudget;
        budget.total = budget.transport + budget.accommodation + budget.food +
            budget.activities + budget.miscellaneous;
    }
    next();
});
exports.Trip = mongoose_1.default.model('Trip', TripSchema);
//# sourceMappingURL=Trip.js.map