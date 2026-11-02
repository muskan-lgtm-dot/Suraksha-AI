import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { TrustedContact, EmergencyIncident, SafetyReport } from '../types';
import { VoiceSosListener } from '../components/VoiceSosListener';
import {
  ShieldAlert,
  MapPin,
  Users,
  AlertTriangle,
  Compass,
  PhoneCall,
  Clock,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Plus,
  ShieldCheck,
  Navigation
} from 'lucide-react';

interface DashboardPageProps {
  onOpenSimulatedCall: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onOpenSimulatedCall }) => {
  const { user, activeIncident, refreshActiveIncident } = useAuth();
  const navigate = useNavigate();

  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [recentIncidents, setRecentIncidents] = useState<EmergencyIncident[]>([]);
  const [reportsCount, setReportsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // Browser Geolocation state
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [locPermission, setLocPermission] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [manualLoc, setManualLoc] = useState('');

  const loadData = async () => {
    try {
      const [cList, incList, repList] = await Promise.all([
        api.listContacts(),
        api.listIncidents(),
        api.listPublicReports()
      ]);
      setContacts(cList);
      setRecentIncidents(incList.slice(0, 3));
      setReportsCount(repList.length);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    requestLocation();
  }, []);

  const requestLocation = () => {
    if (!navigator.geolocation) {
      setLocPermission('denied');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy)
        });
        setLocPermission('granted');
      },
      () => {
        setLocPermission('denied');
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleVoiceSos = async (phrase: string) => {
    // Navigate directly to emergency page with voice trigger
    navigate('/emergency?trigger=voice');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      {/* Top Welcome Header */}
      <div className="bg-gradient-to-b from-navy-950 via-navy-900 to-slate-900 border-b border-navy-800 pt-8 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Welcome back, {user?.full_name.split(' ')[0]}
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Protected
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Your personal emergency network is active. Keep your contacts and location verified.
              </p>
            </div>

            {/* Quick Helpline Numbers Pill Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <a
                href="tel:112"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emergency-600/20 text-rose-300 border border-emergency-500/30 text-xs font-bold hover:bg-emergency-600/30 transition-colors"
                title="Dial 112 National Unified Emergency"
              >
                <PhoneCall className="w-3.5 h-3.5 text-emergency-500" />
                <span>Call 112</span>
              </a>
              <a
                href="tel:1091"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-800 text-slate-300 border border-navy-700 text-xs font-semibold hover:bg-navy-700 transition-colors"
                title="Women Helpline"
              >
                <span>Helpline 1091</span>
              </a>
              <button
                onClick={onOpenSimulatedCall}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500/30 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Simulated Call</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Left 2 Cols: SOS Action & Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* BIG PROMINENT SOS CARD */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 border border-navy-800 shadow-2xl relative overflow-hidden text-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emergency-600/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="max-w-md mx-auto space-y-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    EMERGENCY RESPONSE CENTER
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Press to initiate multi-channel SMS and Email broadcast with GPS coordinates to your {contacts.length} trusted contacts.
                  </p>
                </div>

                {/* THE SOS BUTTON */}
                <div className="py-4 flex justify-center">
                  <Link
                    to="/emergency"
                    className="w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-tr from-emergency-700 via-rose-600 to-emergency-500 hover:brightness-110 text-white flex flex-col items-center justify-center shadow-2xl animate-emergency group cursor-pointer transition-transform transform active:scale-95"
                  >
                    <ShieldAlert className="w-16 h-16 sm:w-20 sm:h-20 text-white group-hover:scale-110 transition-transform mb-2" />
                    <span className="text-2xl sm:text-3xl font-black tracking-wider">
                      {activeIncident ? 'VIEW ACTIVE' : 'TAP FOR SOS'}
                    </span>
                    <span className="text-[10px] text-rose-100 font-semibold tracking-widest uppercase mt-1">
                      {activeIncident ? 'ALERT RUNNING' : 'Instant Activation'}
                    </span>
                  </Link>
                </div>

                {/* Location Accuracy Status */}
                <div className="flex items-center justify-center gap-2 text-xs">
                  {locPermission === 'granted' && coords ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>GPS Ready: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)} (±{coords.accuracy}m)</span>
                    </div>
                  ) : locPermission === 'denied' ? (
                    <div className="flex items-center gap-1.5 text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Location blocked in browser. Click to retry or enter manually.</span>
                      <button onClick={requestLocation} className="underline font-bold ml-1">Retry</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-slate-400 bg-navy-800 px-3 py-1 rounded-full border border-navy-700">
                      <Navigation className="w-3.5 h-3.5 animate-spin" />
                      <span>Requesting browser location permission...</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Voice SOS Listener Bar */}
            <VoiceSosListener onTriggerSos={handleVoiceSos} />

            {/* Quick Action Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link
                to="/location-sharing"
                className="p-4 rounded-2xl bg-navy-950 border border-navy-800 hover:border-sky-500/40 transition-all group text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <MapPin className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-white">Live Tracking</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Share time-limited link</p>
              </Link>

              <Link
                to="/nearby"
                className="p-4 rounded-2xl bg-navy-950 border border-navy-800 hover:border-emerald-500/40 transition-all group text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-white">Nearby Help</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Police & 24/7 hospitals</p>
              </Link>

              <Link
                to="/community-reports"
                className="p-4 rounded-2xl bg-navy-950 border border-navy-800 hover:border-purple-500/40 transition-all group text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-white">Safety Reports</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{reportsCount} community reports</p>
              </Link>

              <Link
                to="/checkins"
                className="p-4 rounded-2xl bg-navy-950 border border-navy-800 hover:border-amber-500/40 transition-all group text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Clock className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-white">Check-In</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Commute countdown</p>
              </Link>
            </div>
          </div>

          {/* Right Col: Contacts & Recent Activity */}
          <div className="space-y-6">
            {/* Trusted Contacts Card */}
            <div className="p-6 rounded-3xl bg-navy-950 border border-navy-800 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-emergency-500" />
                  <h3 className="font-bold text-base text-white">Trusted Contacts</h3>
                </div>
                <Link
                  to="/contacts"
                  className="text-xs font-semibold text-emergency-400 hover:underline flex items-center gap-0.5"
                >
                  <span>Manage</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {contacts.length === 0 ? (
                <div className="p-4 rounded-2xl bg-navy-900 border border-dashed border-navy-700 text-center space-y-2">
                  <p className="text-xs text-slate-400">No trusted contacts added yet.</p>
                  <Link
                    to="/contacts"
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emergency-600 text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add First Contact</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {contacts.slice(0, 3).map((c) => (
                    <div
                      key={c.id}
                      className="p-3 rounded-xl bg-navy-900 border border-navy-800/80 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-white">{c.name}</p>
                        <p className="text-[11px] text-slate-400">
                          {c.relationship} • {c.phone}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {c.preferred_channel.toUpperCase()}
                      </span>
                    </div>
                  ))}
                  {contacts.length > 3 && (
                    <p className="text-[11px] text-center text-slate-500">
                      +{contacts.length - 3} more contacts configured
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Recent Emergency Activity */}
            <div className="p-6 rounded-3xl bg-navy-950 border border-navy-800 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-teal-400" />
                  <h3 className="font-bold text-base text-white">Recent Activity</h3>
                </div>
                <Link
                  to="/history"
                  className="text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-0.5"
                >
                  <span>History</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {recentIncidents.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">No past emergency incidents recorded.</p>
              ) : (
                <div className="space-y-3">
                  {recentIncidents.map((inc) => (
                    <Link
                      to={`/emergency/${inc.id}`}
                      key={inc.id}
                      className="block p-3 rounded-xl bg-navy-900 border border-navy-800 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-white">{inc.incident_reference}</span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            inc.status === 'resolved'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : inc.status === 'cancelled'
                              ? 'bg-slate-700 text-slate-300'
                              : 'bg-rose-500/20 text-rose-300 animate-pulse'
                          }`}
                        >
                          {inc.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">
                        {new Date(inc.created_at).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        })}
                        {inc.address_text ? ` • ${inc.address_text}` : ''}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
