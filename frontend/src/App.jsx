import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Register from "./pages/Register.jsx";
import DiwaliCelebration from "./pages/DiwaliCelebration.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Registrations from "./pages/Registrations.jsx";
import CreateLink from "./pages/CreateLink.jsx";
import Links from "./pages/Links.jsx";
import LinkDetail from "./pages/LinkDetail.jsx";
import ConsentPage from "./pages/ConsentPage.jsx";
import InfoForm from "./pages/InfoForm.jsx";
import ThankYou from "./pages/ThankYou.jsx";
import VisitorAnalytics from "./pages/VisitorAnalytics.jsx";
import VisitorDetails from "./pages/VisitorDetails.jsx";
import Settings from "./pages/Settings.jsx";
import AuditLogs from "./pages/AuditLogs.jsx";

export default function App() {
  return (
    <Routes>
      {/* Public user registration & Diwali greeting */}
      <Route path="/" element={<Register />} />
      <Route path="/register" element={<Register />} />
      <Route path="/diwali" element={<DiwaliCelebration />} />

      {/* Public visitor-facing consent tracking flow */}
      <Route path="/t/:code" element={<ConsentPage />} />
      <Route path="/t/:code/details" element={<InfoForm />} />
      <Route path="/t/:code/thank-you" element={<ThankYou />} />

      {/* Admin auth */}
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<Navigate to="/login" replace />} />
      <Route path="/admin/login" element={<Login />} />

      {/* Admin dashboard & registrations (protected) */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/registrations" element={<ProtectedRoute><Registrations /></ProtectedRoute>} />
      <Route path="/links" element={<ProtectedRoute><Links /></ProtectedRoute>} />
      <Route path="/links/new" element={<ProtectedRoute><CreateLink /></ProtectedRoute>} />
      <Route path="/links/:id" element={<ProtectedRoute><LinkDetail /></ProtectedRoute>} />
      <Route path="/visitors" element={<ProtectedRoute><VisitorAnalytics /></ProtectedRoute>} />
      <Route path="/visitors/:sessionId" element={<ProtectedRoute><VisitorDetails /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      <Route path="/audit-logs" element={<ProtectedRoute><AuditLogs /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
