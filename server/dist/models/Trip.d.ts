import mongoose, { Document } from 'mongoose';
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
export declare const Trip: mongoose.Model<ITrip, {}, {}, {}, mongoose.Document<unknown, {}, ITrip, {}, {}> & ITrip & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Trip.d.ts.map