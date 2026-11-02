import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  Users,
  MapPin,
  Compass,
  AlertTriangle,
  Bot,
  Lock,
  ArrowRight,
  PhoneCall,
  Clock,
  CheckCircle2,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user, demoLogin } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-36 bg-gradient-to-b from-navy-950 via-navy-900 to-slate-900 border-b border-navy-800">
        {/* Ambient Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emergency-600/15 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/3 right-10 w-[300px] h-[250px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emergency-600/10 border border-emergency-500/30 text-rose-300 text-xs font-semibold mb-6 animate-fade-in shadow-sm">
            <ShieldAlert className="w-4 h-4 text-emergency-500" />
            <span>Next-Generation Women Safety & Rapid Emergency Response</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Your Safety. <span className="bg-gradient-to-r from-emergency-500 via-rose-400 to-amber-300 bg-clip-text text-transparent">Your Power.</span> Your Network.
          </h1>

          <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            SURAKSHA AI bridges personal security with an immediate trusted network. One-touch GPS emergency SOS, multi-channel broadcast, time-limited tracking, and verified community safety maps.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            {user ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-emergency-600 to-rose-600 hover:brightness-110 text-white shadow-lg shadow-emergency-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl text-base font-bold bg-gradient-to-r from-emergency-600 to-rose-600 hover:brightness-110 text-white shadow-lg shadow-emergency-600/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Get Protected Now</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => demoLogin('user')}
                  className="w-full sm:w-auto px-6 py-4 rounded-xl text-base font-semibold bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  <span>1-Click Hackathon Demo</span>
                </button>
              </>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-center border-t border-navy-800/80 pt-10">
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-white">&lt; 1.5s</p>
              <p className="text-xs text-slate-400 mt-1">SOS Alert Dispatch Speed</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400">100%</p>
              <p className="text-xs text-slate-400 mt-1">Explicit Consent Tracking</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-rose-400">Multi-Channel</p>
              <p className="text-xs text-slate-400 mt-1">SMS, Email & In-App</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-extrabold text-amber-300">112 Unified</p>
              <p className="text-xs text-slate-400 mt-1">National Helpline Hub</p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-20 bg-slate-900 border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-emergency-500 uppercase tracking-widest">Everything You Need</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">Comprehensive Safety Architecture</p>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">
              A holistic ecosystem engineered with honest limitations, strict personal privacy, and zero false claims.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-navy-950 border border-navy-800 hover:border-emergency-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emergency-600/10 text-emergency-500 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Emergency SOS Center</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                One-tap activation with 5-second accidental cancel window. Grabs precise GPS coordinates, stores persistent incidents, and dispatches multi-channel alerts.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-navy-950 border border-navy-800 hover:border-teal-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Trusted Contacts Network</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Manage your personal guardians with notification consent checks, relationship labels, SMS/Email channel routing, and instant test simulation.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-navy-950 border border-navy-800 hover:border-sky-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Cryptographic Live Sharing</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Generate time-limited, SHA-256 tokenized tracking links for friends and family. Features one-click revocation and zero public indexability.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-navy-950 border border-navy-800 hover:border-amber-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Nearby Assistance & Map</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                OpenStreetMap visualization showing nearby verified Police Stations, 24/7 Hospitals, Women Help Centers, and direct dial shortcuts.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-navy-950 border border-navy-800 hover:border-purple-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Community Hazard Reports</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Report dark alleys, harassment spots, and broken infrastructure. Reports undergo AI classification and human moderation before community display.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-navy-950 border border-navy-800 hover:border-emerald-500/40 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI Safety Assistant</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Guidance on safety planning, hotline numbers, travel tips, and immediate emergency detection. Never pretends to be an official 112 dispatcher.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-navy-950 border-b border-navy-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-teal-400 uppercase tracking-widest">Workflow</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-extrabold text-white">How Emergency SOS Coordinates Help</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center relative">
            <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800">
              <div className="w-10 h-10 rounded-full bg-emergency-600 text-white font-bold flex items-center justify-center mx-auto mb-4">
                1
              </div>
              <h4 className="font-bold text-white mb-2">Activate SOS</h4>
              <p className="text-xs text-slate-400">
                User taps the prominent button or triggers via Voice Recognition. Browser captures accurate GPS coordinates.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800">
              <div className="w-10 h-10 rounded-full bg-navy-700 text-white font-bold flex items-center justify-center mx-auto mb-4">
                2
              </div>
              <h4 className="font-bold text-white mb-2">Incident Created</h4>
              <p className="text-xs text-slate-400">
                A persistent reference is stored on the server with status "Notification Pending" and cryptographic token hash.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800">
              <div className="w-10 h-10 rounded-full bg-navy-700 text-white font-bold flex items-center justify-center mx-auto mb-4">
                3
              </div>
              <h4 className="font-bold text-white mb-2">Multi-Channel Blast</h4>
              <p className="text-xs text-slate-400">
                SMS and Email notifications are sent to all eligible trusted contacts with tracking URL and exact coordinates.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-navy-900 border border-navy-800">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center mx-auto mb-4">
                4
              </div>
              <h4 className="font-bold text-white mb-2">Acknowledge & Resolve</h4>
              <p className="text-xs text-slate-400">
                Contacts acknowledge receipt; user can cancel false alarms or safely mark the incident resolved with notes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety FAQ */}
      <section id="faq" className="py-20 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-bold text-emergency-500 uppercase tracking-widest">Honesty & Transparency</h2>
            <p className="mt-2 text-3xl font-extrabold text-white">Frequently Asked Questions</p>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-navy-950 border border-navy-800">
              <h4 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
                <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                Does SURAKSHA AI automatically call the police or emergency services?
              </h4>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                No. In accordance with responsible safety software design, we never falsely claim to contact official dispatchers unless an authorized police API integration is explicitly configured. We provide direct one-tap dialing to the national emergency number 112.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-navy-950 border border-navy-800">
              <h4 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
                <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                Are my real-time GPS coordinates stored or made public?
              </h4>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                Never. Location tracking only activates when you trigger an emergency SOS or explicitly start a time-limited share. Share links expire automatically, can be revoked instantly, and public hazard reports use fuzzed approximate coordinates (~100m) to preserve anonymity.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-navy-950 border border-navy-800">
              <h4 className="font-bold text-white flex items-center gap-2 text-sm sm:text-base">
                <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                How does the AI Assistant assist during emergencies?
              </h4>
              <p className="mt-2 text-xs sm:text-sm text-slate-400 leading-relaxed">
                The AI Assistant provides personal safety guidance, walks you through features, and classifies submitted reports. If distress keywords are detected, it immediately prioritizes the coral Emergency SOS shortcut and helpline directory.
              </p>
            </div>
          </div>

          {/* Bottom CTA Banner */}
          <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-navy-950 via-navy-900 to-navy-950 border border-navy-700 text-center relative overflow-hidden">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">Experience SURAKSHA AI in Action</h3>
            <p className="mt-2 text-sm text-slate-300 max-w-xl mx-auto">
              Test the end-to-end workflow from SOS trigger to notification delivery tracking, location sharing, and report moderation.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => demoLogin('user')}
                className="px-6 py-3 rounded-xl text-sm font-bold bg-emergency-600 hover:bg-emergency-500 text-white shadow-lg transition-all"
              >
                Launch Demo User
              </button>
              <button
                onClick={() => demoLogin('admin')}
                className="px-6 py-3 rounded-xl text-sm font-bold bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 transition-all"
              >
                Launch Admin Moderation
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
