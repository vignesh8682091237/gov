import React from "react";
import { Navigate } from "react-router-dom";
import Navbar from "./Navbar.jsx";

export default function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem("admin_token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <main className="p-6 max-w-6xl mx-auto">{children}</main>
    </div>
  );
}
