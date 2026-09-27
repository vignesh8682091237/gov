import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-accent">Admin Login</h1>
        <p className="text-slate-400 text-sm">
          Consent-Based Link Analytics &amp; Device Information Collection System
        </p>
        {error && (
          <div className="bg-red-950 border border-red-700 text-red-300 rounded-lg px-3 py-2 text-sm">
            {error}
          </div>
        )}
        <div>
          <label className="text-sm text-slate-300">Username</label>
          <input
            className="input-field mt-1"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
        </div>
        <div>
          <label className="text-sm text-slate-300">Password</label>
          <input
            type="password"
            className="input-field mt-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
