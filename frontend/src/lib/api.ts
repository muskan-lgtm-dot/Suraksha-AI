import {
  AuthResponse,
  User,
  TrustedContact,
  EmergencyIncident,
  LocationShare,
  PublicLocationShare,
  SafetyReport,
  CheckInSession,
  InAppNotification,
  AiChatResponse,
  AiClassificationResponse,
  SystemHealth
} from '../types';

const API_BASE = '/api';

export const getToken = (): string | null => localStorage.getItem('suraksha_token');
export const setToken = (token: string): void => localStorage.setItem('suraksha_token', token);
export const removeToken = (): void => localStorage.removeItem('suraksha_token');

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(endpoint.startsWith('http') || endpoint.startsWith('/health') ? endpoint : `${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorDetail = 'An error occurred';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (data: any) => request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request<User>('/auth/me'),
  logout: () => {
    removeToken();
    return request<{ message: string }>('/auth/logout', { method: 'POST' }).catch(() => ({ message: 'Logged out' }));
  },

  // Profile
  getProfile: () => request<User>('/profile'),
  updateProfile: (data: any) => request<User>('/profile', { method: 'PATCH', body: JSON.stringify(data) }),
  changePassword: (data: any) => request<{ message: string }>('/profile/change-password', { method: 'POST', body: JSON.stringify(data) }),
  deleteAccount: () => request<{ message: string }>('/profile', { method: 'DELETE' }),

  // Contacts
  listContacts: () => request<TrustedContact[]>('/contacts'),
  createContact: (data: any) => request<TrustedContact>('/contacts', { method: 'POST', body: JSON.stringify(data) }),
  updateContact: (id: number, data: any) => request<TrustedContact>(`/contacts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteContact: (id: number) => request<{ message: string }>(`/contacts/${id}`, { method: 'DELETE' }),

  // Emergency Incidents
  triggerSos: (data: any) => request<EmergencyIncident>('/incidents', { method: 'POST', body: JSON.stringify(data) }),
  getActiveIncident: () => request<EmergencyIncident | null>('/incidents/active'),
  listIncidents: () => request<EmergencyIncident[]>('/incidents'),
  getIncident: (id: number) => request<EmergencyIncident>(`/incidents/${id}`),
  cancelIncident: (id: number, reason: string) => request<EmergencyIncident>(`/incidents/${id}/cancel`, { method: 'POST', body: JSON.stringify({ reason }) }),
  resolveIncident: (id: number, resolution_notes?: string) => request<EmergencyIncident>(`/incidents/${id}/resolve`, { method: 'POST', body: JSON.stringify({ resolution_notes }) }),
  acknowledgeIncident: (id: number, contact_id?: number) => request<EmergencyIncident>(`/incidents/${id}/acknowledge${contact_id ? `?contact_id=${contact_id}` : ''}`, { method: 'POST' }),

  // Location Sharing
  createLocationShare: (data: any) => request<LocationShare>('/location-shares', { method: 'POST', body: JSON.stringify(data) }),
  listLocationShares: () => request<LocationShare[]>('/location-shares'),
  updateLocationCoordinates: (id: number, data: { latitude: number; longitude: number; accuracy?: number }) => request<LocationShare>(`/location-shares/${id}/location`, { method: 'PATCH', body: JSON.stringify(data) }),
  revokeLocationShare: (id: number) => request<{ message: string }>(`/location-shares/${id}/revoke`, { method: 'POST' }),
  getPublicLocationShare: (token: string) => request<PublicLocationShare>(`/public/location-shares/${token}`),

  // Safety Reports
  submitReport: (data: any) => request<SafetyReport>('/reports', { method: 'POST', body: JSON.stringify(data) }),
  listMyReports: () => request<SafetyReport[]>('/reports/mine'),
  listPublicReports: (category?: string) => request<SafetyReport[]>(`/reports${category && category !== 'all' ? `?category=${category}` : ''}`),
  getReport: (id: number) => request<SafetyReport>(`/reports/${id}`),
  updateReport: (id: number, data: any) => request<SafetyReport>(`/reports/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteReport: (id: number) => request<{ message: string }>(`/reports/${id}`, { method: 'DELETE' }),

  // Check-In Sessions
  startCheckin: (destination: string, durationMinutes: number) => request<CheckInSession>('/checkins', { method: 'POST', body: JSON.stringify({ destination, expected_duration_minutes: durationMinutes }) }),
  listCheckins: () => request<CheckInSession[]>('/checkins'),
  completeCheckin: (id: number) => request<CheckInSession>(`/checkins/${id}/complete`, { method: 'POST' }),
  cancelCheckin: (id: number) => request<CheckInSession>(`/checkins/${id}/cancel`, { method: 'POST' }),

  // In-App Notifications
  listNotifications: () => request<InAppNotification[]>('/notifications'),
  markNotificationRead: (id: number) => request<{ message: string }>(`/notifications/${id}/read`, { method: 'POST' }),
  markAllNotificationsRead: () => request<{ message: string }>('/notifications/read-all', { method: 'POST' }),

  // Admin
  listModerationQueue: (status?: string) => request<SafetyReport[]>(`/admin/reports${status ? `?status_filter=${status}` : ''}`),
  moderateReport: (id: number, status: string, notes?: string) => request<SafetyReport>(`/admin/reports/${id}/moderate`, { method: 'PATCH', body: JSON.stringify({ moderation_status: status, moderation_notes: notes }) }),
  getAdminStats: () => request<any>('/admin/stats'),
  getAuditLogs: () => request<any[]>('/admin/audit-logs'),

  // AI Safety Engine
  aiChat: (message: string, context?: string) => request<AiChatResponse>('/ai/chat', { method: 'POST', body: JSON.stringify({ message, context }) }),
  aiClassify: (text: string) => request<AiClassificationResponse>('/ai/classify-report', { method: 'POST', body: JSON.stringify({ text }) }),

  // System & Demo Seed
  getHealth: () => request<SystemHealth>('/health'),
  seedDemo: () => request<any>('/demo/seed', { method: 'POST' })
};
