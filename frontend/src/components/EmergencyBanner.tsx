import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

export const EmergencyBanner: React.FC = () => {
  const { activeIncident, refreshActiveIncident } = useAuth();

  if (!activeIncident) return null;

  const handleQuickResolve = async () => {
    try {
      await api.resolveIncident(activeIncident.id, 'Self-resolved safely via banner shortcut.');
      await refreshActiveIncident();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve incident');
    }
  };

  return (
    <div className="bg-gradient-to-r from-emergency-700 via-rose-600 to-emergency-800 text-white px-4 py-2.5 shadow-lg border-b border-emergency-500/50 sticky top-16 z-30 animate-pulse">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="p-1 rounded-md bg-white/20">
            <ShieldAlert className="w-5 h-5 text-white animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm uppercase tracking-wide">
                ACTIVE EMERGENCY ALERT: {activeIncident.incident_reference}
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white text-emergency-700">
                {activeIncident.status.replace('_', ' ')}
              </span>
            </div>
            <p className="text-xs text-rose-100 hidden sm:block">
              {activeIncident.notifications.length} trusted contact notification attempts dispatched.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/emergency"
            className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold bg-white text-emergency-700 hover:bg-rose-50 transition-colors shadow-sm"
          >
            <span>Emergency Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleQuickResolve}
            className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold bg-white/20 hover:bg-white/30 text-white transition-colors border border-white/30"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Mark Resolved</span>
          </button>
        </div>
      </div>
    </div>
  );
};
