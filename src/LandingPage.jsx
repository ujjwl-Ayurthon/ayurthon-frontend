import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Brain, Flame, TrendingUp, BookOpen, Award, Users,
  ChevronRight, Star, CheckCircle, Target, Zap,
  MessageCircle, Mail, X, HelpCircle,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// SUPPORT CONFIG — Change number/email here only
// ─────────────────────────────────────────────────────────────────────────────
var SUPPORT_WHATSAPP = "916394099898";
var SUPPORT_EMAIL    = "ujjawal9431@gmail.com";

// ─────────────────────────────────────────────────────────────────────────────
// STATS CONFIG — Edit values here OR connect to API
// ─────────────────────────────────────────────────────────────────────────────
var statsData = [
  { id: "students",  label: "Active Students",              value: "1,200+", icon: Users },
  { id: "tests",     label: "Tests Conducted",              value: "340+",   icon: BookOpen },
  { id: "questions", label: "Question Bank",                value: "10,000+",icon: Target },
  { id: "accuracy",  label: "Avg. Accuracy Improvement",    value: "38%",    icon: TrendingUp },
];

var featuresData = [
  {
    icon: Brain,
    title: "AI-Powered Analysis",
    desc: "Deep performance analytics identify your weak chapters — Charak, Dravyaguna, Rasashastra — and surface them first.",
  },
  {
    icon: Flame,
    title: "Daily Streaks",
    desc: "Consistent practice wins AIAPGET. Earn Saptaha Veer and Champion badges, tracked live on your dashboard.",
  },
  {
    icon: TrendingUp,
    title: "Predicted AIAPGET Score",
    desc: "Based on your last 5 test performances, get a calibrated score prediction modeled on AIAPGET's actual marking scheme.",
  },
];

