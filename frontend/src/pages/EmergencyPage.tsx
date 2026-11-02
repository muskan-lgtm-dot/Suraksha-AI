import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { EmergencyIncident, EmergencyNotification } from '../types';
import {
  ShieldAlert,
  MapPin,
  Clock,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Share2,
  Copy,
  Check,
  RefreshCw,
  PhoneCall,
  Lock,
  ArrowRight
} from 'lucide-react';

export const EmergencyPage: React.FC = () => {
  const { incidentId } = useParams<{ incidentId?: string }>();
  const [searchParams] = useSearchParams();
  const triggerParam = searchParams.get('trigger');

  const { activeIncident, refreshActiveIncident } = useAuth();
  const navigate = useNavigate();

  // Active or loaded incident
  const [incident, setIncident] = useState<EmergencyIncident | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Cancellation countdown state (for accidental trigger prevention)
  const [countdown, setCountdown] = useState<number | null>(null);
  const [pendingCoords, setPendingCoords] = useState<{ lat?: number; lng?: number; accuracy?: number }>({});

  // Cancel / Resolve dialog modals
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Accidental button tap');
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveNotes, setResolveNotes] = useState('Safe and accounted for.');

  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch incident or use active
  const loadIncident = async () => {
    try {
      if (incidentId) {
        const inc = await api.getIncident(parseInt(incidentId, 10));
        setIncident(inc);
      } else if (activeIncident) {
        const inc = await api.getIncident(activeIncident.id);
        setIncident(inc);
      } else {
        setIncident(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncident();
  }, [incidentId, activeIncident?.id]);

  // Periodic polling for status changes (contact acknowledgements)
  useEffect(() => {
    if (incident && ['active', 'notification_pending', 'notification_sent', 'acknowledged'].includes(incident.status)) {
      const interval = setInterval(() => {
        api.getIncident(incident.id).then((fresh) => {
          setIncident(fresh);
        });
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [incident?.id, incident?.status]);

  // Handle countdown timer
  useEffect(() => {
    let timer: any;
    if (countdown !== null && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      // Countdown elapsed -> Fire SOS
      setCountdown(null);
      dispatchSosNow(pendingCoords);
    }
    return () => clearTimeout(timer);
  }, [countdown, pendingCoords]);

  // If page loaded with ?trigger=voice or auto, trigger countdown immediately
  useEffect(() => {
    if (triggerParam && !incident && countdown === null) {
      startSosFlow('voice_command');
    }
  }, [triggerParam, incident]);

  const startSosFlow = (channel: string = 'web_button') => {
    // 1. Capture coordinates
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy)
          };
          setPendingCoords(coords);
          setCountdown(5); // 5 second countdown with cancel button
        },
        () => {
          // If location blocked, start countdown anyway
          setPendingCoords({});
          setCountdown(5);
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      setPendingCoords({});
      setCountdown(5);
    }
  };

  const cancelCountdown = () => {
    setCountdown(null);
    setPendingCoords({});
  };

  const dispatchSosNow = async (coordsOverride?: { lat?: number; lng?: number; accuracy?: number }) => {
    setCountdown(null);
    setActionLoading(true);

    const c = coordsOverride || pendingCoords;
    try {
      const newInc = await api.triggerSos({
        severity: 'critical',
        latitude: c.lat,
        longitude: c.lng,
        location_accuracy: c.accuracy,
        location_source: c.lat ? 'gps' : 'none',
        triggered_channel: triggerParam === 'voice' ? 'voice_command' : 'web_button',
        address_text: c.lat ? `Near GPS: ${c.lat.toFixed(4)}, ${c.lng?.toFixed(4)}` : undefined
      });
      setIncident(newInc);
      await refreshActiveIncident();
    } catch (err: any) {
      alert(err.message || 'Failed to dispatch emergency SOS');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelAlert = async () => {
    if (!incident) return;
    setActionLoading(true);
    try {
      const updated = await api.cancelIncident(incident.id, cancelReason);
      setIncident(updated);
      setShowCancelModal(false);
      await refreshActiveIncident();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel incident');
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveAlert = async () => {
    if (!incident) return;
    setActionLoading(true);
    try {
      const updated = await api.resolveIncident(incident.id, resolveNotes);
      setIncident(updated);
      setShowResolveModal(false);
      await refreshActiveIncident();
    } catch (err: any) {
      alert(err.message || 'Failed to resolve incident');
    } finally {
      setActionLoading(false);
    }
  };

  const copyShareLink = () => {
    const url = window.location.origin + `/track/sos-${incident?.incident_reference.toLowerCase()}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-navy-950 via-navy-900 to-slate-900 border-b border-navy-800 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emergency-600 flex items-center justify-center text-white">
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                </div>
                <h1 className="text-2xl font-extrabold text-white">EMERGENCY SOS CENTER</h1>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Real-time incident coordination, trusted contact status tracking & resolution.
              </p>
            </div>

            {/* Official Helpline 112 Direct Button */}
            <a
              href="tel:112"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emergency-600 hover:bg-emergency-500 text-white font-extrabold text-xs shadow-lg shadow-emergency-600/30 transition-all self-start sm:self-auto"
            >
              <PhoneCall className="w-4 h-4 animate-bounce" />
              <span>Call Official Police 112</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 space-y-8">
        {/* COUNTDOWN POPUP OVERLAY */}
        {countdown !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-md p-8 rounded-3xl bg-navy-950 border-2 border-emergency-500 text-center space-y-6 shadow-2xl">
              <div className="w-24 h-24 rounded-full bg-emergency-600 text-white font-black text-5xl flex items-center justify-center mx-auto animate-emergency">
                {countdown}
              </div>

              <div>
                <h3 className="text-2xl font-extrabold text-white">BROADCASTING SOS</h3>
                <p className="text-xs text-slate-300 mt-1">
                  Alerting trusted contacts in {countdown} seconds. Accidental tap? Click below to cancel.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={cancelCountdown}
                  className="w-full py-3.5 rounded-xl text-sm font-bold bg-navy-800 hover:bg-navy-700 text-white border border-navy-700 transition-colors"
                >
                  Cancel (Accidental Tap)
                </button>
                <button
                  onClick={() => dispatchSosNow()}
                  className="w-full py-2.5 rounded-xl text-xs font-semibold text-emergency-400 hover:underline"
                >
                  Skip Countdown & Dispatch Immediately
                </button>
              </div>
            </div>
          </div>
        )}

        {/* IF NO INCIDENT ACTIVE: BIG ACTIVATION SCREEN */}
        {!incident ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-navy-950 border border-navy-800 text-center space-y-6 max-w-xl mx-auto shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-emergency-600/10 text-emergency-500 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-10 h-10" />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Activate Immediate SOS</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Will capture your GPS position, generate an emergency incident token, and dispatch notifications via configured SMS and Email channels.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => startSosFlow('web_button')}
                disabled={actionLoading}
                className="w-full py-4 rounded-2xl text-base font-black bg-gradient-to-r from-emergency-600 via-rose-600 to-emergency-500 hover:brightness-110 text-white shadow-xl shadow-emergency-600/40 transition-transform active:scale-95 disabled:opacity-50"
              >
                {actionLoading ? 'Initializing...' : 'TRIGGER EMERGENCY SOS NOW'}
              </button>
            </div>

            <div className="p-3 rounded-xl bg-navy-900 border border-navy-800 text-[11px] text-slate-400 text-left space-y-1">
              <p className="font-semibold text-slate-300">Safety Features Included:</p>
              <p>• 5-second accidental cancel window before blast</p>
              <p>• Multi-channel notification delivery tracking</p>
              <p>• Shareable secure tracking token</p>
            </div>
          </div>
        ) : (
          /* ACTIVE / RECORDED INCIDENT DISPLAY */
          <div className="space-y-6">
            {/* INCIDENT HERO STATUS CARD */}
            <div
              className={`p-6 sm:p-8 rounded-3xl border shadow-2xl relative overflow-hidden ${
                incident.status === 'resolved'
                  ? 'bg-navy-950 border-emerald-500/40'
                  : incident.status === 'cancelled'
                  ? 'bg-navy-950 border-slate-700'
                  : 'bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 border-emergency-500/60 animate-pulse'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-navy-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-emergency-400 tracking-wider">
                      {incident.incident_reference}
                    </span>
                    <span
                      className={`text-xs uppercase font-extrabold px-2.5 py-0.5 rounded-full ${
                        incident.status === 'resolved'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : incident.status === 'cancelled'
                          ? 'bg-slate-700 text-slate-300'
                          : 'bg-emergency-600 text-white animate-bounce'
                      }`}
                    >
                      {incident.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Activated on {new Date(incident.created_at).toLocaleString()} via{' '}
                    <strong className="text-white">{incident.triggered_channel}</strong>
                  </p>
                </div>

                {/* Actions: Cancel or Resolve */}
                {['active', 'notification_pending', 'notification_sent', 'acknowledged'].includes(incident.status) && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-navy-800 hover:bg-navy-700 text-slate-300 border border-navy-700 transition-colors"
                    >
                      Cancel Accidental Alert
                    </button>
                    <button
                      onClick={() => setShowResolveModal(true)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 transition-colors"
                    >
                      Resolve (I Am Safe)
                    </button>
                  </div>
                )}
              </div>

              {/* Coordinates & Accuracy Meter */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-xs">
                <div className="p-3.5 rounded-2xl bg-navy-900/80 border border-navy-800">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-emergency-500" />
                    <span>Coordinates</span>
                  </div>
                  <p className="font-mono font-bold text-white">
                    {incident.latitude && incident.longitude
                      ? `${incident.latitude.toFixed(5)}, ${incident.longitude.toFixed(5)}`
                      : 'Unavailable'}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Accuracy: {incident.location_accuracy ? `±${incident.location_accuracy}m` : 'N/A'} (Source: {incident.location_source})
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-navy-900/80 border border-navy-800">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Clock className="w-3.5 h-3.5 text-teal-400" />
                    <span>Resolution Status</span>
                  </div>
                  <p className="font-bold text-white capitalize">{incident.status.replace('_', ' ')}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {incident.resolved_at
                      ? `Resolved at ${new Date(incident.resolved_at).toLocaleTimeString()}`
                      : incident.cancelled_at
                      ? `Cancelled at ${new Date(incident.cancelled_at).toLocaleTimeString()}`
                      : 'Active emergency tracking session'}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-navy-900/80 border border-navy-800">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Share2 className="w-3.5 h-3.5 text-sky-400" />
                    <span>Shareable Incident Link</span>
                  </div>
                  <button
                    onClick={copyShareLink}
                    className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-bold transition-colors"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Link Copied to Clipboard!' : 'Copy Tracking Link'}</span>
                  </button>
                  <p className="text-[10px] text-slate-500 mt-0.5">Restricted read-only tracking view for loved ones</p>
                </div>
              </div>

              {/* Cancellation or Resolution Notes if any */}
              {incident.cancellation_reason && (
                <div className="mt-4 p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
                  <span className="font-bold text-slate-200">Cancellation Reason:</span> {incident.cancellation_reason}
                </div>
              )}
              {incident.resolution_notes && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-xs text-emerald-200">
                  <span className="font-bold text-emerald-300">Resolution Notes:</span> {incident.resolution_notes}
                </div>
              )}
            </div>

            {/* TRUSTED CONTACTS NOTIFICATION DELIVERY TIMELINE */}
            <div className="p-6 sm:p-8 rounded-3xl bg-navy-950 border border-navy-800 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-base text-white">Notification Broadcast Timeline</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time provider dispatch and acknowledgement verification status
                  </p>
                </div>
                <button
                  onClick={loadIncident}
                  className="p-2 rounded-lg bg-navy-900 hover:bg-navy-800 text-slate-400 hover:text-white transition-colors"
                  title="Refresh status"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              {incident.notifications.length === 0 ? (
                <div className="p-6 rounded-2xl bg-navy-900 border border-dashed border-navy-800 text-center">
                  <p className="text-xs text-slate-400">
                    No active trusted contacts were configured prior to activation. Add contacts in the Trusted Contacts tab.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {incident.notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-4 rounded-2xl bg-navy-900 border border-navy-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                            n.channel === 'sms' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-sky-500/10 text-sky-400'
                          }`}
                        >
                          {n.channel === 'sms' ? <Phone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-white">{n.contact_name || 'Guardian'}</h4>
                            <span className="text-[10px] uppercase font-semibold text-slate-400 px-1.5 py-0.2 rounded bg-navy-800">
                              {n.channel}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {n.contact_phone || n.contact_email} • Provider:{' '}
                            <span className="font-mono text-slate-300">{n.provider_name}</span>
                          </p>
                          {n.provider_message_id && (
                            <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                              Msg ID: {n.provider_message_id}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <span
                          className={`text-[11px] font-bold uppercase px-2.5 py-1 rounded-lg ${
                            n.status === 'acknowledged'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : n.status === 'delivered'
                              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                              : n.status === 'failed'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {n.status === 'acknowledged'
                            ? '✓ Acknowledged'
                            : n.status === 'delivered'
                            ? 'Delivered'
                            : n.status === 'sent_to_provider'
                            ? 'Sent to Provider'
                            : n.status}
                        </span>

                        {/* Demo Acknowledgement Simulation Button */}
                        {n.status !== 'acknowledged' && incident.status !== 'resolved' && (
                          <button
                            onClick={async () => {
                              await api.acknowledgeIncident(incident.id, n.trusted_contact_id);
                              loadIncident();
                            }}
                            className="px-2 py-1 rounded text-[10px] font-semibold bg-navy-800 hover:bg-navy-700 text-slate-300 border border-navy-700 transition-colors"
                            title="Simulate recipient tapping acknowledgement link"
                          >
                            Simulate Ack
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CANCEL MODAL */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-navy-950 border border-navy-800 space-y-4">
            <h3 className="text-lg font-bold text-white">Cancel Emergency Alert</h3>
            <p className="text-xs text-slate-400">
              Please provide a reason to update your incident audit record and inform contacts that it was an accidental activation.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Reason</label>
              <input
                type="text"
                required
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-emergency-500"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCancelModal(false)}
                className="w-1/2 py-2.5 rounded-xl text-xs font-bold bg-navy-900 text-slate-300 hover:bg-navy-800"
              >
                Close
              </button>
              <button
                onClick={handleCancelAlert}
                disabled={actionLoading}
                className="w-1/2 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RESOLVE MODAL */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-navy-950 border border-navy-800 space-y-4">
            <h3 className="text-lg font-bold text-white">Mark Emergency Resolved</h3>
            <p className="text-xs text-slate-400">
              Confirm that you have reached a safe environment or received the necessary assistance.
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Resolution Notes (Optional)</label>
              <textarea
                rows={2}
                value={resolveNotes}
                onChange={(e) => setResolveNotes(e.target.value)}
                placeholder="e.g. Reached home safely, family was waiting at gate."
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowResolveModal(false)}
                className="w-1/2 py-2.5 rounded-xl text-xs font-bold bg-navy-900 text-slate-300 hover:bg-navy-800"
              >
                Cancel
              </button>
              <button
                onClick={handleResolveAlert}
                disabled={actionLoading}
                className="w-1/2 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                Confirm I Am Safe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
