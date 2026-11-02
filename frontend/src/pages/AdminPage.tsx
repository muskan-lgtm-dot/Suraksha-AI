import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { SafetyReport } from '../types';
import {
  ShieldAlert,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Activity,
  FileText,
  RefreshCw,
  Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<any>(null);
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('pending_review');

  const [modNotes, setModNotes] = useState<{ [id: number]: string }>({});

  useEffect(() => {
    if (user && !user.is_admin) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const loadAdminData = async () => {
    try {
      const [st, rep, logs] = await Promise.all([
        api.getAdminStats(),
        api.listModerationQueue(filterStatus),
        api.getAuditLogs()
      ]);
      setStats(st);
      setReports(rep);
      setAuditLogs(logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [filterStatus]);

  const handleModerate = async (id: number, newStatus: string) => {
    try {
      const note = modNotes[id];
      await api.moderateReport(id, newStatus, note);
      loadAdminData();
      alert(`Report marked as ${newStatus}`);
    } catch (err: any) {
      alert(err.message || 'Moderation action failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-navy-950 via-navy-900 to-slate-900 border-b border-navy-800 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-extrabold text-white">ADMINISTRATION & MODERATION</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            System health telemetry, community report moderation queue, and security audit log.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 space-y-8">
        {/* System Stats Overview */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-navy-950 border border-navy-800">
              <span className="text-[11px] font-semibold text-slate-400">Total Registered Users</span>
              <p className="text-2xl font-black text-white mt-1">{stats.total_users}</p>
            </div>
            <div className="p-4 rounded-2xl bg-navy-950 border border-navy-800">
              <span className="text-[11px] font-semibold text-slate-400">Total SOS Incidents</span>
              <p className="text-2xl font-black text-emergency-500 mt-1">{stats.total_incidents}</p>
              <span className="text-[10px] text-rose-400">{stats.active_incidents} active now</span>
            </div>
            <div className="p-4 rounded-2xl bg-navy-950 border border-navy-800">
              <span className="text-[11px] font-semibold text-slate-400">Notification Success</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">{stats.notification_success_rate}%</p>
              <span className="text-[10px] text-slate-500">{stats.total_notifications} sent</span>
            </div>
            <div className="p-4 rounded-2xl bg-navy-950 border border-navy-800">
              <span className="text-[11px] font-semibold text-slate-400">Pending Moderation</span>
              <p className="text-2xl font-black text-amber-400 mt-1">{stats.pending_moderation_reports}</p>
              <span className="text-[10px] text-slate-500">{stats.total_reports} total submissions</span>
            </div>
          </div>
        )}

        {/* Community Reports Moderation Queue */}
        <div className="p-6 sm:p-8 rounded-3xl bg-navy-950 border border-navy-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-base text-white">Community Report Moderation Queue</h3>
              <p className="text-xs text-slate-400">
                Review user hazard submissions to verify safety accuracy and redact any unpermitted personal details.
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs">
              {['pending_review', 'verified', 'rejected', 'all'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-xl font-bold capitalize transition-colors ${
                    filterStatus === st
                      ? 'bg-amber-600 text-white'
                      : 'bg-navy-900 text-slate-400 border border-navy-700 hover:text-white'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8 text-xs text-slate-400">Loading reports...</div>
          ) : reports.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No reports currently in '{filterStatus.replace('_', ' ')}' status.
            </p>
          ) : (
            <div className="space-y-4">
              {reports.map((r) => (
                <div
                  key={r.id}
                  className="p-5 rounded-2xl bg-navy-900 border border-navy-800 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-navy-800 text-slate-200">
                        {r.category}
                      </span>
                      <h4 className="font-bold text-sm text-white">{r.title}</h4>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(r.incident_time).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{r.description}</p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400">
                    <span>Landmark: {r.approximate_location || 'GPS location'}</span>
                    <span>AI Source: {r.classification_source}</span>
                    <span>AI Prediction: {r.ai_suggested_category || 'N/A'}</span>
                  </div>

                  {/* Moderation Controls */}
                  <div className="pt-3 border-t border-navy-850 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <input
                      type="text"
                      placeholder="Add moderator note (optional)..."
                      value={modNotes[r.id] || ''}
                      onChange={(e) => setModNotes({ ...modNotes, [r.id]: e.target.value })}
                      className="flex-1 px-3 py-1.5 rounded-xl bg-navy-950 border border-navy-700 text-xs text-white placeholder-slate-500 focus:outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleModerate(r.id, 'verified')}
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
                      >
                        Verify & Publish
                      </button>
                      <button
                        onClick={() => handleModerate(r.id, 'rejected')}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security Audit Trail */}
        <div className="p-6 sm:p-8 rounded-3xl bg-navy-950 border border-navy-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-white">System Security Audit Log</h3>
            <span className="text-xs text-slate-400">Latest 50 events</span>
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-navy-850 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-slate-300">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-emerald-400 font-bold">{log.action}</span>
                  <span className="text-slate-500">
                    {log.resource_type} #{log.resource_id}
                  </span>
                </div>
                <span className="text-slate-500 text-[11px]">
                  {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
