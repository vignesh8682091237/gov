import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { linksApi } from "../services/api.js";
import StatCard from "../components/StatCard.jsx";

export default function LinkDetail() {
  const { id } = useParams();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    linksApi
      .statistics(id)
      .then((res) => setStats(res.data))
      .catch(() => setError("Could not load link statistics."));
  }, [id]);

  if (error) return <div className="text-red-400">{error}</div>;
  if (!stats) return <div className="text-slate-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">{stats.link.campaign_name}</h1>
      <p className="text-slate-400 font-mono text-sm">
        /t/{stats.link.tracking_code}
      </p>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Visits" value={stats.total_visits} />
        <StatCard label="Accepted" value={stats.consent_accepted} accent="text-emerald-400" />
        <StatCard label="Declined" value={stats.consent_declined} accent="text-rose-400" />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <BreakdownCard title="By device type" data={stats.by_device_type} />
        <BreakdownCard title="By browser" data={stats.by_browser} />
        <BreakdownCard title="By OS" data={stats.by_operating_system} />
      </div>
    </div>
  );
}

function BreakdownCard({ title, data }) {
  const entries = Object.entries(data || {});
  return (
    <div className="card">
      <h2 className="font-semibold mb-2 text-slate-200">{title}</h2>
      {entries.length === 0 && <p className="text-slate-500 text-sm">No data yet.</p>}
      <ul className="text-sm space-y-1">
        {entries.map(([k, v]) => (
          <li key={k} className="flex justify-between">
            <span className="text-slate-300">{k}</span>
            <span className="text-slate-400">{v}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
