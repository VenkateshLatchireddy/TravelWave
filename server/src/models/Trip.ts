import mongoose, { Schema, Document } from 'mongoose';

export interface IActivity {
  title: string;
  description?: string;
  estimatedCostINR?: number;
  timeOfDay?: 'Morning' | 'Afternoon' | 'Evening';
  location?: string;
  duration?: string;
  isCustom?: boolean;
}

export interface IItineraryDay {
  dayNumber: number;
  date?: Date;
  title?: string;
  activities: IActivity[];
}

export interface IHotel {
  name: string;
  tier: 'Budget' | 'Mid-Range' | 'Luxury';
  estimatedCostNightINR: number;
  rating?: string;
  location?: string;
  amenities?: string[];
}

export interface IEstimatedBudget {
  transport: number;
  accommodation: number;
  food: number;
  activities: number;
  miscellaneous: number;
  total: number;
  currency: 'INR';
}

export interface IPackingItem {
  _id?: mongoose.Types.ObjectId;
  item: string;
  category: 'Documents' | 'Clothing' | 'Gear' | 'Electronics' | 'Health' | 'Other';
  isPacked: boolean;
  quantity?: number;
  notes?: string;
}

export interface ITrip extends Document {
  userId: mongoose.Types.ObjectId;
  destination: string;
  durationDays: number;
  budgetTier: 'Low' | 'Medium' | 'High';
  interests: string[];
  travelDates?: {
    start: Date;
    end: Date;
  };
  itinerary: IItineraryDay[];
  hotels: IHotel[];
  estimatedBudget: IEstimatedBudget;
  packingList: IPackingItem[];
  status: 'Draft' | 'Generated' | 'Modified' | 'Shared';
  isPublic: boolean;
  shareToken?: string;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>({
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

const ItineraryDaySchema = new Schema<IItineraryDay>({
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

const HotelSchema = new Schema<IHotel>({
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

const EstimatedBudgetSchema = new Schema<IEstimatedBudget>({
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

const PackingItemSchema = new Schema<IPackingItem>({
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

const TripSchema = new Schema<ITrip>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
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
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: any) => {
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Compound indexes for efficient queries
TripSchema.index({ userId: 1, createdAt: -1 });
TripSchema.index({ userId: 1, status: 1 });
TripSchema.index({ destination: 1, 'itinerary.dayNumber': 1 });
TripSchema.index({ shareToken: 1 }, { unique: true, sparse: true });

// Virtual for total days count
TripSchema.virtual('totalDays').get(function(this: ITrip) {
  return this.itinerary.length;
});

// Pre-save middleware to update budget total
TripSchema.pre<ITrip>('save', function(next) {
  if (this.estimatedBudget) {
    const budget = this.estimatedBudget;
    budget.total = budget.transport + budget.accommodation + budget.food + 
                   budget.activities + budget.miscellaneous;
  }
  next();
});

export const Trip = mongoose.model<ITrip>('Trip', TripSchema);
