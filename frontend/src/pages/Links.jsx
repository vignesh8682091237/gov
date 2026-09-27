import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { linksApi } from "../services/api.js";

export default function Links() {
  const [links, setLinks] = useState([]);
  const [error, setError] = useState("");

  const load = () => {
    linksApi
      .list()
      .then((res) => setLinks(res.data))
      .catch(() => setError("Could not load tracking links."));
  };

  useEffect(load, []);

  const toggleStatus = async (link) => {
    const newStatus = link.status === "active" ? "inactive" : "active";
    await linksApi.update(link.id, { status: newStatus });
    load();
  };

  const remove = async (link) => {
    if (!window.confirm(`Delete campaign "${link.campaign_name}"? This cannot be undone.`)) return;
    await linksApi.remove(link.id);
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Tracking Links</h1>
        <Link to="/links/new" className="btn-primary">+ New Link</Link>
      </div>

      {error && <div className="text-red-400">{error}</div>}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-800">
              <th className="py-2 pr-4">Campaign</th>
              <th className="py-2 pr-4">Code</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Visits</th>
              <th className="py-2 pr-4">Accepted</th>
              <th className="py-2 pr-4">Declined</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {links.map((l) => (
              <tr key={l.id} className="border-b border-slate-900">
                <td className="py-2 pr-4">
                  <Link to={`/links/${l.id}`} className="text-accent hover:underline">
                    {l.campaign_name}
                  </Link>
                </td>
                <td className="py-2 pr-4 font-mono">{l.tracking_code}</td>
                <td className="py-2 pr-4">
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    l.status === "active" ? "bg-emerald-900 text-emerald-300" : "bg-slate-800 text-slate-400"
                  }`}>
                    {l.status}
                  </span>
                </td>
                <td className="py-2 pr-4">{l.stats?.total_visits ?? 0}</td>
                <td className="py-2 pr-4 text-emerald-400">{l.stats?.consent_accepted ?? 0}</td>
                <td className="py-2 pr-4 text-rose-400">{l.stats?.consent_declined ?? 0}</td>
                <td className="py-2 pr-4 space-x-2">
                  <button className="btn-secondary text-xs" onClick={() => toggleStatus(l)}>
                    {l.status === "active" ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    className="text-xs text-rose-400 hover:underline"
                    onClick={() => remove(l)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {links.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-500">
                  No tracking links yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
