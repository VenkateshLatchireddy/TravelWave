import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  MapPin,
  Calendar,
  DollarSign,
  Coffee,
  Landmark,
  Utensils,
  ShoppingBag,
  Mountain,
  Camera,
  Globe,
  ArrowRight,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface FormData {
  destination: string;
  durationDays: number;
  budgetTier: 'Low' | 'Medium' | 'High';
  interests: string[];
  travelDates: {
    start: string;
    end: string;
  };
}

const INDIAN_DESTINATIONS = [
  'Delhi', 'Agra', 'Jaipur', 'Varanasi', 'Mumbai', 
  'Kolkata', 'Chennai', 'Bangalore', 'Hyderabad', 'Goa',
  'Shimla', 'Manali', 'Rishikesh', 'Pushkar', 'Jodhpur',
  'Udaipur', 'Amritsar', 'Chandigarh', 'Lucknow', 'Darjeeling',
];

const INTERESTS = [
  { id: 'food', label: 'Food & Cuisine', icon: Utensils },
  { id: 'culture', label: 'Culture & Heritage', icon: Landmark },
  { id: 'adventure', label: 'Adventure', icon: Mountain },
  { id: 'shopping', label: 'Shopping', icon: ShoppingBag },
  { id: 'photography', label: 'Photography', icon: Camera },
  { id: 'nature', label: 'Nature & Wildlife', icon: Globe },
  { id: 'spiritual', label: 'Spiritual', icon: Coffee },
  { id: 'nightlife', label: 'Nightlife', icon: Coffee },
];

const TRAVEL_QUOTES = [
  {
    quote: 'A great trip starts with one curious choice.',
    detail: 'Finding the right route, pace, and local gems for you.',
  },
  {
    quote: 'The best stories rarely stay on the main road.',
    detail: 'Balancing famous spots with quieter discoveries.',
  },
  {
    quote: 'Pack light, wander deep.',
    detail: 'Shaping your days so they feel full, not rushed.',
  },
  {
    quote: 'Every city has a rhythm. Your itinerary should match it.',
    detail: 'Tuning food, culture, travel time, and rest stops.',
  },
  {
    quote: 'Good plans leave room for beautiful surprises.',
    detail: 'Building a flexible adventure around your interests.',
  },
];

