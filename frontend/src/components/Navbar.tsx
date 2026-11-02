import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  PhoneCall,
  Mic,
  MapPin,
  Users,
  AlertTriangle,
  History,
  Bot,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Compass,
  Clock
} from 'lucide-react';

interface NavbarProps {
  onOpenSimulatedCall: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSimulatedCall }) => {
  const { user, logout, activeIncident } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-navy-950 text-white border-b border-navy-800 sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emergency-600 to-rose-500 flex items-center justify-center shadow-lg shadow-emergency-600/30 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  SURAKSHA<span className="text-emergency-500">.AI</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  DEMO MODE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Women Safety & Emergency Response</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          {user ? (
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/dashboard') ? 'bg-navy-800 text-white' : 'text-slate-300 hover:text-white hover:bg-navy-900'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/contacts"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/contacts') ? 'bg-navy-800 text-white' : 'text-slate-300 hover:text-white hover:bg-navy-900'
                }`}
              >
                Contacts
              </Link>
              <Link
                to="/nearby"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/nearby') ? 'bg-navy-800 text-white' : 'text-slate-300 hover:text-white hover:bg-navy-900'
                }`}
              >
                Nearby Help & Map
              </Link>
              <Link
                to="/location-sharing"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/location-sharing') ? 'bg-navy-800 text-white' : 'text-slate-300 hover:text-white hover:bg-navy-900'
                }`}
              >
                Live Tracking
              </Link>
              <Link
                to="/community-reports"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/community-reports') ? 'bg-navy-800 text-white' : 'text-slate-300 hover:text-white hover:bg-navy-900'
                }`}
              >
                Safety Reports
              </Link>
              <Link
                to="/assistant"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/assistant') ? 'bg-navy-800 text-white' : 'text-slate-300 hover:text-white hover:bg-navy-900'
                }`}
              >
                AI Assistant
              </Link>
              {user.is_admin && (
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive('/admin') ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40' : 'text-amber-400 hover:bg-navy-900'
                  }`}
                >
                  Admin Portal
                </Link>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-4">
              <Link to="/#features" className="text-sm text-slate-300 hover:text-white transition-colors">
                Features
              </Link>
              <Link to="/#how-it-works" className="text-sm text-slate-300 hover:text-white transition-colors">
                Emergency Workflow
              </Link>
              <Link to="/#faq" className="text-sm text-slate-300 hover:text-white transition-colors">
                Safety FAQ
              </Link>
            </div>
          )}

          {/* Action Buttons & User Menu */}
          <div className="flex items-center gap-3">
            {/* Simulated Call Demo Button */}
            <button
              onClick={onOpenSimulatedCall}
              title="Launch fake incoming call to escape an uncomfortable setting"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 transition-all hover:border-slate-500"
            >
              <PhoneCall className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Simulated Call</span>
            </button>

            {/* Emergency SOS Quick Pill */}
            <Link
              to="/emergency"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-md transition-all ${
                activeIncident
                  ? 'bg-emergency-600 text-white animate-emergency shadow-emergency-600/50'
                  : 'bg-gradient-to-r from-emergency-600 to-rose-600 text-white hover:brightness-110 shadow-emergency-600/30'
              }`}
            >
              <ShieldAlert className="w-4 h-4 animate-bounce" />
              <span>{activeIncident ? 'SOS ACTIVE' : 'EMERGENCY SOS'}</span>
            </Link>

            {user ? (
              <div className="hidden md:flex items-center gap-2 border-l border-navy-800 pl-3">
                <Link
                  to="/profile"
                  className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-navy-800 transition-colors"
                  title="Profile & Settings"
                >
                  <UserIcon className="w-4 h-4" />
                </Link>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-navy-800 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-200 hover:text-white hover:bg-navy-900 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-navy-950 hover:bg-slate-100 transition-colors shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-navy-900 border-b border-navy-800 px-4 pt-2 pb-6 space-y-2">
          {user ? (
            <>
              <div className="py-2 border-b border-navy-800">
                <p className="text-xs text-slate-400">Signed in as</p>
                <p className="text-sm font-semibold text-white">{user.full_name}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-navy-800"
              >
                Dashboard
              </Link>
              <Link
                to="/emergency"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-bold text-emergency-400 hover:bg-navy-800"
              >
                🚨 Emergency SOS Center
              </Link>
              <Link
                to="/contacts"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-navy-800"
              >
                Trusted Contacts
              </Link>
              <Link
                to="/nearby"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-navy-800"
              >
                Nearby Help & Map
              </Link>
              <Link
                to="/location-sharing"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-navy-800"
              >
                Live Location Tracking
              </Link>
              <Link
                to="/community-reports"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-navy-800"
              >
                Community Safety Reports
              </Link>
              <Link
                to="/checkins"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-navy-800"
              >
                Travel Check-Ins
              </Link>
              <Link
                to="/assistant"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-navy-800"
              >
                AI Safety Assistant
              </Link>
              <Link
                to="/history"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-navy-800"
              >
                Emergency History
              </Link>
              {user.is_admin && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg text-sm font-medium text-amber-300 hover:bg-navy-800"
                >
                  Admin Moderation
                </Link>
              )}
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-navy-800"
              >
                Profile & Settings
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-400 hover:bg-navy-800"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-navy-800"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-emerald-400 hover:bg-navy-800"
              >
                Register Account
              </Link>
            </>
          )}
          <button
            onClick={() => {
              onOpenSimulatedCall();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
          >
            <PhoneCall className="w-4 h-4" />
            Launch Simulated Escape Call
          </button>
        </div>
      )}
    </nav>
  );
};
