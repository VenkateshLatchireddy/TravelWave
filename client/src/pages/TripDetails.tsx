import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  Hotel,
  Package,
  Edit,
  Trash2,
  Plus,
  X,
  Check,
  Clock,
  Users,
  Share2,
  Download,
  RefreshCw,
  Sun,
  Cloud,
  CloudRain,
  Wind,
  Thermometer,
  Umbrella,
  Shield,
  Heart,
  HeartOff,
  Star,
  Wifi,
  Coffee as CoffeeIcon,
  Car,
  Utensils,
  Camera,
  Landmark,
  Mountain,
  ShoppingBag,
  Globe,
  ChevronDown,
  Loader2,
} from 'lucide-react';

interface Activity {
  _id?: string;
  title: string;
  description: string;
  estimatedCostINR: number;
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening';
  location: string;
  duration: string;
  isCustom?: boolean;
}

interface ItineraryDay {
  dayNumber: number;
  title: string;
  activities: Activity[];
}

interface Hotel {
  _id?: string;
  name: string;
  tier: 'Budget' | 'Mid-Range' | 'Luxury';
  estimatedCostNightINR: number;
  rating: string;
  location: string;
  amenities: string[];
}

interface PackingItem {
  _id?: string;
  item: string;
  category: 'Documents' | 'Clothing' | 'Gear' | 'Electronics' | 'Health' | 'Other';
  isPacked: boolean;
  quantity: number;
  notes: string;
}