export const CreateTrip: React.FC = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    destination: '',
    durationDays: 3,
    budgetTier: 'Medium',
    interests: [],
    travelDates: {
      start: '',
      end: '',
    },
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.destination) newErrors.destination = 'Destination is required';
    if (!formData.durationDays || formData.durationDays < 1) {
      newErrors.durationDays = 'Duration must be at least 1 day';
    }
    if (formData.durationDays > 30) {
      newErrors.durationDays = 'Duration cannot exceed 30 days';
    }
    return newErrors;
  };

  useEffect(() => {
    if (!isGenerating) {
      return;
    }

    const quoteTimer = window.setInterval(() => {
      setQuoteIndex((currentIndex) => (currentIndex + 1) % TRAVEL_QUOTES.length);
    }, 2800);

    return () => window.clearInterval(quoteTimer);
  }, [isGenerating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsGenerating(true);
    setQuoteIndex(0);
    setErrors({});

    try {
      const response = await api.post('/api/trips/generate', {
        destination: formData.destination,
        durationDays: formData.durationDays,
        budgetTier: formData.budgetTier,
        interests: formData.interests,
        travelDates: formData.travelDates.start && formData.travelDates.end ? {
          start: new Date(formData.travelDates.start),
          end: new Date(formData.travelDates.end),
        } : undefined,
      });

      if (response.success) {
        toast.success('Trip generated successfully!');
        navigate(`/trip/${response.data._id}`);
      }
    } catch (error) {
      toast.error('Failed to generate trip. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleInterest = (interestId: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId)
        ? prev.interests.filter(id => id !== interestId)
        : [...prev.interests, interestId],
    }));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">Trip Builder</p>
          <h1 className="mt-2 text-3xl font-bold text-stone-950">Plan Your Indian Adventure</h1>
          <p className="text-stone-600 mt-2">Craft a practical itinerary around the places, pace, and experiences you care about.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Destination */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-teal-600" />
              Where are you going?
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {INDIAN_DESTINATIONS.map((dest) => (
                <button
                  key={dest}
                  type="button"
                  onClick={() => setFormData({ ...formData, destination: dest })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                    formData.destination === dest
                      ? 'bg-[#CD1C18]/10 text-[#CD1C18] border-[#CD1C18]/30 shadow-sm'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-[#CD1C18]/30 hover:text-[#CD1C18]'
                  }`}
                >
                  {dest}
                </button>
              ))}
            </div>
            {errors.destination && (
              <p className="mt-2 text-sm text-red-400">{errors.destination}</p>
            )}
          </div>

          {/* Duration & Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-600" />
                Duration
              </h2>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={formData.durationDays}
                  onChange={(e) => setFormData({
                    ...formData,
                    durationDays: parseInt(e.target.value) || 1,
                  })}
                  className="w-24 px-4 py-3 bg-white border border-stone-300 rounded-xl text-center text-lg font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <span className="text-stone-600">days</span>
              </div>
              {errors.durationDays && (
                <p className="mt-2 text-sm text-red-400">{errors.durationDays}</p>
              )}
            </div>

            <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-teal-600" />
                Budget Level
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {['Low', 'Medium', 'High'].map((tier) => (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setFormData({ ...formData, budgetTier: tier as any })}
                    className={`
                      px-4 py-3 rounded-lg text-sm font-medium transition-all border
                      ${formData.budgetTier === tier
                        ? tier === 'Low'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : tier === 'Medium'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-cyan-50 text-cyan-800 border-cyan-300'
                        : 'bg-white text-stone-600 border-stone-200 hover:border-teal-300 hover:bg-teal-50/50'
                      }
                    `}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interests */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
              <Coffee className="w-5 h-5 text-teal-600" />
              What are your interests?
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {INTERESTS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleInterest(id)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all border ${
                    formData.interests.includes(id)
                      ? 'bg-[#CD1C18]/10 text-[#CD1C18] border-[#CD1C18]/30 shadow-sm'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-[#CD1C18]/30 hover:text-[#CD1C18]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>
            {formData.interests.length > 0 && (
              <p className="mt-3 text-sm text-stone-500">
                Selected: {formData.interests.length} interest(s)
              </p>
            )}
          </div>

          {/* Travel Dates (Optional) */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              Travel Dates (Optional)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-2">Start Date</label>
                <input
                  type="date"
                  value={formData.travelDates.start}
                  onChange={(e) => setFormData({
                    ...formData,
                    travelDates: { ...formData.travelDates, start: e.target.value },
                  })}
                  className="w-full px-4 py-3 bg-white border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-2">End Date</label>
                <input
                  type="date"
                  value={formData.travelDates.end}
                  onChange={(e) => setFormData({
                    ...formData,
                    travelDates: { ...formData.travelDates, end: e.target.value },
                  })}
                  className="w-full px-4 py-3 bg-white border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="overflow-hidden rounded-xl border border-cyan-200 bg-white shadow-sm"
              aria-live="polite"
            >
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-800">
                  <Sparkles className="h-5 w-5" />
                </div>
                <motion.div
                  key={quoteIndex}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="min-w-0 flex-1"
                >
                  <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
                    Crafting your itinerary
                  </p>
                  <p className="mt-1 text-lg font-semibold leading-snug text-stone-950">
                    {TRAVEL_QUOTES[quoteIndex].quote}
                  </p>
                  <p className="mt-1 text-sm text-stone-600">
                    {TRAVEL_QUOTES[quoteIndex].detail}
                  </p>
                </motion.div>
                <div className="flex items-center gap-2 text-sm font-medium text-cyan-800">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking
                </div>
              </div>
            </motion.div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-4 px-6 rounded-xl bg-cyan-800 text-white font-semibold text-lg hover:bg-cyan-900 hover:shadow-lg hover:shadow-cyan-900/15 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Your Itinerary...
              </>
            ) : (
              <>
                Generate My Trip
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
