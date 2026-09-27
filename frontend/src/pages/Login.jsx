import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authApi } from "../services/api.js";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await authApi.login(username, password);
      sessionStorage.setItem("admin_token", res.data.token);
      navigate("/registrations");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please check username and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink p-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-accent">Admin Login</h1>
          <Link to="/" className="text-xs text-slate-400 hover:text-white">
            ← Back to Home
          </Link>
        </div>
        <p className="text-slate-400 text-xs">
          Sign in to view submitted user registrations and analytics
        </p>
        {error && (
          <div className="bg-red-950 border border-red-700 text-red-300 rounded-lg px-3 py-2 text-xs">
            {error}
          </div>
        )}
        <div>
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Username</label>
          <input
            className="input-field mt-1 text-sm"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            placeholder="admin"
            required
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Password</label>
          <input
            type="password"
            className="input-field mt-1 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            placeholder="••••••••"
            required
          />
        </div>
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in to Dashboard"}
        </button>
        <p className="text-[11px] text-center text-slate-500 pt-1">
          Default Admin: <span className="font-mono text-slate-400">admin / admin123</span>
        </p>
      </form>
    </div>
  );
}
