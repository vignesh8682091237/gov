import React from "react";

export default function StatCard({ label, value, accent }) {
  return (
    <div className="card flex flex-col gap-1">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className={`text-3xl font-bold ${accent || "text-white"}`}>
        {value}
      </span>
    </div>
  );
}
