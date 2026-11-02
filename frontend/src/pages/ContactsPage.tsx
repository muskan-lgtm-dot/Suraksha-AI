import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { TrustedContact } from '../types';
import {
  Users,
  Plus,
  Phone,
  Mail,
  ShieldCheck,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Send
} from 'lucide-react';

export const ContactsPage: React.FC = () => {
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingContact, setEditingContact] = useState<TrustedContact | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Parent');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredChannel, setPreferredChannel] = useState<'sms' | 'email' | 'both'>('both');
  const [notificationConsent, setNotificationConsent] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadContacts = async () => {
    try {
      const data = await api.listContacts();
      setContacts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const openCreateModal = () => {
    setEditingContact(null);
    setName('');
    setRelationship('Parent');
    setPhone('');
    setEmail('');
    setPreferredChannel('both');
    setNotificationConsent(true);
    setShowModal(true);
  };

  const openEditModal = (c: TrustedContact) => {
    setEditingContact(c);
    setName(c.name);
    setRelationship(c.relationship);
    setPhone(c.phone);
    setEmail(c.email);
    setPreferredChannel(c.preferred_channel);
    setNotificationConsent(c.notification_consent);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!notificationConsent) {
      setError('You must confirm that this contact has given consent to receive emergency notifications.');
      return;
    }

    setSubmitting(true);
    try {
      if (editingContact) {
        await api.updateContact(editingContact.id, {
          name,
          relationship,
          phone,
          email,
          preferred_channel: preferredChannel
        });
        setSuccess('Contact updated successfully');
      } else {
        await api.createContact({
          name,
          relationship,
          phone,
          email,
          preferred_channel: preferredChannel,
          notification_consent: notificationConsent
        });
        setSuccess('Trusted contact added to your safety network');
      }
      setShowModal(false);
      loadContacts();
    } catch (err: any) {
      setError(err.message || 'Failed to save contact');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to remove this contact from your safety network?')) {
      return;
    }
    try {
      await api.deleteContact(id);
      setSuccess('Contact removed');
      loadContacts();
    } catch (err: any) {
      setError(err.message || 'Failed to delete contact');
    }
  };

  const handleToggleEnable = async (c: TrustedContact) => {
    try {
      await api.updateContact(c.id, { is_enabled: !c.is_enabled });
      loadContacts();
    } catch (err: any) {
      setError(err.message || 'Failed to update contact status');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-navy-950 via-navy-900 to-slate-900 border-b border-navy-800 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-emergency-500" />
              <h1 className="text-2xl font-extrabold text-white">TRUSTED CONTACTS</h1>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Configure up to 10 guardians who immediately receive SMS & Email alerts when you trigger SOS.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            disabled={contacts.length >= 10}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-emergency-600 hover:bg-emergency-500 text-white shadow-lg shadow-emergency-600/30 transition-all self-start sm:self-auto disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>Add Trusted Contact</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 mt-8 space-y-6">
        {/* Alerts */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        {/* Contacts Grid */}
        {loading ? (
          <div className="text-center py-12 text-xs text-slate-400">Loading contacts...</div>
        ) : contacts.length === 0 ? (
          <div className="p-12 rounded-3xl bg-navy-950 border border-dashed border-navy-800 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-navy-900 text-slate-400 flex items-center justify-center mx-auto">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">No Guardians Configured</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Add parents, friends, or roommates. They will be sent your real-time GPS location during emergencies.
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emergency-600 text-white"
            >
              <Plus className="w-4 h-4" />
              <span>Add First Contact</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {contacts.map((c) => (
              <div
                key={c.id}
                className={`p-5 rounded-2xl border transition-all ${
                  c.is_enabled
                    ? 'bg-navy-950 border-navy-800 hover:border-slate-700'
                    : 'bg-navy-950/60 border-navy-900 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-white">{c.name}</h3>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-navy-800 text-slate-300">
                        {c.relationship}
                      </span>
                    </div>
                    <div className="mt-2 space-y-1 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{c.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-sky-400" />
                        <span>{c.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(c)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-850"
                      title="Edit Contact"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-navy-850"
                      title="Delete Contact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Footer status bar */}
                <div className="mt-4 pt-3 border-t border-navy-850 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Channel:</span>
                    <span className="font-bold text-emerald-400 uppercase">{c.preferred_channel}</span>
                  </div>
                  <button
                    onClick={() => handleToggleEnable(c)}
                    className={`font-semibold hover:underline ${
                      c.is_enabled ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {c.is_enabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 rounded-3xl bg-navy-950 border border-navy-800 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                {editingContact ? 'Edit Trusted Contact' : 'Add Trusted Contact'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ananya Sen"
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-emergency-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Relationship *</label>
                <select
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-emergency-500"
                >
                  <option value="Parent">Parent</option>
                  <option value="Sister">Sister</option>
                  <option value="Brother">Brother</option>
                  <option value="Friend">Friend / Roommate</option>
                  <option value="Partner">Partner / Spouse</option>
                  <option value="Colleague">Colleague</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number (with Country Code) *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98111 22334"
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-emergency-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="guardian@example.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-navy-900 border border-navy-700 text-xs text-white focus:outline-none focus:border-emergency-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Preferred Alert Channel</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['both', 'sms', 'email'] as const).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setPreferredChannel(ch)}
                      className={`py-1.5 rounded-lg text-xs font-bold uppercase transition-colors ${
                        preferredChannel === ch
                          ? 'bg-emergency-600 text-white'
                          : 'bg-navy-900 text-slate-400 hover:text-white border border-navy-700'
                      }`}
                    >
                      {ch}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="consentCheck"
                  checked={notificationConsent}
                  onChange={(e) => setNotificationConsent(e.target.checked)}
                  className="mt-0.5 rounded bg-navy-900 border-navy-700 text-emergency-600 focus:ring-0"
                />
                <label htmlFor="consentCheck" className="text-[11px] text-slate-300 leading-tight">
                  I confirm that this contact has consented to receive automated emergency SMS and Email alerts with my GPS location.
                </label>
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
                  className="w-1/2 py-2.5 rounded-xl text-xs font-bold bg-emergency-600 hover:bg-emergency-500 text-white disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingContact ? 'Update Contact' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
