import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react';
import travelWaveLogo from '../assets/TravelWave.png';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '', password: '', firstName: '', lastName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password))
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    return newErrors;
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    setServerError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setIsLoading(true); setErrors({}); setServerError(null);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (error: any) {
      setServerError(error.response?.data?.error?.message || error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const inputCls = (field: string) =>
    `w-full px-4 py-3 rounded-xl border bg-white text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#CD1C18]/30 transition-all ${errors[field] ? 'border-red-400' : 'border-stone-300'}`;
  const inputWithIconCls = (field: string) =>
    `w-full pl-10 pr-4 py-3 rounded-xl border bg-white text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#CD1C18]/30 transition-all ${errors[field] ? 'border-red-400' : 'border-stone-300'}`;

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* ── Left panel ── */}
      <div className="hidden md:flex md:w-5/12 lg:w-1/2 bg-gradient-to-br from-[#9B1313] via-[#CD1C18] to-[#E8622A] relative overflow-hidden flex-col justify-between p-10 lg:p-14">
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute bottom-[-60px] right-[-60px] w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-[-40px] w-40 h-40 rounded-full bg-black/10" />

        <div className="relative z-10 flex items-center gap-3">
          <img src={travelWaveLogo} alt="TravelWave" className="w-10 h-10 rounded-xl object-contain bg-white/20 p-1" />
          <span className="text-2xl font-black text-white tracking-tight">TravelWave</span>
        </div>

        <div className="relative z-10">
          <div className="text-5xl lg:text-6xl mb-4">🗺️</div>
          <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight mb-4">
            Your adventure<br />starts here
          </h2>
          <p className="text-white/75 text-base lg:text-lg leading-relaxed">
            Join thousands of travellers who plan smarter with AI-curated Indian itineraries.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              { icon: '🗺️', label: 'Smart Itineraries' },
              { icon: '🏨', label: 'Hotel Picks' },
              { icon: '🧳', label: 'Packing Lists' },
              { icon: '📄', label: 'PDF Export' },
            ].map(f => (
              <div key={f.label} className="flex items-center gap-2 text-white/80 text-sm">
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/40 text-xs">© {new Date().getFullYear()} TravelWave</p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-16 min-h-screen md:min-h-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="w-full max-w-sm sm:max-w-md"
        >
          {/* Mobile logo */}
          <div className="flex md:hidden items-center gap-3 mb-8">
            <img src={travelWaveLogo} alt="TravelWave" className="w-9 h-9 rounded-xl object-contain border border-border" />
            <span className="text-xl font-black bg-gradient-to-r from-[#CD1C18] to-[#9B1313] bg-clip-text text-transparent">TravelWave</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900">Create your account</h1>
            <p className="text-stone-500 mt-1 text-sm sm:text-base">Start planning your dream trip today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {serverError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900">Registration Failed</h4>
                  <p className="mt-0.5">{serverError}</p>
                </div>
              </div>
            )}

            {/* Name fields */}
            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">First Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={e => handleInputChange('firstName', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-white text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#CD1C18]/30 transition-all ${errors.firstName ? 'border-red-400' : 'border-stone-300'}`}
                    placeholder="First"
                    disabled={isLoading}
                  />
                </div>
                {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-stone-700 mb-1.5">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={e => handleInputChange('lastName', e.target.value)}
                  className={inputCls('lastName')}
                  placeholder="Last"
                  disabled={isLoading}
                />
                {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  className={inputWithIconCls('email')}
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={e => handleInputChange('password', e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 rounded-xl border bg-white text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#CD1C18]/30 transition-all ${errors.password ? 'border-red-400' : 'border-stone-300'}`}
                  placeholder="Min 8 chars, upper + lower + number"
                  disabled={isLoading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
              <p className="mt-1 text-xs text-stone-400">Must contain uppercase, lowercase, and a number</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-[#CD1C18] to-[#9B1313] hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-900/20 mt-2"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account…
                </div>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-500">
            Already have an account?{' '}
            <Link to="/login" className="text-[#CD1C18] hover:text-[#9B1313] font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};