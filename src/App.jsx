import { useState, useEffect } from "react";

const ADMIN_PASSWORD = "boss2024";
const AVG_KWH = 8000;

const INITIAL_REPS = [
  { id: "you", name: "Preston", type: "owner" },
  { id: "cam", name: "Cam", type: "partner" },
  { id: "junior", name: "Junior", type: "rep" },
  { id: "owen", name: "Owen", type: "rep" },
  { id: "deandre", name: "Deandre", type: "rep" },
  { id: "deshaun", name: "Deshaun", type: "rep" },
  { id: "nigel", name: "Nigel", type: "rep" },
  { id: "josh", name: "Josh", type: "rep" },
  { id: "isaiah", name: "Isaiah", type: "rep" },
];

function fmt(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(2) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toLocaleString();
}

function getRankDisplay(i) {
  if (i === 0) return "🥇";
  if (i === 1) return "🥈";
  if (i === 2) return "🥉";
  return `#${i + 1}`;
}

export default function App() {
  const [deals, setDeals] = useState({});
  const [usage, setUsage] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [draftDeals, setDraftDeals] = useState({});
  const [draftUsage, setDraftUsage] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const result = JSON.parse(localStorage.getItem("ascend-leaderboard-v1") || "null");
      if (result) {
        setDeals(result.deals || {});
        setUsage(result.usage || {});
        setLastUpdated(result.updatedAt || null);
        setDraftDeals(result.deals || {});
        setDraftUsage(result.usage || {});
      } else {
        const empty = {};
        INITIAL_REPS.forEach(r => (empty[r.id] = 0));
        setDeals(empty);
        setDraftDeals(empty);
      }
    } catch {
      const empty = {};
      INITIAL_REPS.forEach(r => (empty[r.id] = 0));
      setDeals(empty);
      setDraftDeals(empty);
    }
    setLoading(false);
  }, []);

  function saveDeals() {
    setSaving(true);
    const now = new Date().toISOString();
    try {
      localStorage.setItem("ascend-leaderboard-v1", JSON.stringify({ deals: draftDeals, usage: draftUsage, updatedAt: now }));
      setDeals({ ...draftDeals });
      setUsage({ ...draftUsage });
      setLastUpdated(now);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      console.error(e);
    }
    setSaving(false);
  }

  function login() {
    if (pw === ADMIN_PASSWORD) {
      setIsAdmin(true);
      setShowLogin(false);
      setPw("");
      setPwError(false);
    } else {
      setPwError(true);
    }
  }

  const sorted = [...INITIAL_REPS].sort((a, b) => (deals[b.id] || 0) - (deals[a.id] || 0));
  const totalDeals = INITIAL_REPS.reduce((s, r) => s + (deals[r.id] || 0), 0);
  const totalKwh = INITIAL_REPS.reduce((s, r) => {
    const u = usage[r.id];
    return s + (u != null ? u : (deals[r.id] || 0) * AVG_KWH);
  }, 0);

  const lastUpdatedStr = lastUpdated
    ? new Date(lastUpdated).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
    : null;

  const gold = "#c9a84c";
  const goldLight = "#e8c96d";
  const darkBg = "#0c0c0c";
  const cardBg = "#111111";
  const border = "#1e1a12";
  return (
    <div style={{ minHeight: "100vh", background: darkBg, color: "#f0ead6", fontFamily: "'Georgia', serif", paddingBottom: 80 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Inter:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        input:focus { outline: none; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        @keyframes pop { 0% { transform:scale(1); } 50% { transform:scale(1.04); } 100% { transform:scale(1); } }
        .rep-row { animation: fadeUp 0.5s ease both; }
        .live-dot { animation: shimmer 2s infinite; }
        .gold-text { background: linear-gradient(135deg, #c9a84c, #f0d070, #c9a84c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .save-pop { animation: pop 0.3s ease; }
        input[type='number']::-webkit-outer-spin-button, input[type='number']::-webkit-inner-spin-button { -webkit-appearance: none; }
        input[type='number'] { -moz-appearance: textfield; }
      `}</style>

      <div style={{ background: "linear-gradient(180deg, #0a0800 0%, #111008 100%)", borderBottom: `1px solid ${border}`, padding: "20px 20px 16px", position: "sticky", top: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div className="gold-text" style={{ fontFamily: "'Cinzel', serif", fontSize: 26, fontWeight: 700, letterSpacing: 4 }}>ASCEND</div>
          <div style={{ fontSize: 9, letterSpacing: 3, color: "#6b5a2a", textTransform: "uppercase", marginTop: 3 }}>Energy · Weekly Leaderboard</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {lastUpdatedStr && <div style={{ fontSize: 10, color: "#4a3f1e" }}><span className="live-dot" style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: gold, marginRight: 5 }}></span>{lastUpdatedStr}</div>}
          {isAdmin ? (
            <button onClick={() => setIsAdmin(false)} style={{ background: "transparent", border: `1px solid #333`, color: "#555", borderRadius: 4, padding: "6px 12px", cursor: "pointer", fontSize: 11 }}>Exit</button>
          ) : (
            <button onClick={() => setShowLogin(true)} style={{ background: `linear-gradient(135deg, #8a6a1a, ${gold})`, color: "#000", border: "none", borderRadius: 4, padding: "7px 14px", cursor: "pointer", fontSize: 11, fontWeight: 600 }}>ADMIN</button>
          )}
        </div>
      </div>

      {showLogin && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200 }}>
          <div style={{ background: "#0f0d07", border: `1px solid ${border}`, borderTop: `2px solid ${gold}`, borderRadius: 8, padding: 32, width: 300, textAlign: "center" }}>
            <div className="gold-text" style={{ fontFamily: "'Cinzel', serif", fontSize: 20, fontWeight: 600, marginBottom: 4 }}>Admin Access</div>
            <div style={{ fontSize: 11, color: "#4a3f1e", marginBottom: 20 }}>Authorized personnel only</div>
            <input type="password" value={pw} onChange={e => { setPw(e.target.value); setPwError(false); }} onKeyDown={e => e.key === "Enter" && login()} placeholder="Password" style={{ width: "100%", background: "#1a1508", border: `1px solid ${pwError ? "#ef4444" : border}`, borderRadius: 4, color: "#f0ead6", padding: "10px 14px", fontSize: 14, marginBottom: 8 }} />
            {pwError && <div style={{ color: "#ef4444", fontSize: 11, marginBottom: 8 }}>Incorrect password</div>}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button onClick={() => { setShowLogin(false); setPw(""); setPwError(false); }} style={{ flex: 1, background: "transparent", border: `1px solid #333`, color: "#666", borderRadius: 4, padding: 9, cursor: "pointer", fontSize: 12 }}>Cancel</button>
              <button onClick={login} style={{ flex: 1, background: `linear-gradient(135deg, #8a6a1a, ${gold})`, color: "#000", border: "none", borderRadius: 4, padding: 9, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Enter</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 580, margin: "0 auto", padding: "24px 16px" }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "#4a3f1e", fontSize: 12, padding: 60 }}>Loading...</div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
              {[{ label: "Total Deals", value: totalDeals }, { label: "Total kWh", value: fmt(totalKwh) }].map(c => (
                <div key={c.label} style={{ background: cardBg, border: `1px solid ${border}`, borderTop: `2px solid ${gold}`, borderRadius: 6, padding: "14px 10px", textAlign: "center" }}>
                  <div style={{ fontSize: 9, letterSpacing: 2, color: "#6b5a2a", textTransform: "uppercase", marginBottom: 6 }}>{c.label}</div>
                  <div className="gold-text" style={{ fontFamily: "'Cinzel', serif", fontSize: 22, fontWeight: 700 }}>{c.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: border }}></div>
              <div style={{ fontSize: 10, fontFamily: "'Cinzel', serif", letterSpacing: 3, color: "#6b5a2a" }}>LEADERBOARD</div>
              <div style={{ flex: 1, height: 1, background: border }}></div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {sorted.map((rep, i) => {
                const d = deals[rep.id] || 0;
                const isTop = i === 0 && d > 0;
                const draft = draftDeals[rep.id] || 0;
                return (
                  <div key={rep.id} className="rep-row" style={{ animationDelay: `${i * 0.06}s`, background: isTop ? "linear-gradient(135deg, #120e04, #1a1508)" : cardBg, border: `1px solid ${isTop ? "#3a2e10" : border}`, borderLeft: `3px solid ${isTop ? gold : "#1e1a12"}`, borderRadius: 6, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ fontFamily: "'Cinzel', serif", fontSize: i < 3 ? 20 : 16, color: i === 0 ? gold : "#3a2e10", width: 32, textAlign: "center", flexShrink: 0 }}>{getRankDisplay(i)}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Cinzel', serif", fontWeight: 600, fontSize: 14, color: isTop ? goldLight : "#d4c9a8", letterSpacing: 1 }}>{rep.name}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      {isAdmin ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 9, color: "#4a3f1e" }}>deals</span>
                            <input type="number" min="0" max="99" value={draft} onChange={e => setDraftDeals(prev => ({ ...prev, [rep.id]: Math.max(0, parseInt(e.target.value) || 0) }))} style={{ background: "#1a1508", border: `1px solid ${gold}44`, borderRadius: 4, color: goldLight, fontFamily: "'Cinzel', serif", fontSize: 16, padding: "3px 6px", width: 54, textAlign: "center" }} />
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 9, color: "#4a3f1e" }}>kWh</span>
                            <input type="number" min="0" value={draftUsage[rep.id] != null ? draftUsage[rep.id] : ""} placeholder={String((draft || 0) * AVG_KWH)} onChange={e => { const v = e.target.value === "" ? null : Math.max(0, parseInt(e.target.value) || 0); setDraftUsage(prev => ({ ...prev, [rep.id]: v })); }} style={{ background: "#1a1508", border: `1px solid #2a2010`, borderRadius: 4, color: "#a89060", fontFamily: "'Cinzel', serif", fontSize: 13, padding: "3px 6px", width: 72, textAlign: "center" }} />
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 24, color: d > 0 ? goldLight : "#2a2010" }}>{d}</div>
                            <div style={{ fontSize: 9, color: "#4a3f1e", letterSpacing: 1 }}>deals</div>
                          </div>
                          <div style={{ width: 1, height: 28, background: border }}></div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontFamily: "'Cinzel', serif", fontSize: 16, color: "#a89060" }}>{fmt(usage[rep.id] != null ? usage[rep.id] : d * AVG_KWH)}</div>
                            <div style={{ fontSize: 9, color: "#4a3f1e", letterSpacing: 1 }}>kWh</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {isAdmin && (
              <div style={{ marginTop: 20 }}>
                <button onClick={saveDeals} disabled={saving} className={saved ? "save-pop" : ""} style={{ width: "100%", background: saved ? "linear-gradient(135deg, #2a5a2a, #4a8a4a)" : `linear-gradient(135deg, #8a6a1a, ${gold})`, color: "#000", border: "none", borderRadius: 6, padding: "14px 40px", fontSize: 13, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "'Cinzel', serif", letterSpacing: 2 }}>
                  {saving ? "SAVING..." : saved ? "✓ SAVED" : "SAVE & PUSH LIVE"}
                </button>
              </div>
            )}

            <div style={{ marginTop: 40, textAlign: "center" }}>
              <div style={{ fontSize: 9, color: "#2a2010", letterSpacing: 3, textTransform: "uppercase" }}>Ascend Energy · Weekly Rankings</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
