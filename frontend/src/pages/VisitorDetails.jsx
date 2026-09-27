import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { visitorsApi } from "../services/api.js";

export default function VisitorDetails() {
  const { sessionId } = useParams();
  const [details, setDetails] = useState(undefined);

  useEffect(() => {
    visitorsApi.details(sessionId).then((res) => setDetails(res.data.details));
  }, [sessionId]);

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold text-white">Visitor Details</h1>
      <p className="text-slate-500 text-sm">
        Restricted to authorized administrators. Shown only when the visitor
        voluntarily submitted the optional form.
      </p>

      <div className="card">
        {details === undefined && <p className="text-slate-400">Loading...</p>}
        {details === null && (
          <p className="text-slate-500">
            This visitor did not submit any optional details.
          </p>
        )}
        {details && (
          <dl className="grid grid-cols-3 gap-y-3 text-sm">
            <dt className="text-slate-400">Name</dt>
            <dd className="col-span-2">{details.name || "—"}</dd>
            <dt className="text-slate-400">Email</dt>
            <dd className="col-span-2">{details.email || "—"}</dd>
            <dt className="text-slate-400">Mobile</dt>
            <dd className="col-span-2">{details.mobile || "—"}</dd>
            <dt className="text-slate-400">Purpose</dt>
            <dd className="col-span-2">{details.purpose || "—"}</dd>
            <dt className="text-slate-400">Submitted</dt>
            <dd className="col-span-2">
              {new Date(details.submitted_at).toLocaleString()}
            </dd>
          </dl>
        )}
      </div>
    </div>
  );
}
