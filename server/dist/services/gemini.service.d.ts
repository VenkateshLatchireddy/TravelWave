import { IAIResponse, ITripInput } from '../types/ai.types';
export declare class GeminiService {
    private static instance;
    private model;
    private readonly retryConfig;
    private constructor();
    static getInstance(): GeminiService;
    private getGenerationConfig;
    private getSafetySettings;
    private fetchWithRetry;
    private shouldRetry;
    private normalizeJsonResponse;
    private normalizeAIResponse;
    private normalizePackingItems;
    private normalizeTimeOfDay;
    private normalizeHotelTier;
    private normalizePackingCategory;
    generateTripPlan(input: ITripInput): Promise<IAIResponse>;
    regenerateSpecificDay(tripContext: any, dayNumber: number, userFeedback: string): Promise<IAIResponse>;
    generatePackingList(tripContext: any): Promise<any[]>;
    private buildTripPrompt;
    private getBudgetGuidelines;
    private buildDayRegenerationPrompt;
    private buildPackingListPrompt;
    private getSeason;
    private getWeatherContext;
}
//# sourceMappingURL=gemini.service.d.ts.map