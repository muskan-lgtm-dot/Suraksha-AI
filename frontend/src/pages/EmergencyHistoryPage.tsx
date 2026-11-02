import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { EmergencyIncident } from '../types';
import {
  History,
  ShieldAlert,
  Clock,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  MapPin,
  ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmergencyHistoryPage: React.FC = () => {
  const [incidents, setIncidents] = useState<EmergencyIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const loadIncidents = async () => {
    try {
      const data = await api.listIncidents();
      setIncidents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const filteredIncidents = incidents.filter((inc) => {
    if (statusFilter === 'all') return true;
    return inc.status === statusFilter;
  });

  const handleExport = () => {
    const summary = filteredIncidents.map((inc) => ({
      reference: inc.incident_reference,
      status: inc.status,
      severity: inc.severity,
      created_at: inc.created_at,
      resolved_at: inc.resolved_at,
      cancellation_reason: inc.cancellation_reason,
      resolution_notes: inc.resolution_notes,
      notifications_sent: inc.notifications.length
    }));

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(summary, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `suraksha-emergency-history-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-navy-950 via-navy-900 to-slate-900 border-b border-navy-800 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-6 h-6 text-teal-400" />
              <h1 className="text-2xl font-extrabold text-white">EMERGENCY INCIDENT HISTORY</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Audit log of past activations, contact notifications, acknowledgements, and resolutions.
            </p>
          </div>

          {incidents.length > 0 && (
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 transition-colors self-start sm:self-auto"
            >
              <Download className="w-4 h-4" />
              <span>Export Audit Summary</span>
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 space-y-6">
        {/* Filter Bar */}
        <div className="p-3.5 rounded-2xl bg-navy-950 border border-navy-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-300">Filter Status:</span>
          </div>
          <div className="flex items-center gap-1.5">
            {['all', 'resolved', 'cancelled', 'active'].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  statusFilter === s ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-12 text-xs text-slate-400">Loading incident records...</div>
        ) : filteredIncidents.length === 0 ? (
          <div className="p-12 rounded-3xl bg-navy-950 border border-dashed border-navy-800 text-center space-y-3">
            <p className="text-xs text-slate-400">No emergency incidents found matching this status.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIncidents.map((inc) => (
              <div
                key={inc.id}
                className="p-5 rounded-3xl bg-navy-950 border border-navy-800 hover:border-slate-700 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-navy-850">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-extrabold text-sm text-white">
                      {inc.incident_reference}
                    </span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        inc.status === 'resolved'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : inc.status === 'cancelled'
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-rose-500/20 text-rose-300 animate-pulse'
                      }`}
                    >
                      {inc.status.replace('_', ' ')}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400">
                    {new Date(inc.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Severity / Trigger</span>
                    <span className="font-semibold text-white capitalize">
                      {inc.severity} • {inc.triggered_channel}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Contacts Dispatched</span>
                    <span className="font-semibold text-white">
                      {inc.notifications.length} recipients ({inc.notifications.filter((n) => n.status === 'delivered' || n.status === 'acknowledged').length} confirmed)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Location Status</span>
                    <span className="font-semibold text-white">
                      {inc.latitude && inc.longitude ? `${inc.latitude.toFixed(4)}, ${inc.longitude.toFixed(4)}` : 'Pending GPS'}
                    </span>
                  </div>
                </div>

                {inc.resolution_notes && (
                  <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-200">
                    <span className="font-bold text-emerald-300">Resolution Notes:</span> {inc.resolution_notes}
                  </div>
                )}
                {inc.cancellation_reason && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                    <span className="font-bold text-slate-200">Cancellation Reason:</span> {inc.cancellation_reason}
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <Link
                    to={`/emergency/${inc.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emergency-400 hover:underline"
                  >
                    <span>View Full Broadcast Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