var testimonialsData = [
  {
    name: "Dr. Priya S.",
    college: "GAC Pune",
    text: "Ayurthon ke daily tests ne mera revision completely structure kar diya. Result mein bada difference aaya.",
    stars: 5,
  },
  {
    name: "Dr. Rahul K.",
    college: "NIA Jaipur",
    text: "Sanskrit aur Hindi questions perfectly render hote hain. Pehli bar kisi platform par yeh dekha.",
    stars: 5,
  },
  {
    name: "Dr. Sneha M.",
    college: "IPGT&RA Jamnagar",
    text: "Progress page ne mujhe dikha diya ki Rachana Sharir main weak hoon. Target kar ke padha — score improve hua.",
    stars: 5,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELP & SUPPORT WIDGET
// ─────────────────────────────────────────────────────────────────────────────
function HelpWidget() {
  var open = useState(false);
  var isOpen = open[0];
  var setIsOpen = open[1];

  function openWhatsApp() {
    var msg = encodeURIComponent("Namaste! Ayurthon platform ke baare mein help chahiye.");
    window.open("https://wa.me/" + SUPPORT_WHATSAPP + "?text=" + msg, "_blank");
  }

  function openEmail() {
    window.open(
      "mailto:" + SUPPORT_EMAIL + "?subject=Ayurthon%20Support%20Request",
      "_blank"
    );
  }

  return (
    <div style={{ position: "fixed", bottom: "28px", right: "24px", zIndex: 999 }}>
      {/* Popup panel */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            bottom: "64px",
            right: "0",
            width: "260px",
            background: "rgba(255,255,255,0.90)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.70)",
            borderRadius: "18px",
            boxShadow: "0 20px 60px rgba(15,23,42,0.14), 0 1px 0 rgba(255,255,255,0.9) inset",
            padding: "20px",
            animation: "fadeUp 0.2s ease",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a", fontFamily: "Georgia, serif" }}>
                Need Help?
              </div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>We reply within 2 hours</div>
            </div>
            <button
              onClick={function() { setIsOpen(false); }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "2px", color: "#94a3b8" }}
            >
              <X size={16} />
            </button>
          </div>

          {/* WhatsApp */}
          <button
            onClick={openWhatsApp}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              width: "100%",
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid rgba(37,211,102,0.25)",
              background: "rgba(37,211,102,0.08)",
              cursor: "pointer",
              marginBottom: "10px",
              transition: "background 0.15s",
            }}
            onMouseEnter={function(e) { e.currentTarget.style.background = "rgba(37,211,102,0.15)"; }}
            onMouseLeave={function(e) { e.currentTarget.style.background = "rgba(37,211,102,0.08)"; }}
          >
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "#25D366", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <MessageCircle size={18} color="white" fill="white" />
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>WhatsApp</div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Chat with Dr. Ujjawal</div>
            </div>
          </button>

          {/* Email */}
          <button
            onClick={openEmail}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              width: "100%",
              padding: "12px 14px",
              borderRadius: "12px",
              border: "1px solid rgba(13,148,136,0.22)",
              background: "rgba(13,148,136,0.07)",
              cursor: "pointer",
              transition: "background 0.15s",
            }}
            onMouseEnter={function(e) { e.currentTarget.style.background = "rgba(13,148,136,0.14)"; }}
            onMouseLeave={function(e) { e.currentTarget.style.background = "rgba(13,148,136,0.07)"; }}
          >
            <div style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: "linear-gradient(135deg, #0D9488, #0f766e)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <Mail size={18} color="white" />
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>Email Support</div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>ujjawal9431@gmail.com</div>
            </div>
          </button>

          <div style={{ marginTop: "14px", textAlign: "center", fontSize: "11px", color: "#94a3b8" }}>
            Powered by Ayurthon ✦
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={function() { setIsOpen(!isOpen); }}
        style={{
          width: "52px",
          height: "52px",
          borderRadius: "50%",
          border: "none",
          background: isOpen
            ? "linear-gradient(135deg, #475569, #334155)"
            : "linear-gradient(135deg, #0D9488, #0f766e)",
          color: "white",
          cursor: "pointer",
          boxShadow: "0 8px 24px rgba(13,148,136,0.40)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "background 0.2s, transform 0.15s",
          transform: isOpen ? "scale(0.92)" : "scale(1)",
        }}
      >
        {isOpen ? <X size={20} /> : <HelpCircle size={22} />}
      </button>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RADAR CHART SVG
