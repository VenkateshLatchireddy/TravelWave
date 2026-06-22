import { GoogleGenerativeAI, GenerativeModel, GenerationConfig, SafetySetting, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';
import { IAIResponse, ITripInput } from '../types/ai.types';

export class GeminiService {
  private static instance: GeminiService;
  private model: GenerativeModel;
  private readonly retryConfig = {
    maxRetries: 5,
    initialDelay: 1000,
    maxDelay: 16000,
  };

  private constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      generationConfig: this.getGenerationConfig(),
      safetySettings: this.getSafetySettings(),
    });

    logger.info('Gemini API service initialized');
  }

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  private getGenerationConfig(): GenerationConfig {
    return {
      temperature: 0.7,
      topK: 1,
      topP: 0.95,
      maxOutputTokens: 16384,
      responseMimeType: 'application/json',
    };
  }

  private getSafetySettings(): SafetySetting[] {
    return [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];
  }

  private async fetchWithRetry(
    prompt: string,
    retries: number = this.retryConfig.maxRetries,
    delay: number = this.retryConfig.initialDelay
  ): Promise<IAIResponse | any[]> {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        console.error('GEMINI_API_KEY is not set in environment variables');
        throw new AppError('GEMINI_API_KEY is not configured on server', 500);
      }

      console.log('fetchWithRetry: Calling Gemini API with key:', apiKey.substring(0, 10) + '...');
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (!text) {
        throw new AppError('Empty response from AI service', 500);
      }

      // Parse JSON response
      try {
        const parsed = JSON.parse(this.normalizeJsonResponse(text));
        return this.normalizeAIResponse(parsed as IAIResponse);
      } catch (parseError) {
        logger.error('Failed to parse AI response:', {
          preview: text.slice(0, 1000),
          responseLength: text.length,
          error: parseError,
        });
        throw new AppError('Invalid response format from AI service', 500);
      }
    } catch (error: any) {
      logger.error('Gemini API error:', { error: error.message, retries });

      // Check if we should retry
      if (retries > 0 && this.shouldRetry(error)) {
        const nextDelay = Math.min(delay * 2, this.retryConfig.maxDelay);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.fetchWithRetry(prompt, retries - 1, nextDelay);
      }

      throw error;
    }
  }

  private shouldRetry(error: any): boolean {
    // Retry on rate limit or server errors
    return error.status === 429 || error.status >= 500;
  }

  private normalizeJsonResponse(text: string): string {
    const trimmed = text.trim();
    const fencedMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
    return fencedMatch ? fencedMatch[1].trim() : trimmed;
  }

  private normalizeAIResponse(response: IAIResponse | any[]): IAIResponse | any[] {
    if (Array.isArray(response)) {
      return this.normalizePackingItems(response);
    }

    if (Array.isArray(response.itinerary)) {
      response.itinerary = response.itinerary.map(day => ({
        ...day,
        activities: Array.isArray(day.activities)
          ? day.activities.map(activity => ({
              ...activity,
              timeOfDay: this.normalizeTimeOfDay(activity.timeOfDay),
            }))
          : [],
      }));
    }

    if (Array.isArray(response.hotels)) {
      response.hotels = response.hotels.map(hotel => ({
        ...hotel,
        tier: this.normalizeHotelTier(hotel.tier),
        amenities: Array.isArray(hotel.amenities) ? hotel.amenities : [],
      }));
    }

    if (response.estimatedBudget) {
      response.estimatedBudget = {
        transport: Number(response.estimatedBudget.transport) || 0,
        accommodation: Number(response.estimatedBudget.accommodation) || 0,
        food: Number(response.estimatedBudget.food) || 0,
        activities: Number(response.estimatedBudget.activities) || 0,
        miscellaneous: Number(response.estimatedBudget.miscellaneous) || 0,
        total: Number(response.estimatedBudget.total) || 0,
        currency: 'INR',
      };
    }

    if (Array.isArray(response.packingList)) {
      response.packingList = this.normalizePackingItems(response.packingList);
    }

    return response;
  }

  private normalizePackingItems(items: any[]): any[] {
    return items
      .filter(item => item && typeof item === 'object')
      .map(item => ({
        ...item,
        item: String(item.item || '').trim(),
        category: this.normalizePackingCategory(item.category),
        isPacked: Boolean(item.isPacked),
        quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,
        notes: String(item.notes || '').trim(),
      }))
      .filter(item => item.item.length > 0);
  }

  private normalizeTimeOfDay(value: unknown): 'Morning' | 'Afternoon' | 'Evening' {
    const text = String(value || '').toLowerCase();
    if (text.includes('morning')) return 'Morning';
    if (text.includes('afternoon') || text.includes('noon')) return 'Afternoon';
    if (text.includes('evening') || text.includes('night')) return 'Evening';
    return 'Morning';
  }

  private normalizeHotelTier(value: unknown): 'Budget' | 'Mid-Range' | 'Luxury' {
    const text = String(value || '').toLowerCase();
    if (text.includes('lux')) return 'Luxury';
    if (text.includes('mid') || text.includes('standard') || text.includes('comfort')) return 'Mid-Range';
    return 'Budget';
  }

  private normalizePackingCategory(
    value: unknown
  ): 'Documents' | 'Clothing' | 'Gear' | 'Electronics' | 'Health' | 'Other' {
    const text = String(value || '').toLowerCase();
    if (text.includes('document')) return 'Documents';
    if (text.includes('cloth') || text.includes('wear')) return 'Clothing';
    if (text.includes('gear') || text.includes('bag')) return 'Gear';
    if (text.includes('elect')) return 'Electronics';
    if (text.includes('health') || text.includes('med')) return 'Health';
    return 'Other';
  }

  public async generateTripPlan(input: ITripInput): Promise<IAIResponse> {
    const prompt = this.buildTripPrompt(input);
    logger.info('Generating trip plan with prompt length:', prompt.length);
    
    try {
      const response = await this.fetchWithRetry(prompt);
      if (Array.isArray(response)) {
        throw new AppError('Invalid trip plan response from AI service', 500);
      }
      return response;
    } catch (error) {
      logger.error('Failed to generate trip plan:', error);
      throw new AppError('Failed to generate trip plan. Please try again.', 500);
    }
  }

  public async regenerateSpecificDay(
    tripContext: any,
    dayNumber: number,
    userFeedback: string
  ): Promise<IAIResponse> {
    const prompt = this.buildDayRegenerationPrompt(tripContext, dayNumber, userFeedback);
    logger.info('Regenerating day:', { dayNumber, userFeedback });
    
    try {
      const response = await this.fetchWithRetry(prompt);
      if (Array.isArray(response)) {
        throw new AppError('Invalid day regeneration response from AI service', 500);
      }
      return response;
    } catch (error) {
      logger.error('Failed to regenerate day:', error);
      throw new AppError('Failed to regenerate day. Please try again.', 500);
    }
  }

  public async generatePackingList(tripContext: any): Promise<any[]> {
    const prompt = this.buildPackingListPrompt(tripContext);
    logger.info('Generating packing list');
    
    try {
      const response = await this.fetchWithRetry(prompt);
      return Array.isArray(response) ? response : response.packingList || [];
    } catch (error) {
      logger.error('Failed to generate packing list:', error);
      throw new AppError('Failed to generate packing list. Please try again.', 500);
    }
  }

  private buildTripPrompt(input: ITripInput): string {
    const { destination, durationDays, budgetTier, interests } = input;
    const interestsStr = interests.length > 0 ? interests.join(', ') : 'general exploration';
    
    // India-specific budget guidelines (in INR)
    const budgetGuidelines = this.getBudgetGuidelines(budgetTier);
    
    return `You are an expert travel planner specializing in India travel itineraries. Generate a detailed ${durationDays}-day travel plan for ${destination}, India.

**User Preferences:**
- Destination: ${destination}, India
- Duration: ${durationDays} days
- Budget Level: ${budgetTier} (${budgetGuidelines.description})
- Interests: ${interestsStr}

**Important Guidelines:**
1. All costs must be in Indian Rupees (INR)
2. Focus on authentic Indian experiences
3. Consider local transportation (auto-rickshaw, metro, etc.)
4. Include diverse culinary experiences
5. ${budgetGuidelines.specifics}

**Budget Guidelines (INR):**
${budgetGuidelines.details}

**Required JSON Structure:**
{
  "itinerary": [
    {
      "dayNumber": 1,
      "title": "Day title (e.g., 'Exploring Old Delhi')",
      "activities": [
        {
          "title": "Activity name",
          "description": "Detailed description",
          "estimatedCostINR": 0,
          "timeOfDay": "Morning | Afternoon | Evening",
          "location": "Specific location in Delhi",
          "duration": "2 hours"
        }
      ]
    }
  ],
  "hotels": [
    {
      "name": "Hotel name",
      "tier": "Budget | Mid-Range | Luxury",
      "estimatedCostNightINR": 0,
      "rating": "4.5/5",
      "location": "Area in Delhi",
      "amenities": ["Free WiFi", "Breakfast included", "Air conditioning"]
    }
  ],
  "estimatedBudget": {
    "transport": 0,
    "accommodation": 0,
    "food": 0,
    "activities": 0,
    "miscellaneous": 0,
    "total": 0,
    "currency": "INR"
  },
  "packingList": [
    {
      "item": "Item name",
      "category": "Documents | Clothing | Gear | Electronics | Health | Other",
      "isPacked": false,
      "quantity": 1,
      "notes": "Additional notes"
    }
  ]
}

**Important Notes:**
- Provide at least 3-4 activities per day
- Include specific locations, times, and realistic prices
- Consider weather conditions for the season
- Include both popular and offbeat experiences
- Ensure activities are logistically feasible
- For Delhi: include Red Fort, India Gate, Qutub Minar, Chandni Chowk, Humayun's Tomb, Lotus Temple, etc.
- Include authentic food experiences
- Provide practical tips for travelers

Return ONLY valid JSON matching the structure above. No additional text or markdown.`;
  }

  private getBudgetGuidelines(tier: string): any {
    const guidelines = {
      Low: {
        description: 'Budget-friendly travel',
        specifics: 'Focus on budget accommodations, street food, public transport',
        details: `- Daily budget: ₹1000-₹2000
- Accommodation: ₹500-₹1000 per night (hostels, budget hotels)
- Food: ₹200-₹400 per day (street food, local dhabas)
- Transport: ₹100-₹200 per day (metro, bus, shared auto)
- Activities: ₹100-₹300 per day (free attractions, budget tours)`
      },
      Medium: {
        description: 'Comfortable mid-range travel',
        specifics: 'Balance between cost and comfort, mid-range hotels, some fine dining',
        details: `- Daily budget: ₹2000-₹5000
- Accommodation: ₹1500-₹3000 per night (3-star hotels, boutique stays)
- Food: ₹500-₹1000 per day (restaurants, some fine dining)
- Transport: ₹200-₹500 per day (metro, cabs, private auto)
- Activities: ₹200-₹600 per day (guided tours, attraction tickets)`
      },
      High: {
        description: 'Luxury travel experience',
        specifics: 'Premium hotels, fine dining, private transport, exclusive experiences',
        details: `- Daily budget: ₹5000-₹15000
- Accommodation: ₹5000-₹10000 per night (5-star hotels, heritage properties)
- Food: ₹1500-₹3000 per day (fine dining, premium restaurants)
- Transport: ₹500-₹1000 per day (private driver, premium cabs)
- Activities: ₹500-₹1500 per day (exclusive tours, VIP experiences)`
      }
    };
    return guidelines[tier as keyof typeof guidelines] || guidelines.Medium;
  }

  private buildDayRegenerationPrompt(tripContext: any, dayNumber: number, feedback: string): string {
    return `You are an expert travel planner. Regenerate Day ${dayNumber} for this trip with the following feedback: "${feedback}"

Current Trip Context:
- Destination: ${tripContext.destination}
- Duration: ${tripContext.durationDays} days
- Budget Tier: ${tripContext.budgetTier}
- Interests: ${tripContext.interests.join(', ')}

Current Full Itinerary:
${JSON.stringify(tripContext.itinerary, null, 2)}

**Requirements:**
1. Keep the rest of the itinerary unchanged
2. Only modify Day ${dayNumber} based on the feedback
3. Maintain consistency with the trip's overall theme and budget
4. All costs in INR
5. Focus on Delhi/India-specific experiences

Return ONLY the updated Day ${dayNumber} as JSON:
{
  "dayNumber": ${dayNumber},
  "title": "New day title",
  "activities": [
    {
      "title": "Activity name",
      "description": "Detailed description",
      "estimatedCostINR": 0,
      "timeOfDay": "Morning | Afternoon | Evening",
      "location": "Specific location",
      "duration": "2 hours"
    }
  ]
}`;
  }

  private buildPackingListPrompt(tripContext: any): string {
    return `You are a smart packing assistant specialized for India travel. Generate a comprehensive packing list for this trip.

**Trip Details:**
- Destination: ${tripContext.destination}, India
- Duration: ${tripContext.durationDays} days
- Season: ${this.getSeason()}
- Activities: ${tripContext.interests.join(', ')}

**Weather Context for ${tripContext.destination}, India:**
${this.getWeatherContext(tripContext.destination)}

**Required JSON Array of Packing Items:**
[
  {
    "item": "Item name (e.g., 'Passport')",
    "category": "Documents | Clothing | Gear | Electronics | Health | Other",
    "isPacked": false,
    "quantity": 1,
    "notes": "Specific note for this item"
  }
]

**Categories to Include:**
1. Documents: Passport, Visa, Travel Insurance, Flight Tickets, Hotel Vouchers
2. Clothing: Weather-appropriate clothes, Traditional wear for temple visits
3. Gear: Backpack, Day bag, Walking shoes, Power bank
4. Electronics: Phone, Camera, Chargers, Adapter
5. Health: Medicines, First aid kit, Sanitizer, Sunscreen
6. Other: Water bottle, Snacks, Guidebook, Umbrella

**Special Considerations for India:**
- Modest clothing for religious sites
- Comfortable walking shoes for exploring
- Scarf/dupatta for temples
- Sun protection (high SPF)
- Water purification tablets or bottled water
- Anti-mosquito repellent

Return ONLY valid JSON array. No additional text.`;
  }

  private getSeason(): string {
    const month = new Date().getMonth();
    if (month >= 11 || month <= 1) return 'Winter (November-February) - Cool and pleasant';
    if (month >= 2 && month <= 4) return 'Spring (March-April) - Warm and pleasant';
    if (month >= 5 && month <= 6) return 'Summer (May-June) - Hot and dry';
    if (month >= 7 && month <= 9) return 'Monsoon (July-September) - Rainy and humid';
    return 'Autumn (October) - Pleasant with some rain';
  }

  private getWeatherContext(destination: string): string {
    const season = this.getSeason();
    const weatherMap: Record<string, string> = {
      'Delhi': `Delhi experiences ${season}. 
- Winter: 5-20°C, foggy mornings
- Summer: 30-45°C, very hot
- Monsoon: Heavy rainfall
- Spring/Autumn: Pleasant 20-30°C`,
      'Agra': `Agra experiences ${season}.
- Winter: 5-18°C
- Summer: 35-45°C
- Monsoon: Moderate rainfall`,
      'Jaipur': `Jaipur experiences ${season}.
- Winter: 8-22°C
- Summer: 30-45°C
- Monsoon: Moderate rainfall`,
      'Varanasi': `Varanasi experiences ${season}.
- Winter: 5-20°C
- Summer: 30-42°C
- Monsoon: Heavy rainfall`
    };
    return weatherMap[destination] || `Standard weather conditions for ${destination}, India`;
  }
}
