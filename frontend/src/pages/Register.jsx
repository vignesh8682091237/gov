import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registrationsApi } from "../services/api.js";

function getClientMetadata() {
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

export default function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    dob: "",
    email: "",
    mobile: "",
    alt_mobile: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!formData.name.trim()) {
      setError("தயவுசெய்து உங்கள் பெயரை உள்ளிடவும் (Please enter your name)");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("சரியான மின்னஞ்சலை உள்ளிடவும் (Please enter a valid email)");
      return;
    }
    if (!formData.mobile.trim() || formData.mobile.replace(/\D/g, "").length < 10) {
      setError("10 இலக்க மொபைல் எண்ணை உள்ளிடவும் (Please enter 10-digit mobile number)");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        age: formData.age ? parseInt(formData.age, 10) : null,
        dob: formData.dob || null,
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        alt_mobile: formData.alt_mobile.trim() || null,
        client_info: getClientMetadata(),
      };

      await registrationsApi.create(payload);

      // Navigate to Diwali Celebration page with user's name
      navigate("/diwali", { state: { name: formData.name.trim() } });
    } catch (err) {
      const serverMsg = err.response?.data?.error || "பதிவு செய்வதில் பிழை ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.";
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Decorative festive ambient background lights */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-orange-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-slate-800/80 bg-slate-900/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="text-2xl animate-pulse">🪔</span>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
              தீபாவளி சிறப்பு பதிவு (Diwali Special Registration)
            </h1>
            <p className="text-xs text-slate-400">Festive Portal &amp; Community Connect</p>
          </div>
        </div>

        <Link
          to="/login"
          className="text-xs text-slate-400 hover:text-amber-400 border border-slate-700/60 hover:border-amber-500/50 px-3 py-1.5 rounded-lg transition flex items-center gap-1.5"
        >
          <span>🔐</span> Admin Login
        </Link>
      </header>

      {/* Main Registration Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 py-8">
        <div className="w-full max-w-xl bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-amber-500/10 backdrop-blur-xl">
          
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 text-2xl font-bold shadow-lg shadow-amber-500/30 mb-3">
              ✨
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              விவரங்களை பதிவு செய்க
            </h2>
            <p className="text-sm text-amber-300/90 mt-1 font-medium">
              Enter your details below to receive Diwali celebration specials &amp; wishes
            </p>
          </div>

          {error && (
            <div className="mb-5 bg-red-950/80 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm flex items-start gap-2">
              <span className="text-base">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                முழு பெயர் / Full Name <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="उदा. Vignesh / குமார்"
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition"
                required
              />
            </div>

            {/* Age & DOB Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  வயது / Age
                </label>
                <input
                  type="number"
                  name="age"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={handleChange}
                  placeholder="उदा. 25"
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  பிறந்த தேதி / Date of Birth (DOB)
                </label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                மின்னஞ்சல் முகவரி / Email Address <span className="text-amber-400">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@gmail.com"
                className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition"
                required
              />
            </div>

            {/* Mobile & Alternative Mobile Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  கைபேசி எண் / Mobile Number <span className="text-amber-400">*</span>
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  மாற்று எண் / Alternative Mobile No
                </label>
                <input
                  type="tel"
                  name="alt_mobile"
                  value={formData.alt_mobile}
                  onChange={handleChange}
                  placeholder="9123456780 (Optional)"
                  className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition"
                />
              </div>
            </div>

            {/* Privacy notice note */}
            <p className="text-[11px] text-slate-400/80 pt-1">
              🔒 உங்கள் தகவல்கள் பாதுகாப்பாக சேமிக்கப்படும். தீபாவளி வாழ்த்துகள் மற்றும் அறிவிப்புகள் பகிர்வதற்காக மட்டுமே பயன்படுத்தப்படும்.
            </p>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3.5 px-6 rounded-xl font-bold text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 active:scale-[0.99] transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-slate-950" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>பதிவு செய்யப்படுகிறது... (Registering...)</span>
                </>
              ) : (
                <>
                  <span>பதிவு செய்து தொடர்க (Register &amp; Celebrate)</span>
                  <span className="text-lg">🪔</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center text-xs text-slate-500 border-t border-slate-900 bg-slate-950/60">
        <p>© 2026 Diwali Festival Portal • Wishing you Joy, Prosperity &amp; Light 🪔✨</p>
      </footer>
    </div>
  );
}
