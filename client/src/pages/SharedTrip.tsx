import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  MapPin,
  Calendar,
  DollarSign,
  Hotel,
  Package,
  Clock,
  Sun,
  Cloud,
  Users,
  Eye,
  ArrowLeft,
  Compass,
} from 'lucide-react';

interface SharedTrip {
  _id: string;
  destination: string;
  durationDays: number;
  budgetTier: 'Low' | 'Medium' | 'High';
  itinerary: any[];
  hotels: any[];
  estimatedBudget: any;
  packingList: any[];
  viewCount: number;
  createdAt: string;
}

export const SharedTrip: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [trip, setTrip] = useState<SharedTrip | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSharedTrip();
  }, [token]);

  const fetchSharedTrip = async () => {
    try {
      const response = await api.get(`/api/shared/${token}`);
      if (response.success) {
        setTrip(response.data);
      }
    } catch (error) {
      toast.error('Failed to load shared trip');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-4 text-slate-400">Loading shared trip...</p>
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-semibold text-slate-300">Trip not found</h3>
          <p className="text-slate-400 mt-2">This shared trip Venkysn't exist or has been removed</p>
          <Link to="/" className="inline-block mt-6 text-indigo-400 hover:text-indigo-300">
            Go to TravelWave
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <div className="flex-1 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-sm">
              <Eye className="w-3 h-3" />
              {trip.viewCount} views
            </div>
          </div>
        </div>

        {/* Trip Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 mb-8 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-4">
            <Compass className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-100">{trip.destination}</h1>
          <div className="flex items-center justify-center gap-4 mt-2 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {trip.durationDays} days
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
              trip.budgetTier === 'Low' ? 'text-green-400 bg-green-400/10 border-green-400/20' :
              trip.budgetTier === 'Medium' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' :
              'text-purple-400 bg-purple-400/10 border-purple-400/20'
            }`}>
              {trip.budgetTier} Budget
            </span>
            <span>• {formatCurrency(trip.estimatedBudget.total)} total</span>
          </div>
          <p className="text-sm text-slate-500 mt-4">
            Planned with TravelWave AI • {new Date(trip.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </motion.div>

        {/* Itinerary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-indigo-400" />
            Itinerary
          </h2>
          {trip.itinerary.map((day) => (
            <div key={day.dayNumber} className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-4 bg-slate-800/30 border-b border-slate-800">
                <h3 className="text-lg font-semibold text-slate-200">Day {day.dayNumber}</h3>
              </div>
              <div className="p-4 space-y-3">
                {day.activities.map((activity: any, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-slate-800/30 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-slate-200">{activity.title}</h4>
                        <span className="text-sm text-indigo-400">{formatCurrency(activity.estimatedCostINR)}</span>
                      </div>
                      {activity.description && (
                        <p className="text-sm text-slate-400 mt-1">{activity.description}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          {activity.timeOfDay === 'Morning' ? <Sun className="w-3 h-3" /> :
                           activity.timeOfDay === 'Afternoon' ? <Cloud className="w-3 h-3" /> :
                           <Clock className="w-3 h-3" />}
                          {activity.timeOfDay}
                        </span>
                        {activity.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {activity.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Hotels */}
        {trip.hotels && trip.hotels.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8"
          >
            <h2 className="text-2xl font-bold text-slate-200 flex items-center gap-2 mb-4">
              <Hotel className="w-6 h-6 text-indigo-400" />
              Recommended Hotels
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {trip.hotels.map((hotel, index) => (
                <div key={index} className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                  <h3 className="font-semibold text-slate-200">{hotel.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                      hotel.tier === 'Budget' ? 'text-green-400 bg-green-400/10 border-green-400/20' :
                      hotel.tier === 'Mid-Range' ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' :
                      'text-purple-400 bg-purple-400/10 border-purple-400/20'
                    }`}>
                      {hotel.tier}
                    </span>
                    <span className="text-sm text-slate-400">{hotel.rating}</span>
                  </div>
                  <p className="text-sm text-indigo-400 mt-2">{formatCurrency(hotel.estimatedCostNightINR)}/night</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
          >
            Plan Your Own Trip with TravelWave
          </Link>
        </motion.div>
      </div>
    </div>
  );
};