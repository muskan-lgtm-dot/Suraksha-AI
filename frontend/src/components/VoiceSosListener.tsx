import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle, Volume2, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface VoiceSosListenerProps {
  onTriggerSos: (phrase: string) => void;
}

export const VoiceSosListener: React.FC<VoiceSosListenerProps> = ({ onTriggerSos }) => {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [lastHeard, setLastHeard] = useState<string>('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Also detects Hindi keywords like Bachao

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript.toLowerCase();
        setLastHeard(transcript);

        // Emergency trigger words
        if (
          transcript.includes('help help') ||
          transcript.includes('emergency sos') ||
          transcript.includes('suraksha alert') ||
          transcript.includes('bachao') ||
          transcript.includes('save me')
        ) {
          onTriggerSos(transcript);
        }
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      // Auto-restart if user still wants it listening
      if (isListening) {
        try {
          recognition.start();
        } catch {
          setIsListening(false);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isListening, onTriggerSos]);

  const toggleListening = () => {
    if (!supported) return;

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="p-3.5 rounded-2xl bg-navy-900 border border-navy-800 text-slate-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
              isListening
                ? 'bg-emergency-600/20 text-emergency-400 border border-emergency-500/30 animate-pulse'
                : 'bg-navy-800 text-slate-400'
            }`}
          >
            {isListening ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">Voice SOS Detection</span>
              {isListening && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {supported
                ? isListening
                  ? 'Say "Help Help" or "Suraksha Alert" to trigger'
                  : 'Disabled (Click toggle to enable mic listener)'
                : 'Web Speech API not supported in this browser'}
            </p>
          </div>
        </div>

        {supported && (
          <button
            onClick={toggleListening}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              isListening
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
                : 'bg-navy-800 text-slate-300 border border-navy-700 hover:bg-navy-700'
            }`}
          >
            {isListening ? 'Stop Mic' : 'Enable Mic'}
          </button>
        )}
      </div>

      {isListening && (
        <div className="mt-2.5 pt-2 border-t border-navy-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Mic State: Active Listening</span>
          {lastHeard && <span className="text-emerald-400 truncate max-w-[180px]">"{lastHeard}"</span>}
        </div>
      )}
    </div>
  );
};
