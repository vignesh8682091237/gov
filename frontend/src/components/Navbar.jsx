import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { authApi } from "../services/api.js";

const links = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/links", label: "Tracking Links" },
  { to: "/links/new", label: "Create Link" },
  { to: "/visitors", label: "Visitor Analytics" },
  { to: "/audit-logs", label: "Audit Logs" },
  { to: "/settings", label: "Settings" },
];

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch (_e) {
      // ignore network errors on logout
    }
    sessionStorage.removeItem("admin_token");
    navigate("/login");
  };

  return (
    <nav className="bg-panel border-b border-slate-800 px-6 py-3 flex items-center justify-between flex-wrap gap-3">
      <div className="font-bold text-accent tracking-wide">
        Consent Link Analytics
      </div>
      <div className="flex gap-4 flex-wrap text-sm">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `px-2 py-1 rounded ${
                isActive ? "bg-accent text-ink font-semibold" : "text-slate-300 hover:text-white"
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </div>
      <button onClick={handleLogout} className="btn-secondary text-sm">
        Logout
      </button>
    </nav>
  );
}
