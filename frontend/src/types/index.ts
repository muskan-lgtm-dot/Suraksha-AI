export interface User {
  id: number;
  full_name: string;
  email: string;
  phone?: string | null;
  emergency_notes?: string | null;
  is_active: boolean;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface TrustedContact {
  id: number;
  user_id: number;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  preferred_channel: 'sms' | 'email' | 'both';
  verification_status: string;
  notification_consent: boolean;
  is_enabled: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface EmergencyNotification {
  id: number;
  incident_id: number;
  trusted_contact_id: number;
  channel: string;
  status: 'queued' | 'sent_to_provider' | 'delivered' | 'acknowledged' | 'failed';
  provider_name: string;
  provider_message_id?: string | null;
  attempted_at: string;
  sent_at?: string | null;
  delivered_at?: string | null;
  acknowledged_at?: string | null;
  error_code?: string | null;
  error_message?: string | null;
  contact_name?: string | null;
  contact_phone?: string | null;
  contact_email?: string | null;
}

export interface EmergencyIncident {
  id: number;
  incident_reference: string;
  user_id: number;
  status: 'draft' | 'active' | 'notification_pending' | 'notification_sent' | 'acknowledged' | 'resolved' | 'cancelled' | 'notification_failed';
  severity: 'critical' | 'high' | 'medium' | 'low';
  latitude?: number | null;
  longitude?: number | null;
  location_accuracy?: number | null;
  location_source?: string | null;
  location_timestamp?: string | null;
  address_text?: string | null;
  triggered_channel: string;
  cancellation_reason?: string | null;
  resolution_notes?: string | null;
  created_at: string;
  updated_at: string;
  resolved_at?: string | null;
  cancelled_at?: string | null;
  notifications: EmergencyNotification[];
}

export interface LocationShare {
  id: number;
  user_id: number;
  label: string;
  raw_token?: string | null;
  share_url?: string | null;
  last_latitude?: number | null;
  last_longitude?: number | null;
  last_accuracy?: number | null;
  last_updated_at?: string | null;
  expires_at: string;
  revoked_at?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface PublicLocationShare {
  label: string;
  sharer_first_name: string;
  last_latitude?: number | null;
  last_longitude?: number | null;
  last_accuracy?: number | null;
  last_updated_at?: string | null;
  expires_at: string;
  is_active: boolean;
}

export interface SafetyReport {
  id: number;
  user_id: number;
  category: 'lighting' | 'harassment' | 'infrastructure' | 'transport' | 'other';
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  approximate_location?: string | null;
  incident_time: string;
  moderation_status: 'pending_review' | 'under_review' | 'verified' | 'rejected' | 'archived';
  classification_source: string;
  ai_suggested_category?: string | null;
  moderation_notes?: string | null;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface CheckInSession {
  id: number;
  user_id: number;
  destination: string;
  expected_arrival: string;
  status: 'active' | 'completed' | 'expired' | 'cancelled';
  reminder_sent: boolean;
  alert_triggered: boolean;
  created_at: string;
  completed_at?: string | null;
}

export interface InAppNotification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link?: string | null;
  created_at: string;
}

export interface AiChatResponse {
  reply: string;
  suggestions: string[];
  source: string;
  is_emergency_flagged: boolean;
}

export interface AiClassificationResponse {
  suggested_category: string;
  confidence: number;
  source: string;
  explanation: string;
}

export interface SystemHealth {
  status: string;
  version: string;
  environment: string;
  database: string;
  sms_provider: string;
  email_provider: string;
  ai_provider: string;
  timestamp: string;
}
