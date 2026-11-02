import React, { useState, useRef, useEffect } from 'react';
import { api } from '../lib/api';
import { Bot, Send, ShieldAlert, Sparkles, PhoneCall, Info, User } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  suggestions?: string[];
  isEmergency?: boolean;
}

export const SafetyAssistantPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'Hello! I am your SURAKSHA AI Safety Assistant. I can help guide you through emergency features, travel safety planning, trusted contacts, and verified helpline directories. How can I help you today?',
      suggestions: [
        'How does Emergency SOS work?',
        'Emergency helpline numbers in India',
        'How do I share my live location?',
        'Night commute safety tips'
      ]
    }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || sending) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setSending(true);

    try {
      const res = await api.aiChat(query);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.reply,
        suggestions: res.suggestions,
        isEmergency: res.is_emergency_flagged
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          sender: 'assistant',
          text: 'I encountered an error connecting to the safety knowledge service. In immediate danger, please dial 112 directly.'
        }
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between pb-12">
      {/* Header */}
      <div className="bg-gradient-to-b from-navy-950 via-navy-900 to-slate-900 border-b border-navy-800 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-white">AI SAFETY ASSISTANT</h1>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Advisory Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">Personal safety walkthroughs & verified helpline guidance</p>
            </div>
          </div>

          <a
            href="tel:112"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emergency-600 hover:bg-emergency-500 text-white text-xs font-bold shadow-md transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call 112</span>
          </a>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 flex-1 py-6 overflow-y-auto space-y-4">
        {/* Advisory banner */}
        <div className="p-3 rounded-xl bg-navy-950 border border-navy-800 text-[11px] text-slate-400 flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            SURAKSHA AI Assistant is an informational tool. It does not replace 112 police dispatchers.
          </span>
        </div>

        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} space-y-2`}
          >
            <div
              className={`max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-emergency-600 text-white rounded-br-none shadow-md'
                  : m.isEmergency
                  ? 'bg-gradient-to-br from-rose-950 via-navy-950 to-navy-950 border-2 border-emergency-500 text-white rounded-bl-none shadow-xl'
                  : 'bg-navy-950 border border-navy-800 text-slate-200 rounded-bl-none shadow-lg'
              }`}
            >
              {m.isEmergency && (
                <div className="mb-2 flex items-center gap-1.5 text-emergency-400 font-bold text-xs uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 animate-bounce" />
                  <span>Immediate Safety Flag</span>
                </div>
              )}
              <div className="whitespace-pre-line">{m.text}</div>

              {m.isEmergency && (
                <div className="mt-3 pt-3 border-t border-emergency-500/30 flex flex-wrap gap-2">
                  <Link
                    to="/emergency"
                    className="px-3 py-1.5 rounded-lg bg-emergency-600 hover:bg-emergency-500 text-white font-extrabold text-xs shadow-md"
                  >
                    TRIGGER SOS NOW
                  </Link>
                  <a
                    href="tel:112"
                    className="px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200 font-bold text-xs border border-navy-700"
                  >
                    Call 112 Police
                  </a>
                </div>
              )}
            </div>

            {/* Suggestions Chips */}
            {m.suggestions && m.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {m.suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(s)}
                    className="px-3 py-1 rounded-full text-[11px] font-medium bg-navy-950 hover:bg-navy-800 text-slate-300 border border-navy-800 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about SOS, emergency hotlines, safety planning..."
            className="w-full pl-4 pr-12 py-3.5 rounded-2xl bg-navy-950 border border-navy-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 shadow-xl"
          />
          <button
            type="submit"
            disabled={sending || !input.trim()}
            className="absolute right-2 p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
