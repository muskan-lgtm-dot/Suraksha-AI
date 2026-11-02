import React from 'react';
import { ShieldAlert, Heart, Phone, Lock, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 text-slate-400 border-t border-navy-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Critical Safety Disclaimer Alert */}
        <div className="mb-8 p-4 rounded-xl bg-navy-900 border border-navy-700/80 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-500/10 text-rose-400 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="text-xs leading-relaxed text-slate-300">
            <span className="font-bold text-white uppercase tracking-wider block sm:inline sm:mr-1">Official Disclaimer:</span>
            SURAKSHA AI is designed to empower women and coordinate immediate emergency alerts with trusted contacts. It supplements but does <strong className="text-rose-400">NOT</strong> replace official emergency services. In immediate danger or life-threatening situations, please dial <strong className="text-white bg-rose-600 px-1.5 py-0.5 rounded">112</strong> (National Unified Emergency Number) or local police directly.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-navy-800">
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emergency-600 to-rose-500 flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg text-white">SURAKSHA<span className="text-emergency-500">.AI</span></span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Production-ready Women Safety & Emergency Response Platform. Your Safety. Your Power. Your Network.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Platform Status: Operational (Demo Mode)
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Emergency Helplines</h4>
            <ul className="text-xs space-y-1.5">
              <li className="flex justify-between items-center text-slate-300">
                <span>National Emergency:</span>
                <span className="font-bold text-rose-400">112</span>
              </li>
              <li className="flex justify-between items-center text-slate-300">
                <span>Women Helpline:</span>
                <span className="font-bold text-slate-200">1091</span>
              </li>
              <li className="flex justify-between items-center text-slate-300">
                <span>NCW Distress Helpline:</span>
                <span className="font-bold text-slate-200">7827170170 / 181</span>
              </li>
              <li className="flex justify-between items-center text-slate-300">
                <span>Police Control:</span>
                <span className="font-bold text-slate-200">100</span>
              </li>
              <li className="flex justify-between items-center text-slate-300">
                <span>Ambulance / Medical:</span>
                <span className="font-bold text-slate-200">108 / 102</span>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Core Capabilities</h4>
            <ul className="text-xs space-y-1.5 text-slate-300">
              <li>• One-Tap GPS Emergency SOS</li>
              <li>• Multi-Channel Contact Broadcast</li>
              <li>• Cryptographic Live Location Sharing</li>
              <li>• Community Hazard Reporting</li>
              <li>• Safe Route Assistance & Nearby Help</li>
              <li>• Simulated Incoming Escape Call</li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Privacy & Security</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Zero unauthorized location tracking. Location shares use cryptographically secure random tokens with automatic expiry and instant revocation.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-300 pt-1">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>SHA-256 Tokenized & NIST PBKDF2 Encrypted</span>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 SURAKSHA AI. Built for social impact and personal empowerment.</p>
          <div className="flex items-center gap-4">
            <span>Production-Minded Hackathon Release</span>
            <span>•</span>
            <span>College Demo Edition</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
