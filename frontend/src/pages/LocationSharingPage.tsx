import React, { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { LocationShare } from '../types';
import L from 'leaflet';
import {
  MapPin,
  Clock,
  Share2,
  Copy,
  Check,
  ShieldCheck,
  AlertTriangle,
  Trash2,
  ExternalLink,
  Plus,
  RefreshCw
} from 'lucide-react';

export const LocationSharingPage: React.FC = () => {
  const [shares, setShares] = useState<LocationShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);

  // Form state
  const [label, setLabel] = useState('Commute to South Campus');
  const [duration, setDuration] = useState(60); // minutes
  const [creating, setCreating] = useState(false);
  const [newShareUrl, setNewShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Map ref
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const loadShares = async () => {
    try {
      const data = await api.listLocationShares();
      setShares(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShares();
    grabLocation();
  }, []);

  const grabLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy)
          });
        },
        () => {
          // Default fallback (Delhi Connaught Place)
          setCoords({ lat: 28.6139, lng: 77.2090, accuracy: 25 });
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialLat = coords?.lat || 28.6139;
    const initialLng = coords?.lng || 77.2090;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([initialLat, initialLng], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([initialLat, initialLng], 14);
    }

    if (coords) {
      if (markerRef.current) {
        markerRef.current.setLatLng([coords.lat, coords.lng]);
      } else {
        const customIcon = L.divIcon({
          className: 'custom-pin',
          html: `<div style="background-color: #0D9488; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });
        markerRef.current = L.marker([coords.lat, coords.lng], { icon: customIcon }).addTo(mapInstanceRef.current);
      }
    }
  }, [coords]);

  const handleStartShare = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setNewShareUrl(null);

    try {
      const res = await api.createLocationShare({
        label,
        duration_minutes: duration,
        latitude: coords?.lat,
        longitude: coords?.lng,
        accuracy: coords?.accuracy
      });

      const fullUrl = `${window.location.origin}${res.share_url}`;
      setNewShareUrl(fullUrl);
      loadShares();
    } catch (err: any) {
      alert(err.message || 'Failed to start location sharing session');
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async (id: number) => {
    try {
      await api.revokeLocationShare(id);
      loadShares();
    } catch (err: any) {
      alert(err.message || 'Failed to revoke location share');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-navy-950 via-navy-900 to-slate-900 border-b border-navy-800 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <MapPin className="w-6 h-6 text-sky-400" />
            <h1 className="text-2xl font-extrabold text-white">LIVE LOCATION SHARING</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Generate time-limited, encrypted tracking links for loved ones. Zero background tracking without your explicit consent.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Col: Setup & Share Form */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-navy-950 border border-navy-800 shadow-xl space-y-5">
              <h3 className="font-bold text-base text-white">New Tracking Session</h3>

              <form onSubmit={handleStartShare} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Session Label</label>
                  <input
                    type="text"
                    required
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="e.g. Late night cab home"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Session Duration</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { label: '15m', val: 15 },
                      { label: '30m', val: 30 },
                      { label: '1h', val: 60 },
                      { label: '4h', val: 240 }
                    ].map((d) => (
                      <button
                        key={d.val}
                        type="button"
                        onClick={() => setDuration(d.val)}
                        className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                          duration === d.val
                            ? 'bg-sky-600 text-white'
                            : 'bg-navy-900 text-slate-400 border border-navy-700 hover:text-white'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-navy-900 border border-navy-800 text-[11px] text-slate-400 space-y-1">
                  <div className="flex items-center gap-1 text-slate-300 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Cryptographic Security</span>
                  </div>
                  <p>• Unique 32-byte URL token</p>
                  <p>• Only SHA-256 hash stored on server</p>
                  <p>• Instant revocation anytime</p>
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-600 to-teal-600 hover:brightness-110 text-white shadow-lg shadow-sky-600/30 transition-all disabled:opacity-50"
                >
                  {creating ? 'Generating Tracking Link...' : 'Start Live Tracking Session'}
                </button>
              </form>

              {/* Newly Generated Share Link Card */}
              {newShareUrl && (
                <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/40 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-300">Tracking Link Ready!</span>
                    <button
                      onClick={() => copyToClipboard(newShareUrl)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-sky-400 hover:underline"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy Link'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] font-mono text-slate-300 bg-navy-900 p-2 rounded-lg break-all select-all border border-navy-800">
                    {newShareUrl}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right 2 Cols: Live Map & Active Sessions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Interactive Leaflet Map Preview */}
            <div className="p-6 rounded-3xl bg-navy-950 border border-navy-800 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-bold text-sm text-white">Live Geolocation Feed</h3>
                </div>
                {coords && (
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)} (±{coords.accuracy}m)
                  </span>
                )}
              </div>

              <div className="h-[280px] rounded-2xl overflow-hidden border border-navy-800 relative">
                <div ref={mapContainerRef} className="w-full h-full" />
              </div>
            </div>

            {/* Active & Past Shares List */}
            <div className="p-6 rounded-3xl bg-navy-950 border border-navy-800 shadow-xl space-y-4">
              <h3 className="font-bold text-base text-white">Active & Past Tracking Sessions</h3>

              {shares.length === 0 ? (
                <p className="text-xs text-slate-400 py-3">No location sharing sessions created yet.</p>
              ) : (
                <div className="space-y-3">
                  {shares.map((s) => (
                    <div
                      key={s.id}
                      className="p-4 rounded-2xl bg-navy-900 border border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{s.label}</h4>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                              s.is_active
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            {s.is_active ? 'Active' : s.revoked_at ? 'Revoked' : 'Expired'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Created {new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Expires{' '}
                          {new Date(s.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        {s.is_active && (
                          <button
                            onClick={() => handleRevoke(s.id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-colors"
                          >
                            Revoke Now
                          </button>
                        )}
                      </div>
                    </div>
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
