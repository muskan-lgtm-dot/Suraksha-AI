import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import {
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
  Trash2,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ProfilePage: React.FC = () => {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();

  // Profile fields
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [emergencyNotes, setEmergencyNotes] = useState(user?.emergency_notes || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Password change fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changingPass, setChangingPass] = useState(false);
  const [passMsg, setPassMsg] = useState<string | null>(null);
  const [passErr, setPassErr] = useState<string | null>(null);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);
    try {
      await api.updateProfile({
        full_name: fullName,
        phone: phone || undefined,
        emergency_notes: emergencyNotes || undefined
      });
      await refreshUser();
      setProfileMsg('Profile updated successfully');
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangingPass(true);
    setPassMsg(null);
    setPassErr(null);

    if (newPassword.length < 8) {
      setPassErr('New password must be at least 8 characters');
      setChangingPass(false);
      return;
    }

    try {
      await api.changePassword({ old_password: oldPassword, new_password: newPassword });
      setPassMsg('Password changed successfully');
      setOldPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPassErr(err.message || 'Password update failed');
    } finally {
      setChangingPass(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you ABSOLUTELY sure? This will delete your account, contacts, and personal data permanently.')) {
      return;
    }
    try {
      await api.deleteAccount();
      logout();
      navigate('/');
    } catch (err: any) {
      alert(err.message || 'Failed to delete account');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-navy-950 via-navy-900 to-slate-900 border-b border-navy-800 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <UserIcon className="w-6 h-6 text-emergency-500" />
            <h1 className="text-2xl font-extrabold text-white">PROFILE & SAFETY SETTINGS</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage your personal profile, medical emergency details, security credentials, and data privacy.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 mt-8 space-y-6">
        {/* Profile Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-navy-950 border border-navy-800 shadow-xl space-y-5">
          <h3 className="font-bold text-base text-white">Personal & Medical Information</h3>

          {profileMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{profileMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-emergency-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email (Account ID)</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900/60 border border-navy-800 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-emergency-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Emergency Medical / Safety Notes
              </label>
              <textarea
                rows={2}
                value={emergencyNotes}
                onChange={(e) => setEmergencyNotes(e.target.value)}
                placeholder="e.g. Blood Group O+, Asthma inhaler in bag, allergic to penicillin"
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-emergency-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Included in SOS alerts to trusted contacts so they can provide paramedics with life-saving information.
              </p>
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emergency-600 hover:bg-emergency-500 text-white shadow-md flex items-center gap-1.5 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{savingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

        {/* Change Password Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-navy-950 border border-navy-800 shadow-xl space-y-5">
          <h3 className="font-bold text-base text-white">Security & Password</h3>

          {passMsg && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{passMsg}</span>
            </div>
          )}
          {passErr && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" />
              <span>{passErr}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-emergency-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">New Password (min 8 chars)</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-emergency-500"
              />
            </div>

            <button
              type="submit"
              disabled={changingPass}
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-navy-850 hover:bg-navy-800 text-slate-200 border border-navy-700 flex items-center gap-1.5 disabled:opacity-50"
            >
              <Lock className="w-4 h-4" />
              <span>{changingPass ? 'Updating...' : 'Change Password'}</span>
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="p-6 sm:p-8 rounded-3xl bg-navy-950 border border-rose-500/30 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-sm text-rose-400">Delete Account & Safety Data</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              Permanently purge your account, contacts, incident history, and location data in compliance with data privacy principles.
            </p>
          </div>

          <button
            onClick={handleDeleteAccount}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 transition-colors shrink-0"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};
