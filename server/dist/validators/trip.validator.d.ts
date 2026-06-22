import { z } from 'zod';
export declare const activitySchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    estimatedCostINR: z.ZodDefault<z.ZodNumber>;
    timeOfDay: z.ZodOptional<z.ZodEnum<["Morning", "Afternoon", "Evening"]>>;
    location: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodString>;
    isCustom: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    title: string;
    estimatedCostINR: number;
    isCustom: boolean;
    description?: string | undefined;
    timeOfDay?: "Morning" | "Afternoon" | "Evening" | undefined;
    location?: string | undefined;
    duration?: string | undefined;
}, {
    title: string;
    description?: string | undefined;
    estimatedCostINR?: number | undefined;
    timeOfDay?: "Morning" | "Afternoon" | "Evening" | undefined;
    location?: string | undefined;
    duration?: string | undefined;
    isCustom?: boolean | undefined;
}>;
export declare const itineraryDaySchema: z.ZodObject<{
    dayNumber: z.ZodNumber;
    title: z.ZodOptional<z.ZodString>;
    date: z.ZodOptional<z.ZodDate>;
    activities: z.ZodDefault<z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        estimatedCostINR: z.ZodDefault<z.ZodNumber>;
        timeOfDay: z.ZodOptional<z.ZodEnum<["Morning", "Afternoon", "Evening"]>>;
        location: z.ZodOptional<z.ZodString>;
        duration: z.ZodOptional<z.ZodString>;
        isCustom: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        estimatedCostINR: number;
        isCustom: boolean;
        description?: string | undefined;
        timeOfDay?: "Morning" | "Afternoon" | "Evening" | undefined;
        location?: string | undefined;
        duration?: string | undefined;
    }, {
        title: string;
        description?: string | undefined;
        estimatedCostINR?: number | undefined;
        timeOfDay?: "Morning" | "Afternoon" | "Evening" | undefined;
        location?: string | undefined;
        duration?: string | undefined;
        isCustom?: boolean | undefined;
    }>, "many">>;
}, "strip", z.ZodTypeAny, {
    dayNumber: number;
    activities: {
        title: string;
        estimatedCostINR: number;
        isCustom: boolean;
        description?: string | undefined;
        timeOfDay?: "Morning" | "Afternoon" | "Evening" | undefined;
        location?: string | undefined;
        duration?: string | undefined;
    }[];
    title?: string | undefined;
    date?: Date | undefined;
}, {
    dayNumber: number;
    title?: string | undefined;
    date?: Date | undefined;
    activities?: {
        title: string;
        description?: string | undefined;
        estimatedCostINR?: number | undefined;
        timeOfDay?: "Morning" | "Afternoon" | "Evening" | undefined;
        location?: string | undefined;
        duration?: string | undefined;
        isCustom?: boolean | undefined;
    }[] | undefined;
}>;
export declare const hotelSchema: z.ZodObject<{
    name: z.ZodString;
    tier: z.ZodEnum<["Budget", "Mid-Range", "Luxury"]>;
    estimatedCostNightINR: z.ZodNumber;
    rating: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    amenities: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    name: string;
    tier: "Budget" | "Mid-Range" | "Luxury";
    estimatedCostNightINR: number;
    amenities: string[];
    location?: string | undefined;
    rating?: string | undefined;
}, {
    name: string;
    tier: "Budget" | "Mid-Range" | "Luxury";
    estimatedCostNightINR: number;
    location?: string | undefined;
    rating?: string | undefined;
    amenities?: string[] | undefined;
}>;
export declare const estimatedBudgetSchema: z.ZodObject<{
    transport: z.ZodDefault<z.ZodNumber>;
    accommodation: z.ZodDefault<z.ZodNumber>;
    food: z.ZodDefault<z.ZodNumber>;
    activities: z.ZodDefault<z.ZodNumber>;
    miscellaneous: z.ZodDefault<z.ZodNumber>;
    total: z.ZodDefault<z.ZodNumber>;
    currency: z.ZodDefault<z.ZodLiteral<"INR">>;
}, "strip", z.ZodTypeAny, {
    activities: number;
    transport: number;
    accommodation: number;
    food: number;
    miscellaneous: number;
    total: number;
    currency: "INR";
}, {
    activities?: number | undefined;
    transport?: number | undefined;
    accommodation?: number | undefined;
    food?: number | undefined;
    miscellaneous?: number | undefined;
    total?: number | undefined;
    currency?: "INR" | undefined;
}>;
export declare const packingItemSchema: z.ZodObject<{
    item: z.ZodString;
    category: z.ZodEnum<["Documents", "Clothing", "Gear", "Electronics", "Health", "Other"]>;
    isPacked: z.ZodDefault<z.ZodBoolean>;
    quantity: z.ZodDefault<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    item: string;
    category: "Documents" | "Clothing" | "Gear" | "Electronics" | "Health" | "Other";
    isPacked: boolean;
    quantity: number;
    notes?: string | undefined;
}, {
    item: string;
    category: "Documents" | "Clothing" | "Gear" | "Electronics" | "Health" | "Other";
    isPacked?: boolean | undefined;
    quantity?: number | undefined;
    notes?: string | undefined;
}>;
export declare const tripGenerationSchema: z.ZodObject<{
    destination: z.ZodString;
    durationDays: z.ZodNumber;
    budgetTier: z.ZodEnum<["Low", "Medium", "High"]>;
    interests: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    travelDates: z.ZodOptional<z.ZodObject<{
        start: z.ZodEffects<z.ZodOptional<z.ZodDate>, Date | undefined, unknown>;
        end: z.ZodEffects<z.ZodOptional<z.ZodDate>, Date | undefined, unknown>;
    }, "strip", z.ZodTypeAny, {
        end?: Date | undefined;
        start?: Date | undefined;
    }, {
        end?: unknown;
        start?: unknown;
    }>>;
}, "strip", z.ZodTypeAny, {
    destination: string;
    durationDays: number;
    budgetTier: "Low" | "Medium" | "High";
    interests: string[];
    travelDates?: {
        end?: Date | undefined;
        start?: Date | undefined;
    } | undefined;
}, {
    destination: string;
    durationDays: number;
    budgetTier: "Low" | "Medium" | "High";
    interests?: string[] | undefined;
    travelDates?: {
        end?: unknown;
        start?: unknown;
    } | undefined;
}>;
export declare const tripUpdateSchema: z.ZodObject<{
    itinerary: z.ZodOptional<z.ZodArray<z.ZodObject<{
        dayNumber: z.ZodNumber;
        title: z.ZodOptional<z.ZodString>;
        date: z.ZodOptional<z.ZodDate>;
        activities: z.ZodDefault<z.ZodArray<z.ZodObject<{
            title: z.ZodString;
            description: z.ZodOptional<z.ZodString>;
            estimatedCostINR: z.ZodDefault<z.ZodNumber>;
            timeOfDay: z.ZodOptional<z.ZodEnum<["Morning", "Afternoon", "Evening"]>>;
            location: z.ZodOptional<z.ZodString>;
            duration: z.ZodOptional<z.ZodString>;
            isCustom: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            title: string;
            estimatedCostINR: number;
            isCustom: boolean;
            description?: string | undefined;
            timeOfDay?: "Morning" | "Afternoon" | "Evening" | undefined;
            location?: string | undefined;
            duration?: string | undefined;
        }, {
            title: string;
            description?: string | undefined;
            estimatedCostINR?: number | undefined;
            timeOfDay?: "Morning" | "Afternoon" | "Evening" | undefined;
            location?: string | undefined;
            duration?: string | undefined;
            isCustom?: boolean | undefined;
        }>, "many">>;
    }, "strip", z.ZodTypeAny, {
        dayNumber: number;
        activities: {
            title: string;
            estimatedCostINR: number;
            isCustom: boolean;
            description?: string | undefined;
            timeOfDay?: "Morning" | "Afternoon" | "Evening" | undefined;
            location?: string | undefined;
            duration?: string | undefined;
        }[];
        title?: string | undefined;
        date?: Date | undefined;
    }, {
        dayNumber: number;
        title?: string | undefined;
        date?: Date | undefined;
        activities?: {
            title: string;
            description?: string | undefined;
            estimatedCostINR?: number | undefined;
            timeOfDay?: "Morning" | "Afternoon" | "Evening" | undefined;
            location?: string | undefined;
            duration?: string | undefined;
            isCustom?: boolean | undefined;
        }[] | undefined;
    }>, "many">>;
    hotels: z.ZodOptional<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        tier: z.ZodEnum<["Budget", "Mid-Range", "Luxury"]>;
        estimatedCostNightINR: z.ZodNumber;
        rating: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodString>;
        amenities: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        tier: "Budget" | "Mid-Range" | "Luxury";
        estimatedCostNightINR: number;
        amenities: string[];
        location?: string | undefined;
        rating?: string | undefined;
    }, {
        name: string;
        tier: "Budget" | "Mid-Range" | "Luxury";
        estimatedCostNightINR: number;
        location?: string | undefined;
        rating?: string | undefined;
        amenities?: string[] | undefined;
    }>, "many">>;
    estimatedBudget: z.ZodOptional<z.ZodObject<{
        transport: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        accommodation: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        food: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        activities: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        miscellaneous: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        total: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
        currency: z.ZodOptional<z.ZodDefault<z.ZodLiteral<"INR">>>;
    }, "strip", z.ZodTypeAny, {
        activities?: number | undefined;
        transport?: number | undefined;
        accommodation?: number | undefined;
        food?: number | undefined;
        miscellaneous?: number | undefined;
        total?: number | undefined;
        currency?: "INR" | undefined;
    }, {
        activities?: number | undefined;
        transport?: number | undefined;
        accommodation?: number | undefined;
        food?: number | undefined;
        miscellaneous?: number | undefined;
        total?: number | undefined;
        currency?: "INR" | undefined;
    }>>;
    packingList: z.ZodOptional<z.ZodArray<z.ZodObject<{
        item: z.ZodString;
        category: z.ZodEnum<["Documents", "Clothing", "Gear", "Electronics", "Health", "Other"]>;
        isPacked: z.ZodDefault<z.ZodBoolean>;
        quantity: z.ZodDefault<z.ZodNumber>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        item: string;
        category: "Documents" | "Clothing" | "Gear" | "Electronics" | "Health" | "Other";
        isPacked: boolean;
        quantity: number;
        notes?: string | undefined;
    }, {
        item: string;
        category: "Documents" | "Clothing" | "Gear" | "Electronics" | "Health" | "Other";
        isPacked?: boolean | undefined;
        quantity?: number | undefined;
        notes?: string | undefined;
    }>, "many">>;
    isPublic: z.ZodOptional<z.ZodBoolean>;
    interests: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    status: z.ZodOptional<z.ZodEnum<["Draft", "Generated", "Modified", "Shared"]>>;
}, "strip", z.ZodTypeAny, {
    interests?: string[] | undefined;
    itinerary?: {
        dayNumber: number;
        activities: {
            title: string;
            estimatedCostINR: number;
            isCustom: boolean;
            description?: string | undefined;
            timeOfDay?: "Morning" | "Afternoon" | "Evening" | undefined;
            location?: string | undefined;
            duration?: string | undefined;
        }[];
        title?: string | undefined;
        date?: Date | undefined;
    }[] | undefined;
    hotels?: {
        name: string;
        tier: "Budget" | "Mid-Range" | "Luxury";
        estimatedCostNightINR: number;
        amenities: string[];
        location?: string | undefined;
        rating?: string | undefined;
    }[] | undefined;
    estimatedBudget?: {
        activities?: number | undefined;
        transport?: number | undefined;
        accommodation?: number | undefined;
        food?: number | undefined;
        miscellaneous?: number | undefined;
        total?: number | undefined;
        currency?: "INR" | undefined;
    } | undefined;
    packingList?: {
        item: string;
        category: "Documents" | "Clothing" | "Gear" | "Electronics" | "Health" | "Other";
        isPacked: boolean;
        quantity: number;
        notes?: string | undefined;
    }[] | undefined;
    status?: "Draft" | "Generated" | "Modified" | "Shared" | undefined;
    isPublic?: boolean | undefined;
}, {
    interests?: string[] | undefined;
    itinerary?: {
        dayNumber: number;
        title?: string | undefined;
        date?: Date | undefined;
        activities?: {
            title: string;
            description?: string | undefined;
            estimatedCostINR?: number | undefined;
            timeOfDay?: "Morning" | "Afternoon" | "Evening" | undefined;
            location?: string | undefined;
            duration?: string | undefined;
            isCustom?: boolean | undefined;
        }[] | undefined;
    }[] | undefined;
    hotels?: {
        name: string;
        tier: "Budget" | "Mid-Range" | "Luxury";
        estimatedCostNightINR: number;
        location?: string | undefined;
        rating?: string | undefined;
        amenities?: string[] | undefined;
    }[] | undefined;
    estimatedBudget?: {
        activities?: number | undefined;
        transport?: number | undefined;
        accommodation?: number | undefined;
        food?: number | undefined;
        miscellaneous?: number | undefined;
        total?: number | undefined;
        currency?: "INR" | undefined;
    } | undefined;
    packingList?: {
        item: string;
        category: "Documents" | "Clothing" | "Gear" | "Electronics" | "Health" | "Other";
        isPacked?: boolean | undefined;
        quantity?: number | undefined;
        notes?: string | undefined;
    }[] | undefined;
    status?: "Draft" | "Generated" | "Modified" | "Shared" | undefined;
    isPublic?: boolean | undefined;
}>;
export declare const addActivitySchema: z.ZodObject<{
    dayNumber: z.ZodNumber;
    activity: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        estimatedCostINR: z.ZodDefault<z.ZodNumber>;
        timeOfDay: z.ZodOptional<z.ZodEnum<["Morning", "Afternoon", "Evening"]>>;
        location: z.ZodOptional<z.ZodString>;
        duration: z.ZodOptional<z.ZodString>;
        isCustom: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        title: string;
        estimatedCostINR: number;
        isCustom: boolean;
        description?: string | undefined;
        timeOfDay?: "Morning" | "Afternoon" | "Evening" | undefined;
        location?: string | undefined;
        duration?: string | undefined;
    }, {
        title: string;
        description?: string | undefined;
        estimatedCostINR?: number | undefined;
        timeOfDay?: "Morning" | "Afternoon" | "Evening" | undefined;
        location?: string | undefined;
        duration?: string | undefined;
        isCustom?: boolean | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    dayNumber: number;
    activity: {
        title: string;
        estimatedCostINR: number;
        isCustom: boolean;
        description?: string | undefined;
        timeOfDay?: "Morning" | "Afternoon" | "Evening" | undefined;
        location?: string | undefined;
        duration?: string | undefined;
    };
}, {
    dayNumber: number;
    activity: {
        title: string;
        description?: string | undefined;
        estimatedCostINR?: number | undefined;
        timeOfDay?: "Morning" | "Afternoon" | "Evening" | undefined;
        location?: string | undefined;
        duration?: string | undefined;
        isCustom?: boolean | undefined;
    };
}>;
export declare const removeActivitySchema: z.ZodObject<{
    dayNumber: z.ZodNumber;
    activityIndex: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    dayNumber: number;
    activityIndex: number;
}, {
    dayNumber: number;
    activityIndex: number;
}>;
export declare const regenerateDaySchema: z.ZodObject<{
    dayNumber: z.ZodNumber;
    feedback: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    dayNumber: number;
    feedback?: string | undefined;
}, {
    dayNumber: number;
    feedback?: string | undefined;
}>;
export { tripGenerationSchema as validateTripGeneration };
export { tripUpdateSchema as validateTripUpdate };
export { addActivitySchema as validateAddActivity };
export { removeActivitySchema as validateRemoveActivity };
export { regenerateDaySchema as validateRegenerateDay };
//# sourceMappingURL=trip.validator.d.ts.map