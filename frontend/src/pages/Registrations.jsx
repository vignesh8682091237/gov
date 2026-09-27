import React, { useEffect, useState } from "react";
import { registrationsApi } from "../services/api.js";

export default function Registrations() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchRegistrations = async (currentPage = 1, searchQuery = "") => {
    setLoading(true);
    try {
      const res = await registrationsApi.list({
        page: currentPage,
        per_page: 20,
        q: searchQuery,
      });
      setItems(res.data.items || []);
      setTotal(res.data.total || 0);
      setPage(res.data.page || 1);
    } catch (err) {
      console.error("Failed to load registrations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations(1, search);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRegistrations(1, search);
  };

  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const res = await registrationsApi.exportCsv();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `registrations_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to export CSV: " + (err.message || "Unknown error"));
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the registration for ${name}?`)) {
      return;
    }
    try {
      await registrationsApi.remove(id);
      fetchRegistrations(page, search);
    } catch (err) {
      alert("Failed to delete registration: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="space-y-6">
        {/* Header & Stats bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800">
          <div>
            <h1 className="text-2xl font-bold text-accent flex items-center gap-2">
              <span>📋</span> User Registrations / பயனாளர் பதிவுகள்
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Live registrations collected from the registration page
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-panel border border-slate-700 text-sm">
              Total Registrations: <span className="font-bold text-accent">{total}</span>
            </div>
            <button
              onClick={handleExportCsv}
              disabled={exporting || total === 0}
              className="btn-primary text-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              <span>📥</span>
              <span>{exporting ? "Exporting..." : "Export CSV"}</span>
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or mobile..."
            className="input-field text-sm"
          />
          <button type="submit" className="btn-secondary text-sm">
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                fetchRegistrations(1, "");
              }}
              className="px-3 py-1 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </form>

        {/* Table */}
        <div className="card overflow-x-auto p-0 border border-slate-800">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-900/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Age / DOB</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">Alt Mobile</th>
                <th className="px-4 py-3">Device &amp; IP</th>
                <th className="px-4 py-3">Registered At</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-slate-400">
                    Loading registrations...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-10 text-center text-slate-500">
                    {search ? "No registrations matched your search." : "No registrations found yet."}
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-800/40 transition">
                    <td className="px-4 py-3 font-semibold text-slate-100">
                      {row.name}
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      <div>{row.age ? `${row.age} yrs` : "—"}</div>
                      {row.dob && (
                        <div className="text-xs text-slate-400">{row.dob}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-cyan-400 font-mono text-xs">
                      {row.email}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-200">
                      {row.mobile}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">
                      {row.alt_mobile || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      <div>{row.device_type} • {row.browser}</div>
                      <div className="font-mono text-[11px] text-slate-500">{row.ip_address || "—"}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {row.created_at ? new Date(row.created_at).toLocaleString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => setSelectedUser(row)}
                        className="text-xs text-accent hover:underline"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(row.id, row.name)}
                        className="text-xs text-red-400 hover:text-red-300 hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 20 && (
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
            <div>
              Showing {items.length} of {total} records
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchRegistrations(page - 1, search)}
                disabled={page <= 1}
                className="btn-secondary text-xs disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-2 py-1 text-slate-300">Page {page}</span>
              <button
                onClick={() => fetchRegistrations(page + 1, search)}
                disabled={items.length < 20}
                className="btn-secondary text-xs disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Modal for details view */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="card max-w-lg w-full space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-700">
                <h3 className="font-bold text-accent text-lg">Registration Details</h3>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-slate-400 hover:text-white text-lg"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div><span className="text-slate-400">Full Name:</span> <strong className="text-white">{selectedUser.name}</strong></div>
                <div><span className="text-slate-400">Age:</span> <span className="text-white">{selectedUser.age || "Not specified"}</span></div>
                <div><span className="text-slate-400">Date of Birth:</span> <span className="text-white">{selectedUser.dob || "Not specified"}</span></div>
                <div><span className="text-slate-400">Email:</span> <span className="text-cyan-300">{selectedUser.email}</span></div>
                <div><span className="text-slate-400">Mobile Number:</span> <span className="text-white font-mono">{selectedUser.mobile}</span></div>
                <div><span className="text-slate-400">Alternative Mobile:</span> <span className="text-white font-mono">{selectedUser.alt_mobile || "None"}</span></div>
                <div><span className="text-slate-400">Device Type:</span> <span className="text-slate-200">{selectedUser.device_type}</span></div>
                <div><span className="text-slate-400">Browser / OS:</span> <span className="text-slate-200">{selectedUser.browser} / {selectedUser.operating_system}</span></div>
                <div><span className="text-slate-400">IP Address:</span> <span className="text-slate-200 font-mono">{selectedUser.ip_address}</span></div>
                <div><span className="text-slate-400">Submitted At:</span> <span className="text-slate-200">{selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleString() : "—"}</span></div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="btn-secondary text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}
