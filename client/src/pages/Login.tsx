import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import travelWaveLogo from '../assets/TravelWave.png';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    return newErrors;
  };

  const handleInputChange = (field: 'email' | 'password', value: string) => {
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
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (error: any) {
      setServerError(error.response?.data?.error?.message || error.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* ── Left decorative panel (md+) ── */}
      <div className="hidden md:flex md:w-5/12 lg:w-1/2 bg-gradient-to-br from-[#9B1313] via-[#CD1C18] to-[#E8622A] relative overflow-hidden flex-col justify-between p-10 lg:p-14">
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full bg-white/5" />
        <div className="absolute bottom-[-60px] right-[-60px] w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-[-40px] w-40 h-40 rounded-full bg-black/10" />

        <div className="relative z-10 flex items-center gap-3">
          <img src={travelWaveLogo} alt="TravelWave" className="w-10 h-10 rounded-xl object-contain bg-white/20 p-1" />
          <span className="text-2xl font-black text-white tracking-tight">TravelWave</span>
        </div>

        <div className="relative z-10">
          <div className="text-5xl lg:text-6xl mb-4">✈️</div>
          <h2 className="text-3xl lg:text-4xl font-black text-white leading-tight mb-4">
            Explore India<br />your way
          </h2>
          <p className="text-white/75 text-base lg:text-lg leading-relaxed">
            AI-powered itineraries crafted around your budget, interests, and schedule.
          </p>
          <div className="mt-8 flex flex-col gap-3">
            {['Personalised day-by-day plans', 'Hotel & packing suggestions', 'PDF export & easy sharing'].map(f => (
              <div key={f} className="flex items-center gap-3 text-white/80 text-sm">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</div>
                {f}
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
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900">Welcome back</h1>
            <p className="text-stone-500 mt-1 text-sm sm:text-base">Sign in to continue your journey</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {serverError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-red-900">Login Failed</h4>
                  <p className="mt-0.5">{serverError}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => handleInputChange('email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-white text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#CD1C18]/30 transition-all ${errors.email ? 'border-red-400' : 'border-stone-300'}`}
                  placeholder="you@example.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={e => handleInputChange('password', e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 rounded-xl border bg-white text-stone-900 text-sm placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#CD1C18]/30 transition-all ${errors.password ? 'border-red-400' : 'border-stone-300'}`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2 text-sm text-stone-500 cursor-pointer select-none">
                <input type="checkbox" className="rounded border-stone-300 accent-[#CD1C18]" />
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-[#CD1C18] to-[#9B1313] hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-900/20"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in…
                </div>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#CD1C18] hover:text-[#9B1313] font-semibold transition-colors">
              Create one now
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};