import React, { useState, useEffect, useRef } from 'react';
import { api } from '../lib/api';
import { SafetyReport, AiClassificationResponse } from '../types';
import L from 'leaflet';
import {
  AlertTriangle,
  Plus,
  MapPin,
  Bot,
  CheckCircle2,
  Clock,
  Sparkles,
  X,
  Filter,
  Trash2,
  Info
} from 'lucide-react';

export const CommunityReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'public' | 'mine'>('public');
  const [reports, setReports] = useState<SafetyReport[]>([]);
  const [myReports, setMyReports] = useState<SafetyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Submit Modal state
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<'lighting' | 'harassment' | 'infrastructure' | 'transport' | 'other'>('lighting');
  const [approxLocation, setApproxLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // AI Classification Preview State
  const [aiResult, setAiResult] = useState<AiClassificationResponse | null>(null);
  const [classifying, setClassifying] = useState(false);

  // Map refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const loadReports = async () => {
    try {
      const [pub, mine] = await Promise.all([
        api.listPublicReports(selectedCategory),
        api.listMyReports()
      ]);
      setReports(pub);
      setMyReports(mine);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [selectedCategory]);

  // Debounced AI classification as user types
  useEffect(() => {
    if (description.length < 15) {
      setAiResult(null);
      return;
    }

    const timer = setTimeout(async () => {
      setClassifying(true);
      try {
        const res = await api.aiClassify(`${title}. ${description}`);
        setAiResult(res);
        if (res.suggested_category && ['lighting', 'harassment', 'infrastructure', 'transport', 'other'].includes(res.suggested_category)) {
          setCategory(res.suggested_category as any);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setClassifying(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [description, title]);

  // Leaflet map setup
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([28.6139, 77.2090], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();

      reports.forEach((r) => {
        const color =
          r.category === 'lighting'
            ? '#F59E0B'
            : r.category === 'harassment'
            ? '#E63946'
            : r.category === 'infrastructure'
            ? '#8B5CF6'
            : '#0D9488';

        const customIcon = L.divIcon({
          className: 'report-pin',
          html: `<div style="background-color: ${color}; width: 22px; height: 22px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.4);"></div>`,
          iconSize: [22, 22]
        });

        L.marker([r.latitude, r.longitude], { icon: customIcon })
          .bindPopup(`<strong>${r.title}</strong><br/><em>${r.category.toUpperCase()}</em><br/>${r.description.slice(0, 100)}...`)
          .addTo(markersLayerRef.current!);
      });
    }
  }, [reports]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    let lat = 28.6139;
    let lng = 77.2090;

    // Grab current coordinates if available
    if (navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 4000 });
        });
        lat = pos.coords.latitude;
        lng = pos.coords.longitude;
      } catch {
        // fallback
      }
    }

    try {
      await api.submitReport({
        category,
        title,
        description,
        latitude: lat,
        longitude: lng,
        approximate_location: approxLocation || undefined
      });
      setShowModal(false);
      setTitle('');
      setDescription('');
      setApproxLocation('');
      setAiResult(null);
      loadReports();
      alert('Report submitted for moderation. Thank you for making your community safer!');
    } catch (err: any) {
      alert(err.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Withdraw this safety report?')) return;
    try {
      await api.deleteReport(id);
      loadReports();
    } catch (err: any) {
      alert(err.message || 'Failed to delete report');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-navy-950 via-navy-900 to-slate-900 border-b border-navy-800 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-purple-400" />
              <h1 className="text-2xl font-extrabold text-white">COMMUNITY SAFETY REPORTS</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Crowdsourced hazard mapping with explainable AI categorization and administrative review.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Submit Safety Concern</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 space-y-6">
        {/* Tab & Category Selector */}
        <div className="p-4 rounded-2xl bg-navy-950 border border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('public')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'public'
                  ? 'bg-purple-600 text-white'
                  : 'bg-navy-900 text-slate-400 hover:text-white border border-navy-700'
              }`}
            >
              Verified Hazard Map ({reports.length})
            </button>
            <button
              onClick={() => setActiveTab('mine')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                activeTab === 'mine'
                  ? 'bg-purple-600 text-white'
                  : 'bg-navy-900 text-slate-400 hover:text-white border border-navy-700'
              }`}
            >
              My Submissions ({myReports.length})
            </button>
          </div>

          {activeTab === 'public' && (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {['all', 'lighting', 'harassment', 'infrastructure', 'transport'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize ${
                    selectedCategory === cat ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tab 1: Public Hazards & Interactive Map */}
        {activeTab === 'public' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-[420px] rounded-3xl overflow-hidden border border-navy-800 shadow-2xl relative">
                <div ref={mapContainerRef} className="w-full h-full" />
              </div>
              <p className="text-[11px] text-slate-500 italic">
                Note: Coordinates on the public map are fuzzed to approximate locations to ensure reporter privacy.
              </p>
            </div>

            {/* Public Reports List */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {reports.map((r) => (
                <div
                  key={r.id}
                  className="p-4 rounded-2xl bg-navy-950 border border-navy-800 space-y-2 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                        r.category === 'lighting'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : r.category === 'harassment'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : r.category === 'infrastructure'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                      }`}
                    >
                      {r.category}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(r.incident_time).toLocaleDateString()}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-white leading-snug">{r.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">{r.description}</p>

                  <div className="pt-2 border-t border-navy-850 flex items-center justify-between text-[10px] text-slate-500">
                    <span>{r.approximate_location || 'Approximate Location'}</span>
                    <span className="text-emerald-400 font-semibold">✓ Verified Report</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: User's Submissions */}
        {activeTab === 'mine' && (
          <div className="space-y-4">
            {myReports.length === 0 ? (
              <div className="p-12 rounded-3xl bg-navy-950 border border-dashed border-navy-800 text-center space-y-3">
                <p className="text-xs text-slate-400">You haven't submitted any community safety reports yet.</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-purple-600 text-white"
                >
                  Submit Your First Report
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myReports.map((r) => (
                  <div key={r.id} className="p-5 rounded-2xl bg-navy-950 border border-navy-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-navy-900 text-slate-300">
                        {r.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            r.moderation_status === 'verified'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : r.moderation_status === 'rejected'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {r.moderation_status.replace('_', ' ')}
                        </span>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className="p-1 text-slate-500 hover:text-rose-400"
                          title="Withdraw Report"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-bold text-sm text-white">{r.title}</h4>
                    <p className="text-xs text-slate-400">{r.description}</p>

                    {r.moderation_notes && (
                      <div className="p-2.5 rounded-xl bg-navy-900 border border-navy-850 text-[11px] text-slate-300">
                        <span className="font-bold text-slate-200">Moderator Note:</span> {r.moderation_notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SUBMISSION MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-navy-950 border border-navy-800 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Submit Community Safety Concern</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Issue Headline *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Non-functional streetlights along Outer Ring Road underpass"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Description *</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the safety hazard, time of day, lighting level, and exact surroundings..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* AI Auto-Classification Live Insight Preview */}
              {aiResult && (
                <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-500/40 text-xs text-purple-200 space-y-1.5 animate-fade-in">
                  <div className="flex items-center gap-1.5 font-bold text-purple-300">
                    <Bot className="w-4 h-4 text-purple-400" />
                    <span>AI Advisory Category: {aiResult.suggested_category.toUpperCase()} (Confidence: {Math.round(aiResult.confidence * 100)}%)</span>
                  </div>
                  <p className="text-[11px] text-slate-300">{aiResult.explanation}</p>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Category (You can override AI)</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="lighting">Poorly Lit / Broken Streetlights</option>
                  <option value="harassment">Loitering & Catcalling Concern</option>
                  <option value="infrastructure">Unsafe Infrastructure / Blind Spot</option>
                  <option value="transport">Public Transport / Cab Concern</option>
                  <option value="other">Other Personal Safety Issue</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Location Landmark (Optional)</label>
                <input
                  type="text"
                  value={approxLocation}
                  onChange={(e) => setApproxLocation(e.target.value)}
                  placeholder="e.g. Near Kalkaji Underpass, New Delhi"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-navy-900 border border-navy-800 text-[11px] text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Privacy Guarantee:</span>
                </span>
                <p>Never enter names of alleged individuals. Reports undergo administrative review before community publication.</p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 py-2.5 rounded-xl text-xs font-bold bg-navy-900 text-slate-300 hover:bg-navy-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-1/2 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
