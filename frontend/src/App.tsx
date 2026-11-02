import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { EmergencyBanner } from './components/EmergencyBanner';
import { SimulatedCallModal } from './components/SimulatedCallModal';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { EmergencyPage } from './pages/EmergencyPage';
import { ContactsPage } from './pages/ContactsPage';
import { LocationSharingPage } from './pages/LocationSharingPage';
import { PublicTrackingPage } from './pages/PublicTrackingPage';
import { NearbyAssistancePage } from './pages/NearbyAssistancePage';
import { CommunityReportsPage } from './pages/CommunityReportsPage';
import { CheckInsPage } from './pages/CheckInsPage';
import { SafetyAssistantPage } from './pages/SafetyAssistantPage';
import { EmergencyHistoryPage } from './pages/EmergencyHistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <div className="w-4 h-4 border-2 border-emergency-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Verifying security session...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const [simulatedCallOpen, setSimulatedCallOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <Navbar onOpenSimulatedCall={() => setSimulatedCallOpen(true)} />
      <EmergencyBanner />

      <div className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/track/:token" element={<PublicTrackingPage />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage onOpenSimulatedCall={() => setSimulatedCallOpen(true)} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/emergency"
            element={
              <ProtectedRoute>
                <EmergencyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/emergency/:incidentId"
            element={
              <ProtectedRoute>
                <EmergencyPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contacts"
            element={
              <ProtectedRoute>
                <ContactsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/location-sharing"
            element={
              <ProtectedRoute>
                <LocationSharingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/nearby"
            element={
              <ProtectedRoute>
                <NearbyAssistancePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/community-reports"
            element={
              <ProtectedRoute>
                <CommunityReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkins"
            element={
              <ProtectedRoute>
                <CheckInsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assistant"
            element={
              <ProtectedRoute>
                <SafetyAssistantPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <EmergencyHistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Footer />

      {/* Global Simulated Incoming Call Modal */}
      <SimulatedCallModal
        isOpen={simulatedCallOpen}
        onClose={() => setSimulatedCallOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
