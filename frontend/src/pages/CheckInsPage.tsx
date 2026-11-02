import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { CheckInSession } from '../types';
import {
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Play,
  XCircle,
  ShieldCheck,
  Plus
} from 'lucide-react';

export const CheckInsPage: React.FC = () => {
  const [checkins, setCheckins] = useState<CheckInSession[]>([]);
  const [loading, setLoading] = useState(true);

  // New check-in form
  const [destination, setDestination] = useState('');
  const [duration, setDuration] = useState(30); // minutes
  const [starting, setStarting] = useState(false);

  const loadCheckins = async () => {
    try {
      const data = await api.listCheckins();
      setCheckins(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCheckins();
    const interval = setInterval(loadCheckins, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destination.trim()) return;

    setStarting(true);
    try {
      await api.startCheckin(destination.trim(), duration);
      setDestination('');
      loadCheckins();
    } catch (err: any) {
      alert(err.message || 'Failed to start check-in');
    } finally {
      setStarting(false);
    }
  };

  const handleComplete = async (id: number) => {
    try {
      await api.completeCheckin(id);
      loadCheckins();
    } catch (err: any) {
      alert(err.message || 'Failed to complete check-in');
    }
  };

  const handleCancel = async (id: number) => {
    try {
      await api.cancelCheckin(id);
      loadCheckins();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel check-in');
    }
  };

  const activeCheckin = checkins.find((c) => c.status === 'active');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-navy-950 via-navy-900 to-slate-900 border-b border-navy-800 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Clock className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-extrabold text-white">TRAVEL SAFETY CHECK-IN</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Set an expected arrival time for solo night trips. Confirms your safe arrival when you complete your commute.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 space-y-6">
        {/* ACTIVE CHECKIN HERO CARD */}
        {activeCheckin ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-navy-950 via-amber-950/20 to-navy-950 border border-amber-500/40 shadow-2xl space-y-6 animate-pulse">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Active Commute Session
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-2">
                  Destination: {activeCheckin.destination}
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Expected Arrival: {new Date(activeCheckin.expected_arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCancel(activeCheckin.id)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-navy-900 hover:bg-navy-800 text-slate-300 border border-navy-700"
                >
                  Cancel Trip
                </button>
                <button
                  onClick={() => handleComplete(activeCheckin.id)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>I've Arrived Safely!</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* START CHECKIN FORM */
          <div className="p-6 sm:p-8 rounded-3xl bg-navy-950 border border-navy-800 shadow-xl space-y-5">
            <h3 className="font-bold text-base text-white">Start New Travel Check-In</h3>

            <form onSubmit={handleStart} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Destination Address *</label>
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. My Apartment, Sector 62, Noida"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Expected Transit Time</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: '15 Mins', val: 15 },
                    { label: '30 Mins', val: 30 },
                    { label: '45 Mins', val: 45 },
                    { label: '60 Mins', val: 60 }
                  ].map((t) => (
                    <button
                      key={t.val}
                      type="button"
                      onClick={() => setDuration(t.val)}
                      className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                        duration === t.val
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-navy-900 text-slate-400 border border-navy-700 hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={starting}
                className="w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-600 to-orange-600 hover:brightness-110 text-white shadow-lg shadow-amber-600/30 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{starting ? 'Starting Session...' : 'Start Safety Countdown'}</span>
              </button>
            </form>
          </div>
        )}

        {/* PAST SESSIONS LIST */}
        <div className="p-6 rounded-3xl bg-navy-950 border border-navy-800 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-white">Past Check-In History</h3>

          {checkins.length === 0 ? (
            <p className="text-xs text-slate-400 py-3">No past check-in sessions recorded.</p>
          ) : (
            <div className="space-y-2.5">
              {checkins.map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-xl bg-navy-900 border border-navy-800/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-white">{c.destination}</p>
                    <p className="text-[11px] text-slate-400">
                      Started: {new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                      {c.completed_at
                        ? `Arrived safely at ${new Date(c.completed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : `Expected: ${new Date(c.expected_arrival).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      c.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : c.status === 'expired'
                        ? 'bg-rose-500/10 text-rose-400'
                        : 'bg-amber-500/10 text-amber-300'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
