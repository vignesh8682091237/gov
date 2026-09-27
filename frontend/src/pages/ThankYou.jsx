import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ThankYou() {
  const location = useLocation();
  const destinationUrl = location.state?.destinationUrl;

  useEffect(() => {
    if (destinationUrl && destinationUrl !== "/thank-you") {
      const timer = setTimeout(() => {
        window.location.href = destinationUrl;
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [destinationUrl]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-4">
      <div className="card max-w-sm w-full text-center">
        <h1 className="text-xl font-bold text-emerald-400 mb-2">Thank you!</h1>
        <p className="text-slate-400">
          {destinationUrl && destinationUrl !== "/thank-you"
            ? "Redirecting you shortly..."
            : "Your visit has been recorded. You may close this page."}
        </p>
      </div>
    </div>
  );
}
