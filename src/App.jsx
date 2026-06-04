import { useState, useEffect } from "react";

const ADMIN_PASSWORD = "boss2024";
const AVG_KWH = 8000;

const DEFAULT_REPS = [
  { id: "preston", name: "Preston" },
  { id: "cam", name: "Cam" },
  { id: "junior", name: "Junior" },
  { id: "owen", name: "Owen" },
  { id: "deandre", name: "Deandre" },
  { id: "deshaun", name: "Deshaun" },
  { id: "nigel", name: "Nigel" },
  { id: "josh", name: "Josh" },
  { id: "isaiah", name: "Isaiah" },
  { id: "drako", name: "Drako" },
  { id: "luca", name: "Luca" },
  { id: "malachi", name: "Malachi" },
  { id: "daniel", name: "Daniel" },
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

function loadData(key, fallback) {
  try {
    const d = JSON.parse(localStorage.getItem(key) || "null");
    return d || fallback;
  } catch { return fallback; }
}

function saveData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export default function App() {
  const [tab, setTab] = useState("weekly");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [newRepName, setNewRepName] = useState("");

  const [wReps, setWReps] = useState(() => loadData("w-reps", DEFAULT_REPS));
  const [wDeals, setWDeals] = useState(() => loadData("w-deals", {}));
  const [wUsage, setWUsage] = useState(() => loadData("w-usage", {}));
  const [wDraftDeals, setWDraftDeals] = useState({});
  const [wDraftUsage, setWDraftUsage] = useState({});

  const [yReps, setYReps] = useState(() => loadData("y-reps", DEFAULT_REPS));
  const [yDeals, setYDeals] = useState(() => loadData("y-deals", {}));
  const [yUsage, setYUsage] = useState(() => loadData("y-usage", {}));
  const [yDraftDeals, setYDraftDeals] = useState({});
  const [yDraftUsage, setYDraftUsage] = useState({});

  useEffect(() => {
    setWDraftDeals({ ...wDeals });
    setWDraftUsage({ ...wUsage });
  }, []);

  useEffect(() => {
    setYDraftDeals({ ...yDeals });
    setYDraftUsage({ ...yUsage });
  }, []);

  function login() {
    if (pw === ADMIN_PASSWORD) {
      setIsAdmin(true); setShowLogin(false); setPw(""); setPwError(false);
    } else { setPwError(true); }
  }

  function saveWeekly() {
    saveData("w-deals", wDraftDeals);
    saveData("w-usage", wDraftUsage);
    saveData("w-reps", wReps);
    setWDeals({ ...wDraftDeals });
    setWUsage({ ...wDraftUsage });
    flashSaved();
  }

  function saveYTD() {
    saveData("y-deals", yDraftDeals);
    saveData("y-usage", yDraftUsage);
    saveData("y-reps", yReps);
    setYDeals({ ...yDraftDeals });
    setYUsage({ ...yDraftUsage });
    flashSaved();
  }

  function flashSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  function pushToYTD() {
    const newYDeals = { ...yDeals };
    const newYUsage = { ...yUsage };
    wReps.forEach(rep => {
      newYDeals[rep.id] = (newYDeals[rep.id] || 0) + (wDeals[rep.id] || 0);
      const wKwh = wUsage[rep.id] != null ? wUsage[rep.id] : (wDeals[rep.id] || 0) * AVG_KWH;
      newYUsage[rep.id] = (newYUsage[rep.id] || 0) + wKwh;
    });
    const emptyDeals = {};
    const emptyUsage = {};
    wReps.forEach(r => { emptyDeals[r.id] = 0; emptyUsage[r.id] = 0; });
   saveData("w-deals", emptyDeals);
   saveData("w-usage", emptyUsage);
   saveData("y-deals", newYDeals);
   saveData("y-usage", newYUsage);
   setWDeals(emptyDeals);
   setWUsage(emptyUsage);
   setWDraftDeals(emptyDeals);
   setWDraftUsage(emptyUsage);
   setYDeals(newYDeals);
   setYUsage(newYUsage);
   setYDraftDeals(newYDeals);
   setYDraftUsage(newYUsage);
   setShowReset(false);
   flashSaved();
 }

 function addRep(isYTD) {
   const name = newRepName.trim();
   if (!name) return;
   const id = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
   const newRep = { id, name };
   if (isYTD) {
     const updated = [...yReps, newRep];
     setYReps(updated);
     saveData("y-reps", updated);
   } else {
     const updated = [...wReps, newRep];
     setWReps(updated);
     saveData("w-reps", updated);
   }
   setNewRepName("");
 }

 function removeRep(id, isYTD) {
   if (isYTD) {
     const updated = yReps.filter(r => r.id !== id);
     setYReps(updated);
     saveData("y-reps", updated);
   } else {
     const updated = wReps.filter(r => r.id !== id);
     setWReps(updated);
     saveData("w-reps", updated);
   }
 }

 const gold = "#c9a84c";
 const goldLight = "#e8c96d";
 const darkBg = "#0c0c0c";
 const cardBg = "#111111";
 const border = "#1e1a12";

 const isYTD = tab === "ytd";
 const reps = isYTD ? yReps : wReps;
 const deals = isYTD ? yDeals : wDeals;
 const usage = isYTD ? yUsage : wUsage;
 const draftDeals = isYTD ? yDraftDeals : wDraftDeals;
 const draftUsage = isYTD ? yDraftUsage : wDraftUsage;
 const setDraftDeals = isYTD ? setYDraftDeals : setWDraftDeals;
 const setDraftUsage = isYTD ? setYDraftUsage : setWDraftUsage;

 const sorted = [...reps].sort((a, b) => (deals[b.id] || 0) - (deals[a.id] || 0));
 const totalDeals = reps.reduce((s, r) => s + (deals[r.id] || 0), 0);
 const totalKwh = reps.reduce((s, r) => {
   const u = usage[r.id];
   return s + (u != null ? u : (deals[r.id] || 0) * AVG_KWH);
 }, 0);

 return (
   <div style={{ minHeight:"100vh", background:darkBg, color:"#f0ead6", paddingBottom:100 }}>
     <style>{`
       @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Inter:wght@300;400;500&display=swap');
       * { box-sizing: border-box; }
       input:focus { outline: none; }
       @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
       @keyframes shimmer{0%,100%{opacity:1;}50%{opacity:0.5;}}
       @keyframes pop{0%{transform:scale(1);}50%{transform:scale(1.04);}100%{transform:scale(1);}}
       .rep-row{animation:fadeUp 0.5s ease both;}
       .gold-text{background:linear-gradient(135deg,#c9a84c,#f0d070,#c9a84c);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
       .save-pop{animation:pop 0.3s ease;}
       input[type='number']::-webkit-outer-spin-button,input[type='number']::-webkit-inner-spin-button{-webkit-appearance:none;}
       input[type='number']{-moz-appearance:textfield;}
     `}</style>

     <div style={{ background:"linear-gradient(180deg,#0a0800,#111008)", borderBottom:`1px solid ${border}`, padding:"16px 20px 0", position:"sticky", top:0, zIndex:100 }}>
       <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
         <div>
           <div className="gold-text" style={{ fontFamily:"'Cinzel',serif", fontSize:24, fontWeight:700, letterSpacing:4 }}>ASCEND</div>
           <div style={{ fontSize:9, letterSpacing:3, color:"#6b5a2a", textTransform:"uppercase" }}>Energy</div>
         </div>
         <div>
           {isAdmin ? <button onClick={()=>setIsAdmin(false)} style={{ background:"transparent", border:`1px solid #333`, color:"#555", borderRadius:4, padding:"6px 12px", cursor:"pointer", fontSize:11 }}>Exit</button> : <button onClick={()=>setShowLogin(true)} style={{ background:`linear-gradient(135deg,#8a6a1a,${gold})`, color:"#000", border:"none", borderRadius:4, padding:"7px 14px", cursor:"pointer", fontSize:11, fontWeight:600 }}>ADMIN</button>}
         </div>
       </div>
       <div style={{ display:"flex" }}>
         {["weekly","ytd"].map(t=>(
           <button key={t} onClick={()=>setTab(t)} style={{ flex:1, background:"transparent", border:"none", borderBottom:`2px solid ${tab===t?gold:"transparent"}`, color:tab===t?gold:"#4a3f1e", padding:"10px 0", cursor:"pointer", fontSize:11, fontFamily:"'Cinzel',serif", letterSpacing:2, textTransform:"uppercase" }}>
             {t==="weekly"?"Weekly":"Year to Date"}
           </button>
         ))}
       </div>
     </div>



         {showLogin && (
       <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}>
         <div style={{ background:"#0f0d07", border:`1px solid ${border}`, borderTop:`2px solid ${gold}`, borderRadius:8, padding:32, width:300, textAlign:"center" }}>
           <div className="gold-text" style={{ fontFamily:"'Cinzel',serif", fontSize:20, fontWeight:600, marginBottom:4 }}>Admin Access</div>
           <div style={{ fontSize:11, color:"#4a3f1e", marginBottom:20 }}>Authorized personnel only</div>
           <input type="password" value={pw} onChange={e=>{setPw(e.target.value);setPwError(false);}} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="Password" style={{ width:"100%", background:"#1a1508", border:`1px solid ${pwError?"#ef4444":border}`, borderRadius:4, color:"#f0ead6", padding:"10px 14px", fontSize:14, marginBottom:8 }} />
           {pwError && <div style={{ color:"#ef4444", fontSize:11, marginBottom:8 }}>Incorrect password</div>}
           <div style={{ display:"flex", gap:8, marginTop:8 }}>
             <button onClick={()=>{setShowLogin(false);setPw("");setPwError(false);}} style={{ flex:1, background:"transparent", border:`1px solid #333`, color:"#666", borderRadius:4, padding:9, cursor:"pointer", fontSize:12 }}>Cancel</button>
             <button onClick={login} style={{ flex:1, background:`linear-gradient(135deg,#8a6a1a,${gold})`, color:"#000", border:"none", borderRadius:4, padding:9, cursor:"pointer", fontSize:12, fontWeight:600 }}>Enter</button>
           </div>
         </div>
       </div>
     )}

     {showReset && (
       <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.9)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200 }}>
         <div style={{ background:"#0f0d07", border:`1px solid #5a2a2a`, borderTop:`2px solid #ef4444`, borderRadius:8, padding:32, width:300, textAlign:"center" }}>
           <div style={{ fontFamily:"'Cinzel',serif", fontSize:18, fontWeight:600, color:"#ef6644", marginBottom:8 }}>Push to YTD?</div>
           <div style={{ fontSize:12, color:"#6b5a2a", marginBottom:24, lineHeight:1.5 }}>This will add this week's numbers to Year to Date totals and reset the weekly board to zero.</div>
           <div style={{ display:"flex", gap:8 }}>
             <button onClick={()=>setShowReset(false)} style={{ flex:1, background:"transparent", border:`1px solid #333`, color:"#666", borderRadius:4, padding:10, cursor:"pointer", fontSize:12 }}>Cancel</button>
             <button onClick={pushToYTD} style={{ flex:1, background:"linear-gradient(135deg,#8a1a1a,#ef4444)", color:"#fff", border:"none", borderRadius:4, padding:10, cursor:"pointer", fontSize:12, fontWeight:600 }}>Confirm & Reset</button>
           </div>
         </div>
       </div>
     )}

     <div style={{ maxWidth:580, margin:"0 auto", padding:"20px 16px" }}>
       <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:20 }}>
         {[{label:"Total Deals",value:totalDeals},{label:"Total kWh",value:fmt(totalKwh)}].map(c=>(
           <div key={c.label} style={{ background:cardBg, border:`1px solid ${border}`, borderTop:`2px solid ${gold}`, borderRadius:6, padding:"14px 10px", textAlign:"center" }}>
             <div style={{ fontSize:9, letterSpacing:2, color:"#6b5a2a", textTransform:"uppercase", marginBottom:6 }}>{c.label}</div>
             <div className="gold-text" style={{ fontFamily:"'Cinzel',serif", fontSize:22, fontWeight:700 }}>{c.value}</div>
           </div>
         ))}
       </div>

       <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
         <div style={{ flex:1, height:1, background:border }}></div>
         <div style={{ fontSize:10, fontFamily:"'Cinzel',serif", letterSpacing:3, color:"#6b5a2a" }}>{isYTD?"YEAR TO DATE":"THIS WEEK"}</div>
         <div style={{ flex:1, height:1, background:border }}></div>
       </div>

       <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
         {sorted.map((rep,i)=>{
           const d=deals[rep.id]||0;
           const isTop=i===0&&d>0;
           const draft=draftDeals[rep.id]||0;
           return (
             <div key={rep.id} className="rep-row" style={{ animationDelay:`${i*0.06}s`, background:isTop?"linear-gradient(135deg,#120e04,#1a1508)":cardBg, border:`1px solid ${isTop?"#3a2e10":border}`, borderLeft:`3px solid ${isTop?gold:"#1e1a12"}`, borderRadius:6, padding:"12px 14px", display:"flex", alignItems:"center", gap:12 }}>
               <div style={{ fontFamily:"'Cinzel',serif", fontSize:i<3?18:14, color:i===0?gold:"#3a2e10", width:28, textAlign:"center", flexShrink:0 }}>{getRankDisplay(i)}</div>
               <div style={{ flex:1, minWidth:0 }}>
                 <div style={{ fontFamily:"'Cinzel',serif", fontWeight:600, fontSize:13, color:isTop?goldLight:"#d4c9a8", letterSpacing:1 }}>{rep.name}</div>
               </div>
               <div style={{ textAlign:"right", flexShrink:0 }}>
                 {isAdmin ? (
                   <div style={{ display:"flex", flexDirection:"column", gap:5, alignItems:"flex-end" }}>
                     <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                       <span style={{ fontSize:9, color:"#4a3f1e" }}>deals</span>
                       <input type="number" min="0" value={draft} onChange={e=>setDraftDeals(prev=>({...prev,[rep.id]:Math.max(0,parseInt(e.target.value)||0)}))} style={{ background:"#1a1508", border:`1px solid ${gold}44`, borderRadius:4, color:goldLight, fontFamily:"'Cinzel',serif", fontSize:15, padding:"3px 6px", width:52, textAlign:"center" }} />
                     </div>
                     <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                       <span style={{ fontSize:9, color:"#4a3f1e" }}>kWh</span>
                       <input type="number" min="0" value={draftUsage[rep.id]!=null?draftUsage[rep.id]:""} placeholder={String((draft||0)*AVG_KWH)} onChange={e=>{const v=e.target.value===""?null:Math.max(0,parseInt(e.target.value)||0);setDraftUsage(prev=>({...prev,[rep.id]:v}));}} style={{ background:"#1a1508", border:`1px solid #2a2010`, borderRadius:4, color:"#a89060", fontFamily:"'Cinzel',serif", fontSize:12, padding:"3px 6px", width:70, textAlign:"center" }} />
                     </div>
                     <button onClick={()=>removeRep(rep.id,isYTD)} style={{ background:"transparent", border:"none", color:"#5a2a2a", fontSize:10, cursor:"pointer", padding:"2px 0" }}>remove</button>
                   </div>
                 ) : (
                   <div style={{ display:"flex", gap:14, alignItems:"center" }}>
                     <div style={{ textAlign:"right" }}>
                       <div style={{ fontFamily:"'Cinzel',serif", fontSize:22, color:d>0?goldLight:"#2a2010" }}>{d}</div>
                       <div style={{ fontSize:9, color:"#4a3f1e", letterSpacing:1 }}>deals</div>
                     </div>
                     <div style={{ width:1, height:26, background:border }}></div>
                     <div style={{ textAlign:"right" }}>
                       <div style={{ fontFamily:"'Cinzel',serif", fontSize:14, color:"#a89060" }}>{fmt(usage[rep.id]!=null?usage[rep.id]:d*AVG_KWH)}</div>
                       <div style={{ fontSize:9, color:"#4a3f1e", letterSpacing:1 }}>kWh</div>
                     </div>
                   </div>
                 )}
               </div>
             </div>
           );
         })}
       </div>

       {isAdmin && (
         <div style={{ marginTop:20, display:"flex", flexDirection:"column", gap:10 }}>
           <div style={{ display:"flex", gap:8 }}>
             <input value={newRepName} onChange={e=>setNewRepName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addRep(isYTD)} placeholder="Add rep name..." style={{ flex:1, background:"#1a1508", border:`1px solid ${border}`, borderRadius:4, color:"#f0ead6", padding:"10px 12px", fontSize:13 }} />
             <button onClick={()=>addRep(isYTD)} style={{ background:`linear-gradient(135deg,#8a6a1a,${gold})`, color:"#000", border:"none", borderRadius:4, padding:"10px 16px", cursor:"pointer", fontSize:13, fontWeight:700 }}>+</button>
           </div>
           <button onClick={isYTD?saveYTD:saveWeekly} className={saved?"save-pop":""} style={{ width:"100%", background:saved?"linear-gradient(135deg,#2a5a2a,#4a8a4a)":`linear-gradient(135deg,#8a6a1a,${gold})`, color:"#000", border:"none", borderRadius:6, padding:"13px", fontSize:13, fontWeight:700, cursor:"pointer", fontFamily:"'Cinzel',serif", letterSpacing:2 }}>
             {saved?"✓ SAVED":"SAVE & PUSH LIVE"}
           </button>
           {!isYTD && (
             <button onClick={()=>setShowReset(true)} style={{ width:"100%", background:"transparent", border:`1px solid #5a3a1a`, color:"#c9a84c", borderRadius:6, padding:"12px", fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"'Cinzel',serif", letterSpacing:1 }}>
               PUSH TO YEAR TO DATE + RESET WEEK
             </button>
           )}
         </div>
       )}

       <div style={{ marginTop:32, textAlign:"center" }}>
         <div style={{ fontSize:9, color:"#2a2010", letterSpacing:3, textTransform:"uppercase" }}>Ascend Energy · {isYTD?"Year to Date":"Weekly"} Rankings</div>
       </div>
     </div>
   </div>
 );
}
