import React, { useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { trackingApi } from "../services/api.js";

export default function InfoForm() {
  const { code } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { sessionId, destinationUrl } = location.state || {};

  const [form, setForm] = useState({ name: "", email: "", mobile: "", purpose: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (!sessionId) {
    return (
      <CenteredCard>
        <p className="text-slate-400">
          This step can only be reached right after giving consent.
        </p>
      </CenteredCard>
    );
  }

  const update = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSubmitting(true);
    try {
      await trackingApi.submitDetails(code, { session_id: sessionId, ...form });
      navigate(`/t/${code}/thank-you`, { state: { destinationUrl } });
    } catch (err) {
      const field = err.response?.data?.field;
      const message = err.response?.data?.error || "Could not submit.";
      setErrors(field ? { [field]: message } : { _general: message });
    } finally {
      setSubmitting(false);
    }
  };

  const skip = () => navigate(`/t/${code}/thank-you`, { state: { destinationUrl } });

  return (
    <CenteredCard wide>
      <h1 className="text-xl font-bold text-accent mb-2">Optional Information</h1>
      <p className="text-slate-400 text-sm mb-4">
        Every field below is optional. We will never auto-fill these from
        your device — only what you type here is stored.
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        {errors._general && (
          <div className="bg-red-950 border border-red-700 text-red-300 rounded-lg px-3 py-2 text-sm">
            {errors._general}
          </div>
        )}
        <Field label="Name (optional)" value={form.name} onChange={update("name")} error={errors.name} />
        <Field label="Email (optional)" type="email" value={form.email} onChange={update("email")} error={errors.email} />
        <Field label="Mobile Number (optional)" value={form.mobile} onChange={update("mobile")} error={errors.mobile}
               placeholder="10-digit Indian mobile number" />
        <Field label="Purpose of Visit (optional)" value={form.purpose} onChange={update("purpose")} error={errors.purpose} textarea />

        <div className="flex gap-3 pt-2">
          <button className="btn-primary flex-1" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit"}
          </button>
          <button type="button" className="btn-secondary flex-1" onClick={skip}>
            Skip
          </button>
        </div>
      </form>
    </CenteredCard>
  );
}

function Field({ label, value, onChange, error, type = "text", placeholder, textarea }) {
  return (
    <div>
      <label className="text-sm text-slate-300">{label}</label>
      {textarea ? (
        <textarea className="input-field mt-1" rows={3} value={value} onChange={onChange} maxLength={500} />
      ) : (
        <input
          type={type}
          className="input-field mt-1"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={254}
        />
      )}
      {error && <p className="text-rose-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

function CenteredCard({ children, wide }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4">
      <div className={`card ${wide ? "max-w-lg" : "max-w-sm"} w-full`}>{children}</div>
    </div>
  );
}
