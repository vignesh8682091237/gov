import React, { useState } from "react";
import { useLocation, Link } from "react-router-dom";

export default function DiwaliCelebration() {
  const location = useLocation();
  const userName = location.state?.name || "நண்பரே (Dear Friend)";

  const [diyasLit, setDiyasLit] = useState(3);
  const [crackerBurst, setCrackerBurst] = useState(false);

  const handleLightDiya = () => {
    setDiyasLit((prev) => Math.min(prev + 1, 9));
  };

  const handleBurstCracker = () => {
    setCrackerBurst(true);
    setTimeout(() => setCrackerBurst(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-amber-500 selection:text-slate-950">
      {/* Ambient festive lighting glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/4 -right-32 w-[30rem] h-[30rem] bg-orange-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-32 left-1/4 w-[32rem] h-[32rem] bg-yellow-500/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Floating Sparkles & Fireworks effect if triggered */}
      {crackerBurst && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-6xl animate-ping">🎆</div>
          <div className="text-7xl animate-bounce delay-100">✨</div>
          <div className="text-6xl animate-ping delay-200">🎇</div>
        </div>
      )}

      {/* Top Navbar */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-amber-500/20 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="text-2xl animate-bounce">🪔</span>
          <span className="font-bold text-amber-400 tracking-wide text-lg sm:text-xl">
            தீபாவளி நல்வாழ்த்துகள்
          </span>
        </div>
        <Link
          to="/"
          className="text-xs sm:text-sm text-amber-300 hover:text-white border border-amber-500/40 hover:border-amber-400 px-3.5 py-1.5 rounded-xl transition bg-amber-500/10"
        >
          ← முதன்மை பக்கம் (Home)
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-10">
        
        {/* Hero Section */}
        <section className="text-center space-y-5 bg-gradient-to-b from-amber-950/40 via-slate-900/80 to-slate-900/40 border border-amber-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-amber-500/10 backdrop-blur-xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold">
            <span>✨</span> இனிய தீபாவளி திருநாள் திருவிழா 2026 <span>✨</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
            Happy Deepavali, {userName}! 🪔
          </h1>

          <p className="text-lg sm:text-xl text-amber-100/90 font-medium max-w-2xl mx-auto leading-relaxed">
            அன்புடைய <span className="text-amber-300 font-bold underline decoration-amber-500/50">{userName}</span>, உங்கள் பதிவு வெற்றிகரமாக பெறப்பட்டது! 
            உங்களுக்கும் உங்கள் குடும்பத்தினருக்கும் எமது இதயங்கனிந்த இனிய தீபாவளி நல்வாழ்த்துகள்!
          </p>

          {/* Interactive Diya & Cracker Buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={handleLightDiya}
              className="px-5 py-2.5 rounded-xl font-bold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95 transition flex items-center gap-2 cursor-pointer text-sm sm:text-base"
            >
              <span>🪔</span> தீபம் ஏற்றுங்கள் (Light a Diya) ({diyasLit}/9)
            </button>

            <button
              onClick={handleBurstCracker}
              className="px-5 py-2.5 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 active:scale-95 transition flex items-center gap-2 cursor-pointer text-sm sm:text-base"
            >
              <span>🎆</span> பட்டாசு வெடிக்கவும் (Celebrate)
            </button>
          </div>

          {/* Diyas Display */}
          <div className="pt-4 flex flex-wrap justify-center gap-3 sm:gap-4">
            {Array.from({ length: diyasLit }).map((_, idx) => (
              <div
                key={idx}
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-2xl sm:text-3xl shadow-lg shadow-amber-500/30 animate-pulse"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                🪔
              </div>
            ))}
          </div>
        </section>

        {/* Informative Diwali Content Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: ஒளியின் திருவிழா */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-6 space-y-3 transition duration-300">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold">
              🌟
            </div>
            <h3 className="text-xl font-bold text-white">
              ஒளியின் திருவிழா (Festival of Lights)
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              தீபாவளி என்பது இருள் நீங்கி ஒளி பிறக்கும் உன்னதமான திருநாள். தீய எண்ணங்கள் அகன்று, 
              நன்மை, ஞானம், மற்றும் தூய்மையான அன்பு மனித மனங்களில் ஒளிர வேண்டும் என்பதை இத்திருவிழா உணர்த்துகிறது.
            </p>
          </div>

          {/* Card 2: தீபாவளி சம்பிரதாயங்கள் */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-6 space-y-3 transition duration-300">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold">
              🌺
            </div>
            <h3 className="text-xl font-bold text-white">
              பண்டிகை மரபுகள் (Festive Traditions)
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              அதிகாலை எண்ணெய் தேய்த்துக் கங்கா ஸ்நானம் செய்தல், புத்தாடை அணிதல், இனிப்புகள் பரிமாறுதல், 
              மற்றும் மாலையில் வீடுகள் தோறும் அகல் விளக்குகள் ஏற்றி இறைவனை வணங்குவது தீபாவளியின் முக்கிய வழக்கங்கள்.
            </p>
          </div>

          {/* Card 3: இனிப்புகள் & பலகாரங்கள் */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-6 space-y-3 transition duration-300">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold">
              🍬
            </div>
            <h3 className="text-xl font-bold text-white">
              தீபாவளி இனிப்புகள் (Traditional Sweets)
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              லட்டு, ஜிலேபி, மைசூர்பாக், அதிரசம், முறுக்கு மற்றும் சுவையான தீபாவளி லேகியம் போன்ற பாரம்பரிய பலகாரங்கள் 
              உறவுகளுக்கும் நண்பர்களுக்கும் பகிர்ந்து அன்பை பரிமாறி மகிழ்கிறோம்.
            </p>
          </div>

          {/* Card 4: தீபாவளி ஆசிகள் */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-6 space-y-3 transition duration-300">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold">
              🕊️
            </div>
            <h3 className="text-xl font-bold text-white">
              நலம் மற்றும் வளம் (Health &amp; Prosperity)
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              இந்த தீபாவளி திருநாள் உங்கள் வாழ்வில் நீங்காத மகிழ்ச்சி, நல்ல ஆரோக்கியம், 
              தொழில் மற்றும் கல்வி வளர்ச்சி, மன அமைதி மற்றும் சகல சௌபாக்கியங்களையும் கொண்டுவரட்டும்!
            </p>
          </div>
        </section>

        {/* Motivational / Blessing Quote Card */}
        <section className="bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-6 text-center space-y-2">
          <p className="text-amber-300 font-semibold text-base sm:text-lg">
            "தீபங்களின் ஒளி உங்கள் இல்லத்தையும் உள்ளத்தையும் பிரகாசமாக்கட்டும்!"
          </p>
          <p className="text-xs text-slate-400">
            May the glow of the diyas illuminate your life with infinite joy, peace and good health.
          </p>
        </section>

        {/* Action Buttons */}
        <div className="text-center pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 text-slate-200 hover:text-white transition font-medium text-sm"
          >
            <span>🔄</span> மீண்டும் ஒரு பதிவை சேர்க்க (Add Another Registration)
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-slate-500 border-t border-slate-900 bg-slate-950/80">
        <p>Happy Diwali • தீபாவளி நல்வாழ்த்துகள் • Festival of Lights 🪔✨</p>
      </footer>
    </div>
  );
}
