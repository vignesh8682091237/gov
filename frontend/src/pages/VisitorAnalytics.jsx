import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { visitorsApi } from "../services/api.js";

export default function VisitorAnalytics() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const perPage = 25;

  useEffect(() => {
    visitorsApi.list({ page, per_page: perPage }).then((res) => {
      setRows(res.data.items);
      setTotal(res.data.total);
    });
  }, [page]);

  const totalPages = Math.max(Math.ceil(total / perPage), 1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Visitor Analytics</h1>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-800">
              <th className="py-2 pr-4">Time</th>
              <th className="py-2 pr-4">Campaign</th>
              <th className="py-2 pr-4">IP</th>
              <th className="py-2 pr-4">Device</th>
              <th className="py-2 pr-4">Browser</th>
              <th className="py-2 pr-4">OS</th>
              <th className="py-2 pr-4">Consent</th>
              <th className="py-2 pr-4">Details</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-900">
                <td className="py-2 pr-4 text-slate-400">
                  {new Date(r.visited_at).toLocaleString()}
                </td>
                <td className="py-2 pr-4">{r.campaign_name}</td>
                <td className="py-2 pr-4 font-mono">{r.ip_address || "—"}</td>
                <td className="py-2 pr-4">{r.device_type || "—"}</td>
                <td className="py-2 pr-4">{r.browser || "—"}</td>
                <td className="py-2 pr-4">{r.operating_system || "—"}</td>
                <td className="py-2 pr-4">
                  <span className={
                    r.consent_status === "accepted"
                      ? "text-emerald-400" : "text-rose-400"
                  }>
                    {r.consent_status}
                  </span>
                </td>
                <td className="py-2 pr-4">
                  {r.consent_status === "accepted" ? (
                    <Link to={`/visitors/${r.id}`} className="text-accent hover:underline">
                      View
                    </Link>
                  ) : "—"}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="py-6 text-center text-slate-500">
                  No visitor sessions yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex justify-between items-center pt-4 text-sm text-slate-400">
          <span>Page {page} of {totalPages} ({total} total)</span>
          <div className="space-x-2">
            <button
              className="btn-secondary"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </button>
            <button
              className="btn-secondary"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