// ─────────────────────────────────────────────────────────────────────────────
function RadarChartTeaser() {
  var cx = 160, cy = 160, r = 110;
  var subjects = ["Charak","Sushrut","Dravyaguna","Rasashastra","Kriya Sharir","Swasthavritta"];
  var scores   = [0.82, 0.65, 0.78, 0.55, 0.90, 0.70];
  var n = subjects.length;

  function getPoint(index, ratio) {
    var angle = (Math.PI * 2 * index) / n - Math.PI / 2;
    return { x: cx + r * ratio * Math.cos(angle), y: cy + r * ratio * Math.sin(angle) };
  }

  var dataPath = scores.map(function(s, i) {
    var p = getPoint(i, s);
    return (i === 0 ? "M" : "L") + p.x.toFixed(2) + "," + p.y.toFixed(2);
  }).join(" ") + " Z";

  var minScore = Math.min.apply(null, scores);

  return (
    <svg viewBox="0 0 320 320" style={{ width: "100%", maxWidth: "260px", margin: "0 auto", display: "block" }}>
      {[0.25,0.5,0.75,1.0].map(function(level, li) {
        var pts = subjects.map(function(_, i) {
          var p = getPoint(i, level);
          return p.x.toFixed(2) + "," + p.y.toFixed(2);
        }).join(" ");
        return <polygon key={li} points={pts} fill="none" stroke="#0D9488" strokeOpacity={0.15} strokeWidth="1" />;
      })}
      {subjects.map(function(_, i) {
        var outer = getPoint(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={outer.x.toFixed(2)} y2={outer.y.toFixed(2)} stroke="#0D9488" strokeOpacity={0.2} strokeWidth="1" />;
      })}
      <path d={dataPath} fill="#0D9488" fillOpacity={0.18} stroke="#0D9488" strokeWidth="2.5" />
      {scores.map(function(s, i) {
        var p = getPoint(i, s);
        if (s === minScore) return <circle key={"w"+i} cx={p.x} cy={p.y} r="7" fill="#D4AF37" stroke="white" strokeWidth="2" />;
        return <circle key={i} cx={p.x} cy={p.y} r="5" fill="#0D9488" />;
      })}
      {subjects.map(function(sub, i) {
        var p = getPoint(i, 1.22);
        return <text key={i} x={p.x.toFixed(2)} y={p.y.toFixed(2)} textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#475569" fontFamily="sans-serif">{sub}</text>;
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GLASS CARD
// ─────────────────────────────────────────────────────────────────────────────
function GlassCard(props) {
  return (
    <div style={Object.assign({
      background: "rgba(255,255,255,0.68)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      border: "1px solid rgba(255,255,255,0.60)",
      borderRadius: "20px",
      boxShadow: "0 8px 32px rgba(15,23,42,0.07), 0 1px 0 rgba(255,255,255,0.85) inset",
      padding: "32px",
    }, props.style || {})}>
      {props.children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NAVBAR
// ─────────────────────────────────────────────────────────────────────────────
function Navbar() {
  var navigate = useNavigate();
  return (
    <nav style={{
      position: "fixed", top: "16px", left: "50%", transform: "translateX(-50%)",
      width: "calc(100% - 32px)", maxWidth: "1100px", zIndex: 100,
      background: "rgba(255,255,255,0.70)", backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.55)",
      borderRadius: "16px", boxShadow: "0 8px 32px rgba(13,148,136,0.08)",
      padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "linear-gradient(135deg, #0D9488, #0f766e)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BookOpen size={18} color="white" />
        </div>
        <div>
          <div style={{ fontFamily: "Georgia, serif", fontWeight: "700", fontSize: "17px", color: "#0f172a" }}>AYURTHON</div>
          <div style={{ fontSize: "10px", color: "#64748b", letterSpacing: "0.8px", textTransform: "uppercase" }}>by Dr. Ujjawal Pratap Singh</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: "10px" }}>
        <button onClick={function() { navigate("/student/login"); }} style={{ padding: "8px 18px", borderRadius: "10px", border: "1.5px solid #0D9488", background: "transparent", color: "#0D9488", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>Login</button>
        <button onClick={function() { navigate("/student/login"); }} style={{ padding: "8px 18px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #0D9488, #0f766e)", color: "white", fontSize: "13px", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 14px rgba(13,148,136,0.3)" }}>Register Free</button>
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO MOCK CARD
// ─────────────────────────────────────────────────────────────────────────────
function HeroMockCard() {
  var bars = [
    { subject: "Charak",      pct: 82, color: "#0D9488" },
    { subject: "Sushrut",     pct: 65, color: "#D4AF37" },
    { subject: "Dravyaguna",  pct: 78, color: "#0D9488" },
    { subject: "Rasashastra", pct: 55, color: "#e11d48" },
  ];
  return (
    <div style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.65)", borderRadius: "20px", boxShadow: "0 24px 64px rgba(13,148,136,0.13)", padding: "28px", minWidth: "280px", maxWidth: "340px", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.8px" }}>Your Score</div>
          <div style={{ fontSize: "32px", fontWeight: "800", color: "#0f172a", fontFamily: "Georgia, serif" }}>287 / 320</div>
        </div>
        <div style={{ background: "linear-gradient(135deg, #0D9488, #0f766e)", color: "white", borderRadius: "10px", padding: "8px 14px", fontSize: "13px", fontWeight: "700" }}>Rank #3</div>
      </div>
      {bars.map(function(bar) {
        return (
          <div key={bar.subject} style={{ marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontSize: "12px", color: "#475569", fontWeight: "500" }}>{bar.subject}</span>
              <span style={{ fontSize: "12px", color: bar.color, fontWeight: "700" }}>{bar.pct}%</span>
            </div>
            <div style={{ background: "#e2e8f0", borderRadius: "99px", height: "6px" }}>
              <div style={{ width: bar.pct + "%", height: "100%", borderRadius: "99px", background: bar.color }} />
            </div>
          </div>
        );
      })}
      <div style={{ marginTop: "18px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {["🔥 7-Day Streak","🏆 Champion","📚 Saptaha Veer"].map(function(badge) {
          return <span key={badge} style={{ background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.35)", color: "#92700a", borderRadius: "99px", padding: "4px 10px", fontSize: "11px", fontWeight: "600" }}>{badge}</span>;
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LANDING PAGE
// ─────────────────────────────────────────────────────────────────────────────
function LandingPage() {
  var navigate = useNavigate();

  var wrap = { maxWidth: "1100px", margin: "0 auto", padding: "0 20px" };

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(145deg, #F1F5F9 0%, #e8f4f1 40%, #F1F5F9 100%)", fontFamily: "'Inter','Segoe UI',system-ui,sans-serif", color: "#0f172a", overflowX: "hidden" }}>
      <Navbar />

      {/* HERO */}
      <section style={{ paddingTop: "140px", paddingBottom: "80px", position: "relative" }}>
        <div style={{ position: "absolute", top: "60px", left: "-80px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(13,148,136,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: "120px", right: "-60px", width: "320px", height: "320px", borderRadius: "50%", background: "radial-gradient(circle, rgba(212,175,55,0.10) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={Object.assign({}, wrap, { display: "flex", flexWrap: "wrap", alignItems: "center", gap: "48px", justifyContent: "space-between" })}>
          <div style={{ flex: "1 1 400px", maxWidth: "520px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(13,148,136,0.10)", border: "1px solid rgba(13,148,136,0.22)", borderRadius: "99px", padding: "6px 14px", marginBottom: "24px" }}>
              <Zap size={13} color="#0D9488" />
              <span style={{ fontSize: "12px", color: "#0D9488", fontWeight: "600" }}>India's First Devanagari-Native CBT for AIAPGET</span>
            </div>
            <h1 style={{ fontFamily: "Georgia,'Times New Roman',serif", fontSize: "clamp(34px,5vw,58px)", fontWeight: "700", lineHeight: "1.12", color: "#0f172a", margin: "0 0 20px", letterSpacing: "-1px" }}>
              Ancient Wisdom,<br />
              <span style={{ background: "linear-gradient(135deg, #0D9488 0%, #D4AF37 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>Modern Excellence.</span>
            </h1>
            <p style={{ fontSize: "17px", color: "#475569", lineHeight: "1.7", margin: "0 0 32px", maxWidth: "440px" }}>Doctor-curated CBT platform for AIAPGET — daily tests, deep analytics, Sanskrit MCQs that render perfectly, and a leaderboard that keeps you honest.</p>
            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap", alignItems: "center" }}>
              <button onClick={function() { navigate("/student/login"); }} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "14px 28px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #0D9488, #0f766e)", color: "white", fontSize: "15px", fontWeight: "700", cursor: "pointer", boxShadow: "0 8px 24px rgba(13,148,136,0.35)" }}>
                Start Practicing Free <ChevronRight size={16} />
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                {[1,2,3,4,5].map(function(s) { return <Star key={s} size={14} fill="#D4AF37" color="#D4AF37" />; })}
                <span style={{ fontSize: "13px", color: "#64748b", marginLeft: "4px" }}>Trusted by BAMS students</span>
              </div>
            </div>
          </div>
          <div style={{ flex: "0 0 auto" }}><HeroMockCard /></div>
        </div>
      </section>

      {/* STATS */}
      <section style={{ padding: "16px 0 72px" }}>
        <div style={wrap}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "16px" }}>
            {statsData.map(function(stat) {
              var Icon = stat.icon;
              return (
                <GlassCard key={stat.id} style={{ padding: "24px 28px", textAlign: "center" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: "rgba(13,148,136,0.10)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                    <Icon size={20} color="#0D9488" />
                  </div>
                  <div style={{ fontFamily: "Georgia,serif", fontSize: "30px", fontWeight: "700", color: "#0f172a", lineHeight: "1", marginBottom: "6px" }}>{stat.value}</div>
                  <div style={{ fontSize: "13px", color: "#64748b", fontWeight: "500" }}>{stat.label}</div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: "16px 0 80px" }}>
        <div style={wrap}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <div style={{ display: "inline-block", background: "rgba(212,175,55,0.12)", border: "1px solid rgba(212,175,55,0.30)", borderRadius: "99px", padding: "6px 16px", fontSize: "12px", color: "#92700a", fontWeight: "600", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "16px" }}>Platform Features</div>
            <h2 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(26px,4vw,40px)", fontWeight: "700", color: "#0f172a", margin: "0", letterSpacing: "-0.5px" }}>Built for the AIAPGET Marathon</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "20px" }}>
            {featuresData.map(function(feat) {
              var Icon = feat.icon;
              return (
                <GlassCard key={feat.title}>
                  <div style={{ width: "52px", height: "52px", borderRadius: "14px", background: "linear-gradient(135deg,rgba(13,148,136,0.15),rgba(13,148,136,0.05))", border: "1px solid rgba(13,148,136,0.18)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "20px" }}>
                    <Icon size={24} color="#0D9488" />
                  </div>
                  <h3 style={{ fontFamily: "Georgia,serif", fontSize: "19px", fontWeight: "700", color: "#0f172a", margin: "0 0 10px" }}>{feat.title}</h3>
                  <p style={{ fontSize: "14px", color: "#475569", lineHeight: "1.65", margin: "0" }}>{feat.desc}</p>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* RADAR PREVIEW */}
      <section style={{ padding: "16px 0 80px" }}>
        <div style={wrap}>
          <GlassCard style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "48px", padding: "48px" }}>
            <div style={{ flex: "0 0 300px" }}>
              <RadarChartTeaser />
              <div style={{ textAlign: "center", marginTop: "8px" }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#64748b" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#D4AF37", display: "inline-block" }} />
                  Gold dot = your weakest subject
                </span>
              </div>
            </div>
            <div style={{ flex: "1 1 280px" }}>
              <div style={{ display: "inline-block", background: "rgba(13,148,136,0.10)", border: "1px solid rgba(13,148,136,0.22)", borderRadius: "99px", padding: "5px 14px", fontSize: "11px", color: "#0D9488", fontWeight: "600", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "18px" }}>Weakness Radar</div>
              <h2 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(24px,3.5vw,36px)", fontWeight: "700", color: "#0f172a", margin: "0 0 16px", letterSpacing: "-0.4px", lineHeight: "1.2" }}>Know Exactly Where to Focus</h2>
              <p style={{ fontSize: "15px", color: "#475569", lineHeight: "1.7", margin: "0 0 24px" }}>Our Weakness Radar maps your accuracy across all major AIAPGET subjects. Ek nazar mein pata chal jaata hai — kahan mehnat aur lagani hai.</p>
              {["Subject-wise accuracy breakdown","Weak chapter identification","Personalized 'Inhe Focus Karo' list"].map(function(item) {
                return (
                  <div key={item} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    <CheckCircle size={16} color="#0D9488" />
                    <span style={{ fontSize: "14px", color: "#334155", fontWeight: "500" }}>{item}</span>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: "16px 0 80px" }}>
        <div style={wrap}>
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 style={{ fontFamily: "Georgia,serif", fontSize: "clamp(24px,3.5vw,38px)", fontWeight: "700", color: "#0f172a", margin: "0", letterSpacing: "-0.4px" }}>Doctors Who Chose Ayurthon</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "20px" }}>
            {testimonialsData.map(function(t) {
              return (
                <GlassCard key={t.name} style={{ padding: "28px" }}>
                  <div style={{ display: "flex", gap: "2px", marginBottom: "16px" }}>
                    {Array.from({ length: t.stars }).map(function(_, i) { return <Star key={i} size={14} fill="#D4AF37" color="#D4AF37" />; })}
                  </div>
                  <p style={{ fontSize: "14px", color: "#334155", lineHeight: "1.65", margin: "0 0 20px", fontStyle: "italic" }}>"{t.text}"</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "linear-gradient(135deg, #0D9488, #D4AF37)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "700", fontSize: "14px" }}>{t.name.charAt(3)}</div>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a" }}>{t.name}</div>
                      <div style={{ fontSize: "11px", color: "#64748b" }}>{t.college}</div>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "16px 0 100px" }}>
        <div style={wrap}>
          <div style={{ background: "linear-gradient(135deg,rgba(13,148,136,0.12),rgba(212,175,55,0.08))", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(13,148,136,0.18)", borderRadius: "28px", boxShadow: "0 32px 80px rgba(13,148,136,0.12)", padding: "clamp(40px,6vw,72px)", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "280px", height: "280px", borderRadius: "50%", background: "radial-gradient(circle,rgba(13,148,136,0.10) 0%,transparent 70%)", pointerEvents: "none" }} />
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.30)", borderRadius: "99px", padding: "6px 16px", marginBottom: "24px" }}>
              <Award size={13} color="#92700a" />
              <span style={{ fontSize: "12px", color: "#92700a", fontWeight: "600" }}>AIAPGET 2025 — Preparation Starts Today</span>
            </div>
            <h2 style={{ fontFamily: "Georgia,'Times New Roman',serif", fontSize: "clamp(28px,5vw,50px)", fontWeight: "700", color: "#0f172a", margin: "0 0 16px", letterSpacing: "-0.8px", lineHeight: "1.12" }}>Start Your Marathon Today</h2>
            <p style={{ fontSize: "16px", color: "#475569", maxWidth: "480px", margin: "0 auto 36px", lineHeight: "1.65" }}>Join thousands of BAMS students already preparing with doctor-curated MCQs, live rankings, and intelligent feedback.</p>
            <button onClick={function() { navigate("/student/login"); }} style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "16px 36px", borderRadius: "14px", border: "none", background: "linear-gradient(135deg, #D4AF37, #b8941f)", color: "#0f172a", fontSize: "16px", fontWeight: "800", cursor: "pointer", boxShadow: "0 12px 32px rgba(212,175,55,0.40)" }}>
              <Zap size={18} /> Register for Free <ChevronRight size={18} />
            </button>
            <div style={{ marginTop: "20px", fontSize: "13px", color: "#94a3b8" }}>No credit card required · Instant access · AIAPGET scoring (+4/−1)</div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(13,148,136,0.12)", padding: "28px 20px", textAlign: "center" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <BookOpen size={16} color="#0D9488" />
            <span style={{ fontFamily: "Georgia,serif", fontWeight: "700", color: "#0f172a", fontSize: "15px" }}>AYURTHON</span>
          </div>
          <p style={{ fontSize: "13px", color: "#94a3b8", margin: "0 0 6px" }}>Curated by Dr. Ujjawal Pratap Singh — BAMS (IMS BHU) · MD (GACH Patna)</p>
          <p style={{ fontSize: "12px", color: "#cbd5e1", margin: "0" }}>Telegram: @Ayurthon · Instagram: @ayurthon · © 2025 Ayurthon. All rights reserved.</p>
        </div>
      </footer>

      {/* FLOATING HELP WIDGET */}
      <HelpWidget />
    </div>
  );
}

export default LandingPage;
