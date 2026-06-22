export interface ITripInput {
  destination: string;
  durationDays: number;
  budgetTier: 'Low' | 'Medium' | 'High';
  interests: string[];
  travelDates?: {
    start: Date;
    end: Date;
  };
}

export interface IActivity {
  title: string;
  description: string;
  estimatedCostINR: number;
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening';
  location: string;
  duration: string;
}

export interface IItineraryDay {
  dayNumber: number;
  title: string;
  activities: IActivity[];
}

export interface IHotel {
  name: string;
  tier: 'Budget' | 'Mid-Range' | 'Luxury';
  estimatedCostNightINR: number;
  rating: string;
  location: string;
  amenities: string[];
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
  item: string;
  category: 'Documents' | 'Clothing' | 'Gear' | 'Electronics' | 'Health' | 'Other';
  isPacked: boolean;
  quantity: number;
  notes: string;
}

export interface IAIResponse {
  itinerary: IItineraryDay[];
  hotels: IHotel[];
  estimatedBudget: IEstimatedBudget;
  packingList: IPackingItem[];
}