interface Trip {
  _id: string;
  destination: string;
  durationDays: number;
  budgetTier: 'Low' | 'Medium' | 'High';
  interests: string[];
  itinerary: ItineraryDay[];
  hotels: Hotel[];
  estimatedBudget: {
    transport: number;
    accommodation: number;
    food: number;
    activities: number;
    miscellaneous: number;
    total: number;
    currency: string;
  };
  packingList: PackingItem[];
  status: 'Draft' | 'Generated' | 'Modified' | 'Shared';
  isPublic: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

const TIME_OF_DAY_ICONS = {
  Morning: Sun,
  Afternoon: Cloud,
  Evening: CloudRain,
};

const CATEGORY_ICONS = {
  Documents: Shield,
  Clothing: Users,
  Gear: Package,
  Electronics: Camera,
  Health: Heart,
  Other: Globe,
};

const BUDGET_TIER_COLORS = {
  Low: 'text-green-400 bg-green-400/10 border-green-400/20',
  Medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  High: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
};

export const TripDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'itinerary' | 'hotels' | 'packing' | 'budget'>('itinerary');
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({});
  const [newActivityDay, setNewActivityDay] = useState<number | null>(null);
  const [isRegenerating, setIsRegenerating] = useState<number | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isRegeneratingPacking, setIsRegeneratingPacking] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [showFeedbackInput, setShowFeedbackInput] = useState<number | null>(null);

  useEffect(() => {
    fetchTrip();
  }, [id]);

  const fetchTrip = async () => {
    try {
      const response = await api.get(`/api/trips/${id}`);
      if (response.success) {
        setTrip(response.data);
      }
    } catch (error) {
      toast.error('Failed to load trip details');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddActivity = async (dayNumber: number) => {
    if (!newActivity.title?.trim()) {
      toast.error('Please enter an activity title');
      return;
    }

    try {
      const response = await api.post(`/api/trips/${id}/activities`, {
        dayNumber,
        activity: {
          title: newActivity.title,
          description: newActivity.description || '',
          estimatedCostINR: newActivity.estimatedCostINR || 0,
          timeOfDay: newActivity.timeOfDay || 'Morning',
          location: newActivity.location || '',
          duration: newActivity.duration || '',
          isCustom: true,
        },
      });

      if (response.success) {
        setTrip(response.data);
        setNewActivity({});
        setNewActivityDay(null);
        toast.success('Activity added successfully');
      }
    } catch (error) {
      toast.error('Failed to add activity');
    }
  };

  const handleRemoveActivity = async (dayNumber: number, activityIndex: number) => {
    if (!confirm('Are you sure you want to remove this activity?')) return;

    try {
      const response = await api.delete(`/api/trips/${id}/activities`, {
        data: { dayNumber, activityIndex },
      });

      if (response.success) {
        setTrip(response.data);
        toast.success('Activity removed successfully');
      }
    } catch (error) {
      toast.error('Failed to remove activity');
    }
  };

  const handleRegenerateDay = async (dayNumber: number) => {
    setIsRegenerating(dayNumber);
    try {
      const response = await api.put(`/api/trips/${id}/regenerate-day`, {
        dayNumber,
        feedback,
      });

      if (response.success) {
        setTrip(response.data);
        setFeedback('');
        setShowFeedbackInput(null);
        toast.success(`Day ${dayNumber} regenerated successfully`);
      }
    } catch (error) {
      toast.error('Failed to regenerate day');
    } finally {
      setIsRegenerating(null);
    }
  };

  const handleTogglePackingItem = async (itemId: string) => {
    try {
      const response = await api.put(`/api/trips/${id}/packing/toggle/${itemId}`);
      if (response.success) {
        setTrip(response.data);
      }
    } catch (error) {
      toast.error('Failed to update packing item');
    }
  };

  const handleRegeneratePackingList = async () => {
    setIsRegeneratingPacking(true);
    try {
      const response = await api.post(`/api/trips/${id}/packing/regenerate`);
      if (response.success) {
        setTrip(response.data);
        toast.success('Packing list regenerated with weather considerations');
      }
    } catch (error) {
      toast.error('Failed to regenerate packing list');
    } finally {
      setIsRegeneratingPacking(false);
    }
  };

  const handleShareTrip = async () => {
    setIsSharing(true);
    try {
      const response = await api.post(`/api/trips/${id}/share`);
      if (response.success) {
        await navigator.clipboard.writeText(response.data.shareUrl);
        toast.success('Share link copied to clipboard!');
        setTrip(prev => prev ? { ...prev, isPublic: true, shareToken: response.data.shareToken } : null);
      }
    } catch (error) {
      toast.error('Failed to share trip');
    } finally {
      setIsSharing(false);
    }
  };

  const handleDeleteTrip = async () => {
    if (!confirm('Are you sure you want to delete this trip? This action cannot be undone.')) return;
    
    try {
      await api.delete(`/api/trips/${id}`);
      toast.success('Trip deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Failed to delete trip');
    }
  };

  const handleDownloadPDF = async () => {
    if (!trip) {
      return;
    }

    setIsDownloadingPdf(true);
    try {
      const response = await api.get(`/api/export/${trip._id}/pdf`, {
        responseType: 'blob',
      });
      const blob = response instanceof Blob ? response : new Blob([response as any], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fileDestination = trip.destination.replace(/[^\w-]+/g, '-').replace(/^-|-$/g, '') || 'Trip';

      link.href = url;
      link.download = `TravelWave-${fileDestination}-Itinerary.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('PDF downloaded successfully');
    } catch (error) {
      toast.error('Failed to download PDF');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getWeatherEmoji = (timeOfDay: string) => {
    switch (timeOfDay) {
      case 'Morning': return '🌅';
      case 'Afternoon': return '☀️';
      case 'Evening': return '🌅';
      default: return '🌤️';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-4 text-slate-400">Loading your itinerary...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🗺️</div>
        <h3 className="text-xl font-semibold text-slate-300">Trip not found</h3>
        <p className="text-slate-400 mt-2">The trip you're looking for Venkysn't exist</p>
        <Link to="/dashboard" className="inline-block mt-6 text-indigo-400 hover:text-indigo-300">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const packingList = trip.packingList || [];
  const packedCount = packingList.filter(item => item.isPacked).length;
  const packedPercentage = packingList.length > 0
    ? Math.round((packedCount / packingList.length) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg hover:bg-stone-100 transition-colors mt-0.5 shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-stone-500" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 truncate">{trip.destination}</h1>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="flex items-center gap-1 text-sm text-stone-500">
                <Calendar className="w-4 h-4" />
                {trip.durationDays} days
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${BUDGET_TIER_COLORS[trip.budgetTier]}`}>
                {trip.budgetTier} Budget
              </span>
              <span className="text-sm text-stone-400">{trip.viewCount} views</span>
            </div>
          </div>
        </div>
        {/* Action buttons — wraps on small screens */}
        <div className="flex flex-wrap items-center gap-2 pl-11">
          <button
            onClick={handleDownloadPDF}
            disabled={isDownloadingPdf}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {isDownloadingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span className="hidden xs:inline sm:inline">PDF</span>
          </button>
          <button
            onClick={handleShareTrip}
            disabled={isSharing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {isSharing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
            <span className="hidden xs:inline sm:inline">Share</span>
          </button>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${isEditing ? 'bg-indigo-500 text-white' : 'bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20'}`}
          >
            <Edit className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">{isEditing ? 'Done' : 'Edit'}</span>
          </button>
          <button
            onClick={handleDeleteTrip}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs — scrollable on mobile */}
      <div className="border-b border-stone-200 overflow-x-auto scrollbar-thin">
        <div className="flex gap-1 min-w-max">
          {[
            { id: 'itinerary', label: 'Itinerary', icon: MapPin },
            { id: 'hotels', label: 'Hotels', icon: Hotel },
            { id: 'packing', label: 'Packing', icon: Package },
            { id: 'budget', label: 'Budget', icon: DollarSign },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-3 text-sm font-medium transition-all border-b-2 whitespace-nowrap ${
                  active
                    ? 'border-[#CD1C18] text-[#CD1C18]'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'itinerary' && (
          <motion.div
            key="itinerary"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-8"
          >
            {trip.itinerary.map((day) => (
              <motion.div
                key={day.dayNumber}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-sm"
              >
                {/* Day Header */}
                <div className="p-4 sm:p-5 bg-stone-50 border-b border-stone-200">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#CD1C18]/10 flex items-center justify-center shrink-0">
                        <span className="text-lg sm:text-2xl font-bold text-[#CD1C18]">{day.dayNumber}</span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-base sm:text-lg font-semibold text-stone-900 truncate">{day.title || `Day ${day.dayNumber}`}</h3>
                        <p className="text-xs sm:text-sm text-stone-500">{day.activities.length} activities planned</p>
                      </div>
                    </div>
                    {/* Regenerate controls */}
                    {showFeedbackInput === day.dayNumber ? (
                      <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2">
                        <input
                          type="text"
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Enter feedback…"
                          className="flex-1 px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CD1C18]/30 min-w-0"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRegenerateDay(day.dayNumber)}
                            disabled={isRegenerating === day.dayNumber}
                            className="flex-1 xs:flex-none px-3 py-1.5 rounded-lg bg-[#CD1C18] text-white text-sm hover:bg-[#9B1313] transition-colors disabled:opacity-50"
                          >
                            {isRegenerating === day.dayNumber ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Regenerate'}
                          </button>
                          <button
                            onClick={() => { setShowFeedbackInput(null); setFeedback(''); }}
                            className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors"
                          >
                            <X className="w-4 h-4 text-stone-500" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowFeedbackInput(day.dayNumber)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 transition-colors text-xs sm:text-sm font-medium self-start sm:self-auto"
                      >
                        <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        Regenerate
                      </button>
                    )}
                  </div>
                </div>

                {/* Activities */}
                <div className="p-4 sm:p-5 space-y-3">
                  {day.activities.map((activity, index) => {
                    const TimeIcon = TIME_OF_DAY_ICONS[activity.timeOfDay] || Sun;
                    return (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-3 sm:p-4 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-stone-900 text-sm sm:text-base flex flex-wrap items-center gap-1.5">
                                <span className="truncate">{activity.title}</span>
                                {activity.isCustom && (
                                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 shrink-0">
                                    Custom
                                  </span>
                                )}
                              </h4>
                              {activity.description && (
                                <p className="text-xs sm:text-sm text-stone-500 mt-1 leading-relaxed">{activity.description}</p>
                              )}
                              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 text-xs text-stone-500">
                                <span className="flex items-center gap-1">
                                  <TimeIcon className="w-3 h-3" />
                                  {activity.timeOfDay}
                                </span>
                                {activity.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    <span className="truncate max-w-[120px] sm:max-w-none">{activity.location}</span>
                                  </span>
                                )}
                                {activity.duration && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {activity.duration}
                                  </span>
                                )}
                                <span className="text-[#CD1C18] font-semibold">
                                  {formatCurrency(activity.estimatedCostINR)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {isEditing && (
                          <button
                            onClick={() => handleRemoveActivity(day.dayNumber, index)}
                            className="p-1.5 sm:p-2 rounded-lg hover:bg-red-100 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}

                  {/* Add Activity */}
                  {isEditing && (
                    <div className="mt-3 p-4 border-2 border-dashed border-stone-300 rounded-lg">
                      {newActivityDay === day.dayNumber ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            placeholder="Activity title"
                            value={newActivity.title || ''}
                            onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CD1C18]/30 text-stone-900"
                          />
                          <textarea
                            placeholder="Description (optional)"
                            value={newActivity.description || ''}
                            onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                            className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CD1C18]/30 text-stone-900"
                            rows={2}
                          />
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <select
                              value={newActivity.timeOfDay || 'Morning'}
                              onChange={(e) => setNewActivity({ ...newActivity, timeOfDay: e.target.value as any })}
                              className="px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CD1C18]/30 text-stone-900"
                            >
                              <option value="Morning">Morning</option>
                              <option value="Afternoon">Afternoon</option>
                              <option value="Evening">Evening</option>
                            </select>
                            <input
                              type="number"
                              placeholder="Cost (INR)"
                              value={newActivity.estimatedCostINR || ''}
                              onChange={(e) => setNewActivity({ ...newActivity, estimatedCostINR: parseInt(e.target.value) || 0 })}
                              className="px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CD1C18]/30 text-stone-900"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAddActivity(day.dayNumber)}
                              className="px-4 py-2 rounded-lg bg-[#CD1C18] text-white text-sm hover:bg-[#9B1313] transition-colors font-medium"
                            >
                              Add Activity
                            </button>
                            <button
                              onClick={() => { setNewActivityDay(null); setNewActivity({}); }}
                              className="px-4 py-2 rounded-lg bg-stone-100 text-stone-600 text-sm hover:bg-stone-200 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setNewActivityDay(day.dayNumber)}
                          className="flex items-center gap-2 text-stone-400 hover:text-stone-700 transition-colors w-full justify-center py-2 text-sm"
                        >
                          <Plus className="w-4 h-4" />
                          Add Activity
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'hotels' && (
          <motion.div
            key="hotels"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
          >
            {trip.hotels.map((hotel, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white border border-stone-200 rounded-xl p-5 hover:border-stone-300 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between mb-3 gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-stone-900 truncate">{hotel.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                        hotel.tier === 'Budget' ? 'text-green-600 bg-green-50 border-green-200' :
                        hotel.tier === 'Mid-Range' ? 'text-amber-600 bg-amber-50 border-amber-200' :
                        'text-purple-600 bg-purple-50 border-purple-200'
                      }`}>
                        {hotel.tier}
                      </span>
                      <span className="text-sm text-stone-500">{hotel.rating}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-[#CD1C18]">{formatCurrency(hotel.estimatedCostNightINR)}</p>
                    <p className="text-xs text-stone-400">per night</p>
                  </div>
                </div>
                {hotel.location && (
                  <p className="text-sm text-stone-500 flex items-center gap-1 mb-3">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{hotel.location}</span>
                  </p>
                )}
                {hotel.amenities && hotel.amenities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {hotel.amenities.map((amenity, i) => {
                      const Icon = amenity.includes('WiFi') ? Wifi :
                                  amenity.includes('Breakfast') ? CoffeeIcon :
                                  amenity.includes('Parking') ? Car : Star;
                      return (
                        <span key={i} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-100 text-xs text-stone-600">
                          <Icon className="w-3 h-3 shrink-0" />
                          {amenity}
                        </span>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'packing' && (
          <motion.div
            key="packing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <div className="bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-stone-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-[#CD1C18]" />
                    AI Weather-Aware Packing
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 mt-1">
                    Customised for {trip.destination}'s weather & your activities
                  </p>
                </div>
                <button
                  onClick={handleRegeneratePackingList}
                  disabled={isRegeneratingPacking}
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 transition-colors disabled:opacity-50 text-sm font-medium self-start sm:self-auto"
                >
                  {isRegeneratingPacking ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  Regenerate
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {packingList.map((item) => {
                  const Icon = CATEGORY_ICONS[item.category] || Package;
                  return (
                    <motion.div
                      key={item._id || item.item}
                      whileHover={{ scale: 1.01 }}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                        item.isPacked
                          ? 'bg-green-50 border-green-200'
                          : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                      }`}
                      onClick={() => item._id && handleTogglePackingItem(item._id)}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors shrink-0 mt-0.5 ${
                        item.isPacked ? 'bg-green-500 border-green-500' : 'border-stone-400'
                      }`}>
                        {item.isPacked && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className={`text-sm font-medium ${item.isPacked ? 'text-green-700 line-through' : 'text-stone-800'}`}>
                            {item.item}
                            {item.quantity > 1 && <span className="text-xs text-stone-400 ml-1">x{item.quantity}</span>}
                          </p>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-stone-200 text-xs text-stone-600">
                            <Icon className="w-2.5 h-2.5" />
                            <span className="truncate max-w-[6rem]">{item.category}</span>
                          </span>
                        </div>
                        {item.notes && (
                          <p className="text-xs text-stone-400 mt-1 leading-snug">• {item.notes}</p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {packingList.length === 0 && (
                <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 p-6 text-center">
                  <p className="text-sm font-medium text-stone-600">No packing items yet</p>
                  <p className="mt-1 text-sm text-stone-400">Regenerate with weather to create a fresh packing list.</p>
                </div>
              )}

              <div className="mt-4 flex items-center gap-4 text-sm text-stone-500">
                <span>{packedCount} / {packingList.length} packed</span>
                <span className="text-green-600 font-semibold">{packedPercentage}%</span>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'budget' && (
          <motion.div
            key="budget"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            {/* Total Budget hero card */}
            <div className="bg-gradient-to-br from-[#CD1C18]/10 to-[#9B1313]/10 border border-[#CD1C18]/20 rounded-xl p-6 sm:p-8 text-center">
              <p className="text-sm text-stone-500 mb-1">Estimated Total Budget</p>
              <p className="text-4xl sm:text-5xl font-bold text-[#CD1C18]">
                {formatCurrency(trip.estimatedBudget.total)}
              </p>
              <p className="text-sm text-stone-400 mt-2">{trip.durationDays} days in {trip.destination}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Breakdown */}
              <div className="lg:col-span-2 bg-white border border-stone-200 rounded-xl p-5 sm:p-6 shadow-sm">
                <h3 className="text-base font-semibold text-stone-900 mb-4">Budget Breakdown</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Transport', value: trip.estimatedBudget.transport, icon: Car },
                    { label: 'Accommodation', value: trip.estimatedBudget.accommodation, icon: Hotel },
                    { label: 'Food', value: trip.estimatedBudget.food, icon: Utensils },
                    { label: 'Activities', value: trip.estimatedBudget.activities, icon: Camera },
                    { label: 'Miscellaneous', value: trip.estimatedBudget.miscellaneous, icon: Globe },
                  ].map((item) => {
                    const Icon = item.icon;
                    const percentage = trip.estimatedBudget.total > 0
                      ? (item.value / trip.estimatedBudget.total) * 100 : 0;
                    return (
                      <div key={item.label}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="flex items-center gap-2 text-sm text-stone-600">
                            <Icon className="w-4 h-4 text-stone-400" />
                            {item.label}
                          </span>
                          <span className="text-sm font-semibold text-stone-800">{formatCurrency(item.value)}</span>
                        </div>
                        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#CD1C18] to-[#E8622A] rounded-full transition-all duration-1000"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Daily average */}
              <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
                <h3 className="text-base font-semibold text-stone-900 mb-4">Daily Average</h3>
                <div className="space-y-3">
                  <div className="p-4 bg-stone-50 rounded-lg">
                    <p className="text-xs text-stone-500 mb-1">Per Day</p>
                    <p className="text-2xl font-bold text-stone-900">
                      {formatCurrency(trip.estimatedBudget.total / trip.durationDays)}
                    </p>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-lg">
                    <p className="text-xs text-stone-500 mb-1">Per Person (Daily)</p>
                    <p className="text-2xl font-bold text-stone-900">
                      {formatCurrency(trip.estimatedBudget.total / trip.durationDays)}
                    </p>
                    <p className="text-xs text-stone-400 mt-1">Based on 1 person</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
