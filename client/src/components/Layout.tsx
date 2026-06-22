import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  User,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import travelWaveLogo from '../assets/TravelWave.png';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Create Trip', href: '/create-trip', icon: PlusCircle },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-72 bg-white border-r border-border shadow-[8px_0_30px_rgba(41,54,129,0.03)] lg:block">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-7 border-b border-border">
            <img src={travelWaveLogo} alt="TravelWave logo" className="h-12 w-12 rounded-xl object-contain bg-white shadow-sm border border-border" />
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-[#CD1C18] to-[#9B1313] bg-clip-text text-transparent">
                TravelWave
              </h1>
              <p className="text-xs font-medium text-stone-500">AI Travel Planner</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${active
                      ? 'bg-[#FFF2F1] text-[#9B1313] border border-[#F4CFCF] shadow-sm'
                      : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-[#CD1C18]' : ''}`} />
                  <span className="font-medium">{item.name}</span>
                  {active && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-1.5 h-8 rounded-full bg-[#CD1C18]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background border border-border">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FFA896] to-[#CD1C18] flex items-center justify-center text-white font-bold">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-stone-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-stone-500 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-white transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-stone-500" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <img src={travelWaveLogo} alt="TravelWave logo" className="h-9 w-9 rounded-lg object-contain bg-white shadow-sm border border-border" />
            <h1 className="text-xl font-black bg-gradient-to-r from-[#CD1C18] to-[#9B1313] bg-clip-text text-transparent">
              TravelWave
            </h1>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-stone-100 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-stone-600" />
            ) : (
              <Menu className="w-6 h-6 text-stone-600" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="lg:hidden fixed inset-0 z-40 bg-white/95 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="pt-20 px-4 pb-6">
              <nav className="space-y-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                        ${active
                          ? 'bg-teal-50 text-cyan-800 border border-teal-200'
                          : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                        }
                      `}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Logout</span>
                </button>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="lg:ml-72 pt-16 lg:pt-0 min-h-screen">
        <div className="p-4 md:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
