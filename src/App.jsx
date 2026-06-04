import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCoPVEkPF68GCFotwx4QnfrvVxzF5h5sag",
  authDomain: "ascend-leaderboard.firebaseapp.com",
  projectId: "ascend-leaderboard",
  storageBucket: "ascend-leaderboard.firebasestorage.app",
  messagingSenderId: "216368084693",
  appId: "1:216368084693:web:a53381fe5afa8e8a5c545c",
  measurementId: "G-D2RT3DCLYQ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

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

function getRank(i) {
  if (i === 0) return "🥇";
  if (i === 1) return "🥈";
  if (i === 2) return "🥉";
  return `#${i + 1}`;
}

export default function App() {
  const [tab, setTab] = useState("daily");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPush, setShowPush] = useState(false);
  const [pushTarget, setPushTarget] = useState("");
  const [newRepName, setNewRepName] = useState("");
  const [loading, setLoading] = useState(true);

  const [data, setData] = useState({
    dReps: DEFAULT_REPS, dDeals: {}, dUsage: {},
    wReps: DEFAULT_REPS, wDeals: {}, wUsage: {},
    yReps: DEFAULT_REPS, yDeals: {}, yUsage: {},
  });

  const [draft, setDraft] = useState({ deals: {}, usage: {} });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "leaderboard", "data"), (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setData({
          dReps: d.dReps || DEFAULT_REPS,
          dDeals: d.dDeals || {},
          dUsage: d.dUsage || {},
          wReps: d.wReps || DEFAULT_REPS,
          wDeals: d.wDeals || {},
          wUsage: d.wUsage || {},
          yReps: d.yReps || DEFAULT_REPS,
          yDeals: d.yDeals || {},
          yUsage: d.yUsage || {},
        });
        const deals = tab === "daily" ? d.dDeals : tab === "weekly" ? d.wDeals : d.yDeals;
        const usage = tab === "daily" ? d.dUsage : tab === "weekly" ? d.wUsage : d.yUsage;
        setDraft({ deals: deals || {}, usage: usage || {} });
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const deals = tab === "daily" ? data.dDeals : tab === "weekly" ? data.wDeals : data.yDeals;
    const usage = tab === "daily" ? data.dUsage : tab === "weekly" ? data.wUsage : data.yUsage;
    setDraft({ deals: { ...deals }, usage: { ...usage } });
  }, [tab]);

  function login() {
    if (pw === ADMIN_PASSWORD) { setIsAdmin(true); setShowLogin(false); setPw(""); setPwError(false); }
    else setPwError(true);
  }

  function flash() { setSaved(true); setTimeout(() => setSaved(false), 2500); }

  async function saveTab() {
    const update = {};
    if (tab === "daily") {
      update.dDeals = draft.deals;
      update.dUsage = draft.usage;
      update.dReps = reps;
    } else if (tab === "weekly") {
      update.wDeals = draft.deals;
      update.wUsage = draft.usage;
      update.wReps = reps;
    } else {
      update.yDeals = draft.deals;
      update.yUsage = draft.usage;
      update.yReps = reps;
    }
    await setDoc(doc(db, "leaderboard", "data"), { ...data, ...update });
    flash();
  }

  async function pushAndReset(from, to) {
    const fromDeals = from === "daily" ? data.dDeals : data.wDeals;
    const fromUsage = from === "daily" ? data.dUsage : data.wUsage;
    const fromReps = from === "daily" ? data.dReps : data.wReps;
    const toDeals = { ...(to === "weekly" ? data.wDeals : data.yDeals) };
    const toUsage = { ...(to === "weekly" ? data.wUsage : data.yUsage) };
    fromReps.forEach(rep => {
      toDeals[rep.id] = (toDeals[rep.id] || 0) + (fromDeals[rep.id] || 0);
      const kwh = fromUsage[rep.id] != null ? fromUsage[rep.id] : (fromDeals[rep.id] || 0) * AVG_KWH;
      toUsage[rep.id] = (toUsage[rep.id] || 0) + kwh;
    });
    const empty = {}; const emptyU = {};
    fromReps.forEach(r => { empty[r.id] = 0; emptyU[r.id] = 0; });
    const update = { ...data };
    if (from === "daily") { update.dDeals = empty; update.dUsage = emptyU; }
    else { update.wDeals = empty; update.wUsage = emptyU; }
    if (to === "weekly") { update.wDeals = toDeals; update.wUsage = toUsage; }
    else { update.yDeals = toDeals; update.yUsage = toUsage; }
    await setDoc(doc(db, "leaderboard", "data"), update);
    setShowPush(false); flash();
  }

  async function addRep() {
    const name = newRepName.trim();
    if (!name) return;
    const id = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();
    const rep = { id, name };
    const update = { ...data };
    if (tab === "daily") update.dReps = [...data.dReps, rep];
    else if (tab === "weekly") update.wReps = [...data.wReps, rep];
    else update.yReps = [...data.yReps, rep];
    await setDoc(doc(db, "leaderboard", "data"), update);
    setNewRepName("");
  }

  async function removeRep(id) {
    const update = { ...data };
    if (tab === "daily") update.dReps = data.dReps.filter(r => r.id !== id);
    else if (tab === "weekly") update.wReps = data.wReps.filter(r => r.id !== id);
    else update.yReps = data.yReps.filter(r => r.id !== id);
    await setDoc(doc(db, "leaderboard", "data"), update);
  }

  const gold = "#c9a84c"; const goldLight = "#e8c96d";
  const darkBg = "#0c0c0c"; const cardBg = "#111111"; const border = "#1e1a12";

  const reps = tab === "daily" ? data.dReps : tab === "weekly" ? data.wReps : data.yReps;
  const deals = tab === "daily" ? data.dDeals : tab === "weekly" ? data.wDeals : data.yDeals;
  const usage = tab === "daily" ? data.dUsage : tab === "weekly" ? data.wUsage : data.yUsage;

  const sorted = [...reps].sort((a, b) => (deals[b.id] || 0) - (deals[a.id] || 0));
  const totalDeals = reps.reduce((s, r) => s + (deals[r.id] || 0), 0);
  const totalKwh = reps.reduce((s, r) => { const u = usage[r.id]; return s + (u != null ? u : (deals[r.id] || 0) * AVG_KWH); }, 0);
  const tabLabel = tab === "daily" ? "TODAY" : tab === "weekly" ? "THIS WEEK" : "YEAR TO DATE";
  return (
    <div style={{minHeight:"100vh",background:darkBg,color:"#f0ead6",paddingBottom:100}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&display=swap');
        *{box-sizing:border-box;}input:focus{outline:none;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
        @keyframes pop{0%{transform:scale(1);}50%{transform:scale(1.04);}100%{transform:scale(1);}}
        .rep-row{animation:fadeUp 0.4s ease both;}
        .gold-text{background:linear-gradient(135deg,#c9a84c,#f0d070,#c9a84c);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .save-pop{animation:pop 0.3s ease;}
        input[type='number']::-webkit-outer-spin-button,input[type='number']::-webkit-inner-spin-button{-webkit-appearance:none;}
        input[type='number']{-moz-appearance:textfield;}
      `}</style>
      <div style={{background:"linear-gradient(180deg,#0a0800,#111008)",borderBottom:`1px solid ${border}`,padding:"14px 20px 0",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div className="gold-text" style={{fontFamily:"'Cinzel',serif",fontSize:22,fontWeight:700,letterSpacing:4}}>ASCEND</div>
          {isAdmin
            ?<button onClick={()=>setIsAdmin(false)} style={{background:"transparent",border:`1px solid #333`,color:"#555",borderRadius:4,padding:"5px 10px",cursor:"pointer",fontSize:11}}>Exit</button>
            :<button onClick={()=>setShowLogin(true)} style={{background:`linear-gradient(135deg,#8a6a1a,${gold})`,color:"#000",border:"none",borderRadius:4,padding:"6px 14px",cursor:"pointer",fontSize:11,fontWeight:600}}>ADMIN</button>
          }
        </div>
        <div style={{display:"flex"}}>
          {["daily","weekly","ytd"].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{flex:1,background:"transparent",border:"none",borderBottom:`2px solid ${tab===t?gold:"transparent"}`,color:tab===t?gold:"#4a3f1e",padding:"9px 0",cursor:"pointer",fontSize:10,fontFamily:"'Cinzel',serif",letterSpacing:2,textTransform:"uppercase"}}>
              {t==="daily"?"Daily":t==="weekly"?"Weekly":"YTD"}
            </button>
          ))}
        </div>
      </div>
      {showLogin&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
          <div style={{background:"#0f0d07",border:`1px solid ${border}`,borderTop:`2px solid ${gold}`,borderRadius:8,padding:28,width:290,textAlign:"center"}}>
            <div className="gold-text" style={{fontFamily:"'Cinzel',serif",fontSize:18,fontWeight:600,marginBottom:16}}>Admin Access</div>
            <input type="password" value={pw} onChange={e=>{setPw(e.target.value);setPwError(false);}} onKeyDown={e=>e.key==="Enter"&&login()} placeholder="Password" style={{width:"100%",background:"#1a1508",border:`1px solid ${pwError?"#ef4444":border}`,borderRadius:4,color:"#f0ead6",padding:"10px 12px",fontSize:14,marginBottom:8}}/>
            {pwError&&<div style={{color:"#ef4444",fontSize:11,marginBottom:8}}>Incorrect password</div>}
            <div style={{display:"flex",gap:8,marginTop:8}}>
              <button onClick={()=>{setShowLogin(false);setPw("");setPwError(false);}} style={{flex:1,background:"transparent",border:`1px solid #333`,color:"#666",borderRadius:4,padding:9,cursor:"pointer",fontSize:12}}>Cancel</button>
              <button onClick={login} style={{flex:1,background:`linear-gradient(135deg,#8a6a1a,${gold})`,color:"#000",border:"none",borderRadius:4,padding:9,cursor:"pointer",fontSize:12,fontWeight:600}}>Enter</button>
            </div>
          </div>
        </div>
      )}
      {showPush&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
          <div style={{background:"#0f0d07",border:`1px solid #5a2a2a`,borderTop:`2px solid #ef4444`,borderRadius:8,padding:28,width:290,textAlign:"center"}}>
            <div style={{fontFamily:"'Cinzel',serif",fontSize:16,fontWeight:600,color:"#ef6644",marginBottom:8}}>
              {pushTarget==="weekly"?"Push Daily → Weekly?":"Push Weekly → YTD?"}
            </div>
            <div style={{fontSize:12,color:"#6b5a2a",marginBottom:20,lineHeight:1.5}}>
              {pushTarget==="weekly"?"Today's numbers will be added to this week's totals and the daily board will reset.":"This week's numbers will be added to YTD totals and the weekly board will reset."}
            </div>
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>setShowPush(false)} style={{flex:1,background:"transparent",border:`1px solid #333`,color:"#666",borderRadius:4,padding:10,cursor:"pointer",fontSize:12}}>Cancel</button>
              <button onClick={()=>pushAndReset(pushTarget==="weekly"?"daily":"weekly",pushTarget)} style={{flex:1,background:"linear-gradient(135deg,#8a1a1a,#ef4444)",color:"#fff",border:"none",borderRadius:4,padding:10,cursor:"pointer",fontSize:12,fontWeight:600}}>Confirm</button>
            </div>
          </div>
        </div>
      )}
      <div style={{maxWidth:560,margin:"0 auto",padding:"18px 14px"}}>
        {loading?(
          <div style={{textAlign:"center",color:"#4a3f1e",fontSize:12,padding:60}}>Loading...</div>
        ):(
          <>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:18}}>
              {[{label:"Total Deals",value:totalDeals},{label:"Total kWh",value:fmt(totalKwh)}].map(c=>(
                <div key={c.label} style={{background:cardBg,border:`1px solid ${border}`,borderTop:`2px solid ${gold}`,borderRadius:6,padding:"12px 10px",textAlign:"center"}}>
                  <div style={{fontSize:9,letterSpacing:2,color:"#6b5a2a",textTransform:"uppercase",marginBottom:5}}>{c.label}</div>
                  <div className="gold-text" style={{fontFamily:"'Cinzel',serif",fontSize:20,fontWeight:700}}>{c.value}</div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
              <div style={{flex:1,height:1,background:border}}></div>
              <div style={{fontSize:9,fontFamily:"'Cinzel',serif",letterSpacing:3,color:"#6b5a2a"}}>{tabLabel}</div>
              <div style={{flex:1,height:1,background:border}}></div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {sorted.map((rep,i)=>{
                const d=deals[rep.id]||0;
                const isTop=i===0&&d>0;
                const draftD=draft.deals[rep.id]||0;
                return(
                  <div key={rep.id} className="rep-row" style={{animationDelay:`${i*0.05}s`,background:isTop?"linear-gradient(135deg,#120e04,#1a1508)":cardBg,border:`1px solid ${isTop?"#3a2e10":border}`,borderLeft:`3px solid ${isTop?gold:"#1e1a12"}`,borderRadius:6,padding:"11px 13px",display:"flex",alignItems:"center",gap:10}}>
                    <div style={{fontFamily:"'Cinzel',serif",fontSize:i<3?17:13,color:i===0?gold:"#3a2e10",width:26,textAlign:"center",flexShrink:0}}>{getRank(i)}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:"'Cinzel',serif",fontWeight:600,fontSize:13,color:isTop?goldLight:"#d4c9a8",letterSpacing:1}}>{rep.name}</div>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      {isAdmin?(
                        <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
                          <div style={{display:"flex",alignItems:"center",gap:5}}>
                            <span style={{fontSize:9,color:"#4a3f1e"}}>deals</span>
                            <input type="number" min="0" value={draftD} onChange={e=>setDraft(p=>({...p,deals:{...p.deals,[rep.id]:Math.max(0,parseInt(e.target.value)||0)}}))} style={{background:"#1a1508",border:`1px solid ${gold}44`,borderRadius:4,color:goldLight,fontFamily:"'Cinzel',serif",fontSize:15,padding:"2px 5px",width:50,textAlign:"center"}}/>
                          </div>
                          <div style={{display:"flex",alignItems:"center",gap:5}}>
                            <span style={{fontSize:9,color:"#4a3f1e"}}>kWh</span>
                            <input type="number" min="0" value={draft.usage[rep.id]!=null?draft.usage[rep.id]:""} placeholder={String((draftD||0)*AVG_KWH)} onChange={e=>{const v=e.target.value===""?null:Math.max(0,parseInt(e.target.value)||0);setDraft(p=>({...p,usage:{...p.usage,[rep.id]:v}}));}} style={{background:"#1a1508",border:`1px solid #2a2010`,borderRadius:4,color:"#a89060",fontFamily:"'Cinzel',serif",fontSize:12,padding:"2px 5px",width:68,textAlign:"center"}}/>
                          </div>
                          <button onClick={()=>removeRep(rep.id)} style={{background:"transparent",border:"none",color:"#5a2a2a",fontSize:10,cursor:"pointer",padding:"1px 0"}}>remove</button>
                        </div>
                      ):(
                        <div style={{display:"flex",gap:12,alignItems:"center"}}>
                          <div style={{textAlign:"right"}}>
                            <div style={{fontFamily:"'Cinzel',serif",fontSize:21,color:d>0?goldLight:"#2a2010"}}>{d}</div>
                            <div style={{fontSize:9,color:"#4a3f1e",letterSpacing:1}}>deals</div>
                          </div>
                          <div style={{width:1,height:24,background:border}}></div>
                          <div style={{textAlign:"right"}}>
                            <div style={{fontFamily:"'Cinzel',serif",fontSize:13,color:"#a89060"}}>{fmt(usage[rep.id]!=null?usage[rep.id]:d*AVG_KWH)}</div>
                            <div style={{fontSize:9,color:"#4a3f1e",letterSpacing:1}}>kWh</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {isAdmin&&(
              <div style={{marginTop:18,display:"flex",flexDirection:"column",gap:9}}>
                <div style={{display:"flex",gap:8}}>
                  <input value={newRepName} onChange={e=>setNewRepName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addRep()} placeholder="Add rep name..." style={{flex:1,background:"#1a1508",border:`1px solid ${border}`,borderRadius:4,color:"#f0ead6",padding:"9px 11px",fontSize:13}}/>
                  <button onClick={addRep} style={{background:`linear-gradient(135deg,#8a6a1a,${gold})`,color:"#000",border:"none",borderRadius:4,padding:"9px 15px",cursor:"pointer",fontSize:14,fontWeight:700}}>+</button>
                </div>
                <button onClick={saveTab} className={saved?"save-pop":""} style={{width:"100%",background:saved?"linear-gradient(135deg,#2a5a2a,#4a8a4a)":`linear-gradient(135deg,#8a6a1a,${gold})`,color:"#000",border:"none",borderRadius:6,padding:"12px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"'Cinzel',serif",letterSpacing:2}}>
                  {saved?"✓ SAVED":"SAVE & PUSH LIVE"}
                </button>
                {tab==="daily"&&(
                  <button onClick={()=>{setPushTarget("weekly");setShowPush(true);}} style={{width:"100%",background:"transparent",border:`1px solid #5a3a1a`,color:gold,borderRadius:6,padding:"11px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'Cinzel',serif",letterSpacing:1}}>
                    PUSH DAILY → WEEKLY + RESET DAY
                  </button>
                )}
                {tab==="weekly"&&(
                  <button onClick={()=>{setPushTarget("ytd");setShowPush(true);}} style={{width:"100%",background:"transparent",border:`1px solid #5a3a1a`,color:gold,borderRadius:6,padding:"11px",fontSize:11,fontWeight:600,cursor:"pointer",fontFamily:"'Cinzel',serif",letterSpacing:1}}>
                    PUSH WEEKLY → YTD + RESET WEEK
                  </button>
                )}
              </div>
            )}
            <div style={{marginTop:28,textAlign:"center"}}>
              <div style={{fontSize:9,color:"#2a2010",letterSpacing:3,textTransform:"uppercase"}}>Ascend Energy · {tabLabel}</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
