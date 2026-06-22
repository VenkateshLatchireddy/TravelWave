import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { api } from '../utils/api';
import {
  User,
  Mail,
  Calendar,
  Shield,
  Edit,
  Save,
  X,
  Camera,
  TrendingUp,
  Package,
  MapPin,
} from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  const [stats, setStats] = useState([
    { label: 'Trips Planned', value: '...', icon: MapPin },
    { label: 'Days Traveled', value: '...', icon: Calendar },
    { label: 'Budget Managed', value: '...', icon: TrendingUp },
    { label: 'Packing Lists', value: '...', icon: Package },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/api/trips');
        if (response.success) {
          const tripsData = response.data.trips || [];
          const tripsCount = tripsData.length;
          const totalDays = tripsData.reduce((sum: number, t: any) => sum + (t.durationDays || 0), 0);
          const totalBudget = tripsData.reduce((sum: number, t: any) => sum + (t.estimatedBudget?.total || 0), 0);
          const totalPackingItems = tripsData.reduce((sum: number, t: any) => sum + (t.packingList?.length || 0), 0);

          const formatBudget = (value: number) => {
            if (value >= 100000) {
              return `₹${(value / 100000).toFixed(1).replace(/\.0$/, '')}L`;
            }
            return `₹${value.toLocaleString('en-IN')}`;
          };

          setStats([
            { label: 'Trips Planned', value: tripsCount.toString(), icon: MapPin },
            { label: 'Days Traveled', value: totalDays.toString(), icon: Calendar },
            { label: 'Budget Managed', value: formatBudget(totalBudget), icon: TrendingUp },
            { label: 'Packing Lists', value: totalPackingItems.toString(), icon: Package },
          ]);
        }
      } catch (error) {
        toast.error('Failed to load user statistics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if any changes were actually made
    const isUnchanged =
      formData.firstName.trim() === (user?.firstName || '') &&
      formData.lastName.trim() === (user?.lastName || '');

    if (isUnchanged) {
      setIsEditing(false);
      return; // Silently get back
    }

    // In a real app, you'd have an API endpoint to update profile
    // For now, we'll just update the local state
    updateUser({
      ...user!,
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
    });
    setIsEditing(false);
    toast.success('Profile updated successfully');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 sm:space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-[#CD1C18]/10 to-[#9B1313]/10 border border-[#CD1C18]/20 rounded-2xl p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-[#CD1C18] to-[#9B1313] flex items-center justify-center text-2xl sm:text-3xl font-bold text-white">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <button className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#CD1C18] hover:bg-[#9B1313] transition-colors">
                <Camera className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </button>
            </div>

            {/* Info / Edit form */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs sm:text-sm text-stone-500 mb-1">First Name</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CD1C18]/30 text-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm text-stone-500 mb-1">Last Name</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#CD1C18]/30 text-stone-900"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button type="submit" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#CD1C18] text-white text-sm hover:bg-[#9B1313] transition-colors font-medium">
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsEditing(false); setFormData({ firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.email || '' }); }}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-stone-100 text-stone-600 text-sm hover:bg-stone-200 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h1 className="text-xl sm:text-2xl font-bold text-stone-900">{user?.firstName} {user?.lastName}</h1>
                  <p className="text-stone-500 flex items-center justify-center sm:justify-start gap-2 mt-1 text-sm">
                    <Mail className="w-4 h-4" />
                    {user?.email}
                  </p>
                  <div className="flex items-center justify-center sm:justify-start gap-3 mt-3">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1.5 text-sm text-[#CD1C18] hover:text-[#9B1313] transition-colors font-medium"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit Profile
                    </button>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-xs font-medium">
                      <Shield className="w-3.5 h-3.5" />
                      Verified
                    </div>
                  </div>
                  <p className="text-xs text-stone-400 mt-2">Member since {new Date().getFullYear()}</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white border border-stone-200 rounded-xl p-4 text-center shadow-sm"
              >
                <div className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#CD1C18]/10 mx-auto mb-2">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#CD1C18]" />
                </div>
                <p className="text-lg sm:text-xl font-bold text-stone-900">{stat.value}</p>
                <p className="text-xs text-stone-500 mt-0.5">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
