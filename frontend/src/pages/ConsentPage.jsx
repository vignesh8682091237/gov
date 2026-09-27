import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { trackingApi } from "../services/api.js";

/**
 * PRIVACY NOTE: This component reads ONLY standard, non-invasive browser
 * JS properties that any website can already see — navigator.userAgent,
 * navigator.language, screen.width/height, Intl timezone, document.referrer.
 * It never requests geolocation, camera, microphone, contacts, or storage
 * belonging to other sites, and it sends nothing to the backend until the
 * visitor clicks "Allow & Continue".
 */
function collectClientInfo() {
  let deviceType = "desktop";
  const ua = navigator.userAgent || "";
  if (/Mobi|Android/i.test(ua)) deviceType = "mobile";
  else if (/Tablet|iPad/i.test(ua)) deviceType = "tablet";

  return {
    device_type: deviceType,
    screen_resolution: `${window.screen.width}x${window.screen.height}`,
    language: navigator.language || "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
    referrer: document.referrer || "",
  };
}

export default function ConsentPage() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [linkInfo, setLinkInfo] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | invalid | declined | error
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    trackingApi
      .resolve(code)
      .then((res) => {
        setLinkInfo(res.data);
        setStatus("ready");
      })
      .catch(() => setStatus("invalid"));
  }, [code]);

  const handleDecline = async () => {
    setSubmitting(true);
    try {
      await trackingApi.consent(code, { consent: "declined" });
    } catch (_e) {
      // Even if logging the decline fails, respect the visitor's choice.
    } finally {
      setStatus("declined");
      setSubmitting(false);
    }
  };

  const handleAllow = async () => {
    setSubmitting(true);
    try {
      const res = await trackingApi.consent(code, {
        consent: "accepted",
        client_info: collectClientInfo(),
      });
      navigate(`/t/${code}/details`, {
        state: {
          sessionId: res.data.session_id,
          destinationUrl: res.data.destination_url,
        },
      });
    } catch (_e) {
      setStatus("error");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return <CenteredCard><p className="text-slate-400">Loading...</p></CenteredCard>;
  }

  if (status === "invalid") {
    return (
      <CenteredCard>
        <h1 className="text-xl font-bold text-rose-400 mb-2">Link not available</h1>
        <p className="text-slate-400">
          This tracking link is invalid, inactive, or has expired.
        </p>
      </CenteredCard>
    );
  }

  if (status === "declined") {
    return (
      <CenteredCard>
        <h1 className="text-xl font-bold text-white mb-2">Choice recorded</h1>
        <p className="text-slate-400">
          You have declined data collection. No technical or personal
          information beyond a basic visit record has been stored. Thank you.
        </p>
      </CenteredCard>
    );
  }

  if (status === "error") {
    return (
      <CenteredCard>
        <h1 className="text-xl font-bold text-rose-400 mb-2">Something went wrong</h1>
        <p className="text-slate-400">Please try again in a moment.</p>
      </CenteredCard>
    );
  }

  return (
    <CenteredCard wide>
      <h1 className="text-xl font-bold text-accent mb-3">
        Device Information Sharing Consent
      </h1>
      <p className="text-slate-300 mb-4">
        {linkInfo?.consent_notice}
      </p>
      <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 mb-5 text-sm text-slate-400 space-y-1">
        <p className="font-semibold text-slate-300">We do NOT collect:</p>
        <p>Passwords, OTPs, contacts, saved emails/phone numbers, browser
        credentials, cookies from other sites, session tokens, files, camera,
        microphone, or precise location.</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleAllow}
          disabled={submitting}
          className="btn-primary flex-1"
        >
          {submitting ? "Please wait..." : "Allow & Continue"}
        </button>
        <button
          onClick={handleDecline}
          disabled={submitting}
          className="btn-secondary flex-1"
        >
          Decline
        </button>
      </div>
    </CenteredCard>
  );
}

function CenteredCard({ children, wide }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4">
      <div className={`card ${wide ? "max-w-lg" : "max-w-sm"} w-full`}>{children}</div>
    </div>
  );
}
