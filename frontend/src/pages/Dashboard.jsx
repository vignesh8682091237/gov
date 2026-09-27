import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { dashboardApi } from "../services/api.js";
import StatCard from "../components/StatCard.jsx";

const COLORS = ["#22d3ee", "#818cf8", "#f472b6", "#facc15", "#34d399", "#fb923c"];

function toChartArray(obj) {
  return Object.entries(obj || {}).map(([name, value]) => ({ name, value }));
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    dashboardApi
      .statistics()
      .then((res) => setStats(res.data))
      .catch(() => setError("Could not load dashboard statistics."));
  }, []);

  if (error) return <div className="text-red-400">{error}</div>;
  if (!stats) return <div className="text-slate-400">Loading dashboard...</div>;

  const visitsPerDay = Object.entries(stats.visits_per_day).map(([date, count]) => ({
    date, count,
  }));
  const consentData = [
    { name: "Accepted", value: stats.consent_breakdown.accepted },
    { name: "Declined", value: stats.consent_breakdown.declined },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard label="Total Links" value={stats.summary.total_links} />
        <StatCard label="Total Visits" value={stats.summary.total_visits} />
        <StatCard label="Consent Accepted" value={stats.summary.consent_accepted} accent="text-emerald-400" />
        <StatCard label="Consent Declined" value={stats.summary.consent_declined} accent="text-rose-400" />
        <StatCard label="Unique IPs" value={stats.summary.unique_ips} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="font-semibold mb-3 text-slate-200">Visits per day (last 14 days)</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={visitsPerDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#111a2e", border: "1px solid #334155" }} />
              <Line type="monotone" dataKey="count" stroke="#22d3ee" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-3 text-slate-200">Consent: accepted vs declined</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={consentData} dataKey="value" nameKey="name" outerRadius={90} label>
                {consentData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? "#34d399" : "#f87171"} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#111a2e", border: "1px solid #334155" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-3 text-slate-200">Device type distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={toChartArray(stats.by_device_type)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#111a2e", border: "1px solid #334155" }} />
              <Bar dataKey="value" fill="#818cf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-3 text-slate-200">Browser distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={toChartArray(stats.by_browser)} dataKey="value" nameKey="name" outerRadius={90} label>
                {toChartArray(stats.by_browser).map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#111a2e", border: "1px solid #334155" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card md:col-span-2">
          <h2 className="font-semibold mb-3 text-slate-200">Operating system distribution</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={toChartArray(stats.by_operating_system)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#111a2e", border: "1px solid #334155" }} />
              <Bar dataKey="value" fill="#facc15" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
