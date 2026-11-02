import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { PublicLocationShare } from '../types';
import L from 'leaflet';
import {
  MapPin,
  Clock,
  ShieldCheck,
  PhoneCall,
  AlertCircle,
  RefreshCw,
  Navigation
} from 'lucide-react';

export const PublicTrackingPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<PublicLocationShare | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const circleRef = useRef<L.Circle | null>(null);

  const loadTracking = async () => {
    if (!token) return;
    try {
      const res = await api.getPublicLocationShare(token);
      setData(res);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Tracking link is invalid, expired, or was revoked.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTracking();
    const interval = setInterval(loadTracking, 10000);
    return () => clearInterval(interval);
  }, [token]);

  // Leaflet map setup
  useEffect(() => {
    if (!mapContainerRef.current || !data) return;

    const lat = data.last_latitude || 28.6139;
    const lng = data.last_longitude || 77.2090;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([lat, lng], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      mapInstanceRef.current = map;
    } else {
      mapInstanceRef.current.setView([lat, lng], 15);
    }

    if (data.last_latitude && data.last_longitude) {
      const beaconIcon = L.divIcon({
        className: 'public-pin',
        html: `
          <div style="position: relative; width: 28px; height: 28px;">
            <div style="position: absolute; inset: 0; background-color: #F43F5E; border-radius: 50%; opacity: 0.4; animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="position: absolute; inset: 4px; background-color: #E63946; border: 3px solid white; border-radius: 50%; box-shadow: 0 4px 12px rgba(0,0,0,0.5);"></div>
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      if (markerRef.current) {
        markerRef.current.setLatLng([data.last_latitude, data.last_longitude]);
      } else {
        markerRef.current = L.marker([data.last_latitude, data.last_longitude], {
          icon: beaconIcon
        }).addTo(mapInstanceRef.current);
      }

      if (data.last_accuracy) {
        if (circleRef.current) {
          circleRef.current.setLatLng([data.last_latitude, data.last_longitude]);
          circleRef.current.setRadius(data.last_accuracy);
        } else {
          circleRef.current = L.circle([data.last_latitude, data.last_longitude], {
            radius: data.last_accuracy,
            color: '#F43F5E',
            fillColor: '#F43F5E',
            fillOpacity: 0.1,
            weight: 1
          }).addTo(mapInstanceRef.current);
        }
      }
    }
  }, [data]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between">
      {/* Top Banner */}
      <header className="bg-navy-950 border-b border-navy-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emergency-600 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-white tracking-tight">SURAKSHA AI</span>
              <span className="text-[10px] text-slate-400 block">Verified Secure Tracking Session</span>
            </div>
          </div>

          <a
            href="tel:112"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emergency-600 text-white shadow-sm hover:bg-emergency-500"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call 112</span>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto w-full p-4 sm:p-6 flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="text-center py-12 text-xs text-slate-400">Loading secure tracking session...</div>
        ) : error ? (
          <div className="p-8 rounded-3xl bg-navy-950 border border-rose-500/30 text-center space-y-4 max-w-md mx-auto shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Tracking Session Inactive</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{error}</p>
            </div>
          </div>
        ) : data ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-navy-950 border border-navy-800 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-navy-800">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-extrabold text-white">
                    {data.sharer_first_name}'s Live Location
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Live Session
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">Session: {data.label}</p>
              </div>

              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-400" />
                <span>
                  Expires: {new Date(data.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Leaflet Map Display */}
            <div className="h-[360px] sm:h-[420px] rounded-2xl overflow-hidden border border-navy-800 relative">
              <div ref={mapContainerRef} className="w-full h-full" />
            </div>

            {/* Info footer */}
            <div className="p-3.5 rounded-2xl bg-navy-900 border border-navy-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Navigation className="w-4 h-4 text-emergency-500" />
                <span>
                  Last Updated:{' '}
                  {data.last_updated_at ? new Date(data.last_updated_at).toLocaleTimeString() : 'Awaiting GPS refresh'}
                </span>
              </div>
              <span className="text-[11px] text-slate-500">Auto-refreshing every 10 seconds</span>
            </div>
          </div>
        ) : null}
      </main>

      <footer className="p-4 text-center text-xs text-slate-500 border-t border-navy-800">
        SURAKSHA AI Restricted Public Safety Tracking Link • Encrypted Access
      </footer>
    </div>
  );
};
