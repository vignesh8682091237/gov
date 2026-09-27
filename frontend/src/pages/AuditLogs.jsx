import React, { useEffect, useState } from "react";
import { auditApi } from "../services/api.js";

export default function AuditLogs() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    auditApi.list({ page: 1, per_page: 100 }).then((res) => setRows(res.data.items));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Audit Logs</h1>
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-400 border-b border-slate-800">
              <th className="py-2 pr-4">Time</th>
              <th className="py-2 pr-4">Action</th>
              <th className="py-2 pr-4">Admin</th>
              <th className="py-2 pr-4">IP</th>
              <th className="py-2 pr-4">Details</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-slate-900">
                <td className="py-2 pr-4 text-slate-400">
                  {new Date(r.created_at).toLocaleString()}
                </td>
                <td className="py-2 pr-4">{r.action}</td>
                <td className="py-2 pr-4 font-mono text-xs">{r.admin_id || "—"}</td>
                <td className="py-2 pr-4 font-mono">{r.ip_address || "—"}</td>
                <td className="py-2 pr-4 text-slate-400">{r.details || "—"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-500">
                  No audit events yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
