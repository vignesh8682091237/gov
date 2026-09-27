import React from "react";

export default function Settings() {
  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      <div className="card space-y-4">
        <h2 className="font-semibold text-slate-200">Privacy &amp; Retention</h2>
        <p className="text-slate-400 text-sm">
          These are configured via backend environment variables
          (<code className="text-accent">MASK_IPS_IN_DASHBOARD</code>,{" "}
          <code className="text-accent">DATA_RETENTION_DAYS</code>) so they
          can be changed per deployment without touching application code.
        </p>
        <ul className="text-sm text-slate-400 list-disc list-inside space-y-1">
          <li>IP addresses are masked in dashboard/visitor views by default.</li>
          <li>
            Visitor sessions older than the configured retention window are
            purged by the <code className="text-accent">purge-expired-data</code>{" "}
            scheduled job.
          </li>
          <li>
            No passwords, OTPs, contacts, files, camera/microphone data, or
            precise location are ever requested or stored by this system.
          </li>
        </ul>
      </div>

      <div className="card space-y-2">
        <h2 className="font-semibold text-slate-200">Account</h2>
        <p className="text-slate-400 text-sm">
          Password changes and admin management are handled via the{" "}
          <code className="text-accent">flask create-admin</code> CLI command
          in this scaffold. Wire up a self-service change-password endpoint
          before production use if multiple admins need it.
        </p>
      </div>
    </div>
  );
}
