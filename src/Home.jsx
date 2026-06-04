import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { initializeApp, getApps } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCoPVEkPF68GCFotwx4QnfrvVxzF5h5sag",
  authDomain: "ascend-leaderboard.firebaseapp.com",
  projectId: "ascend-leaderboard",
  storageBucket: "ascend-leaderboard.firebasestorage.app",
  messagingSenderId: "216368084693",
  appId: "1:216368084693:web:a53381fe5afa8e8a5c545c"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export default function Home() {
  const [showJoin, setShowJoin] = useState(false);
  const [showWork, setShowWork] = useState(false);
  const [joinForm, setJoinForm] = useState({name:"",phone:"",email:"",about:""});
  const [workForm, setWorkForm] = useState({name:"",phone:"",email:""});
  const [joinSent, setJoinSent] = useState(false);
  const [workSent, setWorkSent] = useState(false);
  const navigate = useNavigate();
  const gold = "#c9a84c";
  const border = "#1e1a12";

  async function submitJoin(e) {
    e.preventDefault();
    await addDoc(collection(db,"applications"),{...joinForm,type:"join",createdAt:serverTimestamp()});
    setJoinSent(true);
  }

  async function submitWork(e) {
    e.preventDefault();
    await addDoc(collection(db,"contacts"),{...workForm,type:"work",createdAt:serverTimestamp()});
    setWorkSent(true);
  }

  return (
    <div style={{minHeight:"100vh",background:"#0a0a0a",color:"#f0ead6",fontFamily:"Georgia,serif"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Inter:wght@300;400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        input,textarea{font-family:inherit;}
        input:focus,textarea:focus{outline:none;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(20px);}to{opacity:1;transform:translateY(0);}}
        .fade-in{animation:fadeIn 1s ease both;}
        .fade-in-2{animation:fadeIn 1s ease 0.3s both;}
        .fade-in-3{animation:fadeIn 1s ease 0.6s both;}
        .gold-text{background:linear-gradient(135deg,#c9a84c,#f0d070,#c9a84c);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
        .btn-gold{background:linear-gradient(135deg,#8a6a1a,#c9a84c);color:#000;border:none;border-radius:4px;padding:14px 32px;cursor:pointer;font-family:'Cinzel',serif;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;}
        .btn-outline{background:transparent;color:#c9a84c;border:1px solid #c9a84c;border-radius:4px;padding:13px 32px;cursor:pointer;font-family:'Cinzel',serif;font-size:12px;font-weight:600;letter-spacing:2px;text-transform:uppercase;}
        .form-input{width:100%;background:#111;border:1px solid #2a2010;border-radius:4px;color:#f0ead6;padding:12px 14px;font-size:14px;margin-bottom:12px;}
        .form-input:focus{border-color:#c9a84c44;}
        ::placeholder{color:#4a3f1e;}
      `}</style>

      <div style={{position:"fixed",top:0,left:0,right:0,zIndex:100,padding:"16px 24px",display:"flex",justifyContent:"flex-end"}}>
        <button onClick={()=>navigate("/leaderboard")} style={{background:"transparent",border:"none",color:"#3a2e10",fontSize:11,fontFamily:"'Cinzel',serif",letterSpacing:2,cursor:"pointer",textTransform:"uppercase"}}>Team Portal</button>
      </div>

      <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"60px 24px",textAlign:"center",background:"radial-gradient(ellipse at 50% 30%,#1a1408 0%,#0a0a0a 70%)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle at 50% 50%,#c9a84c08 0%,transparent 60%)",pointerEvents:"none"}}/>
        <div className="fade-in" style={{marginBottom:40}}>
          <div className="gold-text" style={{fontFamily:"'Cinzel',serif",fontSize:"clamp(48px,12vw,80px)",fontWeight:900,letterSpacing:12,lineHeight:1}}>ASCEND</div>
          <div style={{width:"60%",height:1,background:`linear-gradient(90deg,transparent,${gold},transparent)`,margin:"16px auto 0"}}/>
        </div>
        <div className="fade-in-2" style={{marginBottom:60}}>
          <div style={{fontFamily:"'Cinzel',serif",fontSize:"clamp(13px,3vw,18px)",letterSpacing:6,color:"#6b5a2a",textTransform:"uppercase"}}>Built for the Top 1%</div>
        </div>
        <div className="fade-in-3" style={{display:"flex",gap:16,flexWrap:"wrap",justifyContent:"center"}}>
          <button className="btn-gold" onClick={()=>setShowJoin(true)}>Join the Team</button>
          <button className="btn-outline" onClick={()=>setShowWork(true)}>Work With Us</button>
        </div>
        <div style={{position:"absolute",bottom:0,left:0,right:0,height:120,background:"linear-gradient(transparent,#0a0a0a)",pointerEvents:"none"}}/>
      </div>

      {showJoin&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.95)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:24}}>
          <div style={{background:"#0f0d07",border:`1px solid ${border}`,borderTop:`2px solid ${gold}`,borderRadius:8,padding:32,width:"100%",maxWidth:380}}>
            {joinSent?(
              <div style={{textAlign:"center",padding:"20px 0"}}>
                <div className="gold-text" style={{fontFamily:"'Cinzel',serif",fontSize:22,fontWeight:700,marginBottom:12}}>Application Received</div>
                <div style={{fontSize:13,color:"#6b5a2a",lineHeight:1.6}}>We'll be in touch shortly.</div>
                <button className="btn-gold" onClick={()=>{setShowJoin(false);setJoinSent(false);setJoinForm({name:"",phone:"",email:"",about:"",});}} style={{marginTop:24}}>Close</button>
              </div>
            ):(
              <>
                <div className="gold-text" style={{fontFamily:"'Cinzel',serif",fontSize:20,fontWeight:700,marginBottom:4}}>Join the Team</div>
                <div style={{fontSize:11,color:"#4a3f1e",marginBottom:24,letterSpacing:1}}>Tell us about yourself</div>
                <form onSubmit={submitJoin}>
                  <input className="form-input" placeholder="Full Name" value={joinForm.name} onChange={e=>setJoinForm(p=>({...p,name:e.target.value}))} required/>
                  <input className="form-input" placeholder="Phone Number" value={joinForm.phone} onChange={e=>setJoinForm(p=>({...p,phone:e.target.value}))} required/>
                  <input className="form-input" placeholder="Email Address" type="email" value={joinForm.email} onChange={e=>setJoinForm(p=>({...p,email:e.target.value}))} required/>
                  <textarea className="form-input" placeholder="Tell us about yourself..." value={joinForm.about} onChange={e=>setJoinForm(p=>({...p,about:e.target.value}))} rows={4} style={{resize:"none"}} required/>
                  <div style={{display:"flex",gap:10,marginTop:4}}>
                    <button type="button" onClick={()=>setShowJoin(false)} className="btn-outline" style={{flex:1,padding:"12px"}}>Cancel</button>
                    <button type="submit" className="btn-gold" style={{flex:2,padding:"12px"}}>Submit</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {showWork&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.95)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,padding:24}}>
          <div style={{background:"#0f0d07",border:`1px solid ${border}`,borderTop:`2px solid ${gold}`,borderRadius:8,padding:32,width:"100%",maxWidth:380}}>
            {workSent?(
              <div style={{textAlign:"center",padding:"20px 0"}}>
                <div className="gold-text" style={{fontFamily:"'Cinzel',serif",fontSize:22,fontWeight:700,marginBottom:12}}>Message Received</div>
                <div style={{fontSize:13,color:"#6b5a2a",lineHeight:1.6}}>We'll be in touch shortly.</div>
                <button className="btn-gold" onClick={()=>{setShowWork(false);setWorkSent(false);setWorkForm({name:"",phone:"",email:"",});}} style={{marginTop:24}}>Close</button>
              </div>
            ):(
              <>
                <div className="gold-text" style={{fontFamily:"'Cinzel',serif",fontSize:20,fontWeight:700,marginBottom:4}}>Work With Us</div>
                <div style={{fontSize:11,color:"#4a3f1e",marginBottom:24,letterSpacing:1}}>Get in touch</div>
                <form onSubmit={submitWork}>
                  <input className="form-input" placeholder="Full Name" value={workForm.name} onChange={e=>setWorkForm(p=>({...p,name:e.target.value}))} required/>
                  <input className="form-input" placeholder="Phone Number" value={workForm.phone} onChange={e=>setWorkForm(p=>({...p,phone:e.target.value}))} required/>
                  <input className="form-input" placeholder="Email Address" type="email" value={workForm.email} onChange={e=>setWorkForm(p=>({...p,email:e.target.value}))} required/>
                  <div style={{display:"flex",gap:10,marginTop:4}}>
                    <button type="button" onClick={()=>setShowWork(false)} className="btn-outline" style={{flex:1,padding:"12px"}}>Cancel</button>
                    <button type="submit" className="btn-gold" style={{flex:2,padding:"12px"}}>Submit</button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
