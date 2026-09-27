import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { linksApi } from "../services/api.js";

export default function CreateLink() {
  const [campaignName, setCampaignName] = useState("");
  const [destinationUrl, setDestinationUrl] = useState("/thank-you");
  const [error, setError] = useState("");
  const [created, setCreated] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const publicBase = window.location.origin.replace(/:\d+$/, ":5173"); // dev convenience

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await linksApi.create({
        campaign_name: campaignName,
        destination_url: destinationUrl,
      });
      setCreated(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Could not create link.");
    } finally {
      setLoading(false);
    }
  };

  const trackingUrl = created ? `${window.location.origin}/t/${created.tracking_code}` : "";

  const copyUrl = () => {
    navigator.clipboard.writeText(trackingUrl);
  };

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="text-2xl font-bold text-white">Create Tracking Link</h1>

      <form onSubmit={handleSubmit} className="card space-y-4">
        {error && (
          <div className="bg-red-950 border border-red-700 text-red-300 rounded-lg px-3 py-2 text-sm">
            {error}
          </div>
        )}
        <div>
          <label className="text-sm text-slate-300">Campaign name</label>
          <input
            className="input-field mt-1"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            placeholder="e.g. Diwali Newsletter 2026"
            maxLength={120}
            required
          />
        </div>
        <div>
          <label className="text-sm text-slate-300">
            Destination after consent (optional)
          </label>
          <input
            className="input-field mt-1"
            value={destinationUrl}
            onChange={(e) => setDestinationUrl(e.target.value)}
            placeholder="/thank-you"
          />
        </div>
        <button className="btn-primary" disabled={loading}>
          {loading ? "Generating..." : "Generate Tracking Link"}
        </button>
      </form>

      {created && (
        <div className="card space-y-3">
          <h2 className="font-semibold text-emerald-400">Link created</h2>
          <div className="flex items-center gap-2">
            <input readOnly className="input-field" value={trackingUrl} />
            <button className="btn-secondary" onClick={copyUrl}>
              Copy
            </button>
          </div>
          <p className="text-slate-400 text-sm">
            Tracking code: <span className="font-mono">{created.tracking_code}</span>
          </p>
          <button className="btn-secondary" onClick={() => navigate("/links")}>
            View all links
          </button>
        </div>
      )}
    </div>
  );
}
