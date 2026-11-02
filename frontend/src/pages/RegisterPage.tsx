import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, User as UserIcon, Mail, Lock, Phone, FileText, ArrowRight, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyNotes, setEmergencyNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      await register({
        full_name: fullName,
        email,
        password,
        phone: phone || undefined,
        emergency_notes: emergencyNotes || undefined
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-900">
      <div className="w-full max-w-lg p-8 rounded-3xl bg-navy-950 border border-navy-800 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emergency-600 to-rose-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emergency-600/30">
            <ShieldAlert className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Create Safety Account</h2>
          <p className="text-xs text-slate-400 mt-1">Join the SURAKSHA AI verified women safety network</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Aarohi Sen"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900 border border-navy-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emergency-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aarohi@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900 border border-navy-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emergency-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number (Optional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900 border border-navy-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emergency-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password (min 8 chars) *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900 border border-navy-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emergency-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-navy-900 border border-navy-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emergency-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Emergency Medical / Personal Notes (Optional)
            </label>
            <div className="relative">
              <textarea
                rows={2}
                value={emergencyNotes}
                onChange={(e) => setEmergencyNotes(e.target.value)}
                placeholder="e.g. Blood Group O+, Asthma inhaler in bag, allergic to penicillin"
                className="w-full px-4 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emergency-500 transition-colors"
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-tight">
            By registering, you agree that SURAKSHA AI is a communication and emergency coordination tool that supplements official services.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-emergency-600 to-rose-600 hover:brightness-110 text-white shadow-lg shadow-emergency-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{submitting ? 'Creating Profile...' : 'Complete Registration'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-emergency-400 hover:underline">
            Sign In here
          </Link>
        </p>
      </div>
    </div>
  );
};
