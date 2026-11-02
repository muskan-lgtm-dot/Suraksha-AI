import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic, Volume2, ShieldCheck, X } from 'lucide-react';

interface SimulatedCallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SimulatedCallModal: React.FC<SimulatedCallModalProps> = ({ isOpen, onClose }) => {
  const [callState, setCallState] = useState<'incoming' | 'connected' | 'ended'>('incoming');
  const [callerName, setCallerName] = useState('Dad (Rajesh)');
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCallState('incoming');
      setCallDuration(0);
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: any;
    if (callState === 'connected') {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  if (!isOpen) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAccept = () => {
    setCallState('connected');
  };

  const handleDeclineOrEnd = () => {
    setCallState('ended');
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-white flex flex-col justify-between min-h-[580px]">
        {/* Top bar with escape modal close and disclaimer */}
        <div className="p-4 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Simulated Escape Tool</span>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Call Info Area */}
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-slate-700 to-slate-800 border-2 border-slate-700 flex items-center justify-center shadow-inner relative">
            <span className="text-3xl font-extrabold text-slate-300">
              {callerName.charAt(0)}
            </span>
            {callState === 'incoming' && (
              <span className="absolute inset-0 rounded-full border-2 border-emerald-400 animate-ping opacity-75"></span>
            )}
          </div>

          <div>
            <h3 className="text-2xl font-bold text-white tracking-tight">{callerName}</h3>
            <p className="text-xs text-slate-400 mt-1">Mobile • +91 98111 22334</p>
            {callState === 'incoming' && (
              <p className="text-sm font-semibold text-emerald-400 mt-2 animate-pulse">Incoming Call...</p>
            )}
            {callState === 'connected' && (
              <p className="text-sm font-mono text-emerald-400 mt-2">{formatDuration(callDuration)}</p>
            )}
            {callState === 'ended' && (
              <p className="text-sm text-rose-400 mt-2">Call Ended</p>
            )}
          </div>

          {/* Caller Profile Selection (Pre-Call or During Call) */}
          {callState === 'incoming' && (
            <div className="flex gap-2 text-xs">
              {['Dad', 'Inspector Verma', 'Brother (Aman)'].map((name) => (
                <button
                  key={name}
                  onClick={() => setCallerName(name)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    callerName === name ? 'bg-slate-700 text-white' : 'bg-slate-800/80 text-slate-400 hover:text-white'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          {/* Simulated Speech Guidance Script when Connected */}
          {callState === 'connected' && (
            <div className="p-3 rounded-xl bg-slate-800/90 border border-slate-700 text-left space-y-1.5 animate-fade-in w-full">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                <span>Simulated Voice Transcript:</span>
              </div>
              <p className="text-xs text-slate-200 italic leading-relaxed">
                "Hey! Where are you? I'm parked right outside in the car waiting for you. Come out to the main gate right now!"
              </p>
              <p className="text-[10px] text-slate-400 pt-1">
                Tip: Speak out loud naturally ("Yes, I see the car, walking out now") to deter anyone nearby.
              </p>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="p-8 pt-0 flex flex-col items-center gap-4">
          {callState === 'incoming' ? (
            <div className="flex items-center justify-between w-full max-w-xs px-4">
              {/* Decline */}
              <button
                onClick={handleDeclineOrEnd}
                className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 transition-transform active:scale-95"
              >
                <PhoneOff className="w-7 h-7" />
              </button>

              {/* Accept */}
              <button
                onClick={handleAccept}
                className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/40 transition-transform active:scale-95 animate-bounce"
              >
                <Phone className="w-7 h-7" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleDeclineOrEnd}
              className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 transition-transform active:scale-95"
            >
              <PhoneOff className="w-7 h-7" />
            </button>
          )}

          <p className="text-[10px] text-slate-500 text-center max-w-xs">
            Hackathon demonstration tool. This client-side simulator does not consume cellular minutes or dial emergency dispatchers.
          </p>
        </div>
      </div>
    </div>
  );
};
