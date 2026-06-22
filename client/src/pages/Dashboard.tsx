import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { motion } from 'framer-motion';
import {
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  Plus,
  Eye,
  Edit,
  Trash2,
  Share2,
  Compass,
  TrendingUp,
  Hotel,
  Package,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

interface Trip {
  _id: string;
  destination: string;
  durationDays: number;
  budgetTier: 'Low' | 'Medium' | 'High';
  status: 'Draft' | 'Generated' | 'Modified' | 'Shared';
  itinerary: any[];
  estimatedBudget: {
    total: number;
    currency: string;
  };
  createdAt: string;
  viewCount: number;
  isPublic: boolean;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    totalBudget: 0,
    averageDays: 0,
  });

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await api.get('/api/trips');
      if (response.success) {
        const tripsData = response.data.trips || [];
        setTrips(tripsData);
        calculateStats(tripsData);
      }
    } catch (error) {
      toast.error('Failed to load trips');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (tripsData: Trip[]) => {
    const total = tripsData.length;
    const totalBudget = tripsData.reduce((sum, trip) => sum + (trip.estimatedBudget?.total || 0), 0);
    const averageDays = total > 0 ? tripsData.reduce((sum, trip) => sum + trip.durationDays, 0) / total : 0;
    setStats({ total, totalBudget, averageDays });
  };

  const handleDeleteTrip = async (id: string) => {
    if (!confirm('Are you sure you want to delete this trip?')) return;
    try {
      await api.delete(`/api/trips/${id}`);
      toast.success('Trip deleted successfully');
      fetchTrips();
    } catch (error) {
      toast.error('Failed to delete trip');
    }
  };

  const handleShareTrip = async (id: string) => {
    try {
      const response = await api.post(`/api/trips/${id}/share`);
      if (response.success) {
        const shareUrl = response.data.shareUrl;
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Share link copied to clipboard!');
      }
    } catch (error) {
      toast.error('Failed to share trip');
    }
  };

  const getBudgetColor = (tier: string) => {
    switch (tier) {
      case 'Low': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'High': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Generated': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'Modified': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      case 'Shared': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-4 text-slate-400">Loading your trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-stone-500 mt-1 text-sm sm:text-base">Plan your next Indian adventure with AI</p>
        </div>
        <Link
          to="/create-trip"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#CD1C18] to-[#9B1313] text-white font-semibold hover:opacity-90 hover:shadow-lg transition-all text-sm sm:text-base self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          New Trip
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-stone-500">Total Trips</p>
              <p className="text-xl sm:text-2xl font-bold text-stone-900">{stats.total}</p>
            </div>
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg bg-[#CD1C18]/10 flex items-center justify-center">
              <Compass className="w-4 h-4 sm:w-6 sm:h-6 text-[#CD1C18]" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-xs sm:text-sm text-stone-500">Total Budget</p>
              <p className="text-lg sm:text-2xl font-bold text-stone-900 truncate">
                ₹{stats.totalBudget.toLocaleString()}
              </p>
            </div>
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
              <DollarSign className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-stone-500">Avg Duration</p>
              <p className="text-xl sm:text-2xl font-bold text-stone-900">
                {stats.averageDays.toFixed(1)}d
              </p>
            </div>
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg bg-purple-50 flex items-center justify-center">
              <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-stone-500">Active</p>
              <p className="text-xl sm:text-2xl font-bold text-stone-900">
                {trips.filter(t => t.status !== 'Shared').length}
              </p>
            </div>
            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg bg-amber-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Trips Grid */}
      {trips.length === 0 ? (
        <div className="text-center py-12 sm:py-16 bg-white border border-stone-200 rounded-2xl shadow-sm">
          <Compass className="w-12 h-12 sm:w-16 sm:h-16 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg sm:text-xl font-semibold text-stone-700">No trips yet</h3>
          <p className="text-stone-400 mt-2 text-sm sm:text-base">Start planning your first AI-powered Indian adventure</p>
          <Link
            to="/create-trip"
            className="inline-block mt-6 px-6 py-3 rounded-xl bg-gradient-to-r from-[#CD1C18] to-[#9B1313] text-white font-semibold hover:opacity-90 transition-all text-sm"
          >
            Create Your First Trip
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {trips.map((trip, index) => (
            <motion.div
              key={trip._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-stone-300 hover:shadow-md transition-all group"
            >
              <div className="p-5 sm:p-6">
                {/* Destination & Budget */}
                <div className="flex items-start justify-between mb-4 gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-stone-900 group-hover:text-[#CD1C18] transition-colors truncate">
                      {trip.destination}
                    </h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getBudgetColor(trip.budgetTier)}`}>
                        {trip.budgetTier} Budget
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(trip.status)}`}>
                        {trip.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-stone-900">
                      ₹{trip.estimatedBudget?.total?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-stone-400">Total</p>
                  </div>
                </div>

                {/* Trip Details */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-sm text-stone-500">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>{trip.durationDays} days</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-stone-500">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{new Date(trip.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  {trip.itinerary && (
                    <div className="flex items-center gap-2 text-sm text-stone-500">
                      <Hotel className="w-3.5 h-3.5 shrink-0" />
                      <span>{trip.itinerary.length} days planned</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
                  <Link
                    to={`/trip/${trip._id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#CD1C18]/10 text-[#CD1C18] hover:bg-[#CD1C18]/20 transition-colors text-sm font-medium"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </Link>
                  <button
                    onClick={() => handleShareTrip(trip._id)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteTrip(trip._id)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};