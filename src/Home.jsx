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

const FAQS = [
  { q: "Housing, how does that look?", a: "We track a metric called 'Reps per Rooms,' and our average is 1.2 company-wide. Leadership will always be the first to share rooms, couches, or futons. We believe in servant leadership at its core, ensuring your comfort and well-being." },
  { q: "Transportation, how does that look?", a: "For your first trip, we cover your flights. You'll need to pay upfront, but we reimburse you once you arrive. On the ground, we have team members who drive you to turf, the gym, and help with groceries. With open communication, you'll always have the means to get where you need to be." },
  { q: "Schedule, how does that look?", a: "This is a 1099 position with no set schedule, but we recommend joining for three weeks initially to get a feel for the job. Most reps settle into a 3 weeks on, 1 week off rhythm — it keeps you sharp and improving." },
  { q: "Dress code, how does that look?", a: "No strict dress code — just dress comfortably for door-to-door sales and adapt to the climate. In warm weather, think golf-ready. In cold weather, layer up and stay warm." },
  { q: "What kind of education is provided?", a: "Personalized, hands-on training with a dedicated trainer from day one. We focus on ethical sales techniques, maximizing earning potential, and building the mindset to succeed — handling rejection, mental toughness, and consistency under pressure." },
  { q: "What does onboarding look like?", a: "Two weeks before arrival, we send you an agreement to sign and get you set up with all necessary software and training materials. You'll schedule an onboarding call, and on arrival day we pick you up from the airport, get you settled, and take you straight to the field. You won't be alone." },
  { q: "What should I bring?", a: "Pack for the climate. Warm weather: shorts, t-shirts, comfortable shoes, workout gear, swimwear. Cold weather: hat, gloves, jacket, and layers. If you're missing anything, we'll help you get it." },
  { q: "What does day-to-day look like?", a: "Two crews per house, morning and afternoon. Morning crew hits workouts, cold plunges, and reading before the 9am meeting. Most reps head to turf around 11am and return around 6pm. Communication is key for coordinating rides." },
  { q: "How fast will I close my first sale?", a: "Every rep who has joined Ascend has closed their first sale on the second day of training. Trainers are by your side the whole time." },
  { q: "How long until my first paycheck?", a: "We invoice every two weeks (1st–15th and 16th–end of month), always paid two weeks behind. If you start on the 3rd, you'll be paid on the 30th for deals from the 3rd to the 15th. It's a proven system that works." },
];

export default function Home() {
  const [showJoin, setShowJoin] = useState(false);
  const [showWork, setShowWork] = useState(false);
  const [joinForm, setJoinForm] = useState({name:"",phone:"",email:"",about:""});
  const [workForm, setWorkForm] = useState({name:"",phone:"",email:""});
  const [joinSent, setJoinSent] = useState(false);
  const [workSent, setWorkSent] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
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
        .faq-item{border-bottom:1px solid #1e1a12;cursor:pointer;}
        .faq-item:hover{background:#0f0d07;}
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
          <button className="btn-outline" onClick={
     {/* FAQ SECTION */}
     <div style={{maxWidth:640,margin:"0 auto",padding:"80px 24px"}}>
       <div style={{textAlign:"center",marginBottom:48}}>
         <div className="gold-text" style={{fontFamily:"'Cinzel',serif",fontSize:"clamp(22px,5vw,32px)",fontWeight:700,letterSpacing:4,marginBottom:12}}>FREQUENTLY ASKED QUESTIONS</div>
         <div style={{width:"40%",height:1,background:`linear-gradient(90deg,transparent,${gold},transparent)`,margin:"0 auto"}}/>
       </div>
       {FAQS.map((faq,i)=>(
         <div key={i} className="faq-item" onClick={()=>setOpenFaq(openFaq===i?null:i)} style={{padding:"20px 4px"}}>
           <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:16}}>
             <div style={{fontFamily:"'Cinzel',serif",fontSize:13,fontWeight:600,color:openFaq===i?"#c9a84c":"#d4c9a8",letterSpacing:1}}>{faq.q}</div>
             <div style={{color:"#6b5a2a",fontSize:18,flexShrink:0}}>{openFaq===i?"−":"+"}</div>
           </div>
           {openFaq===i&&(
             <div style={{marginTop:14,fontSize:13,color:"#8a7a5a",lineHeight:1.8,fontFamily:"'Inter',sans-serif"}}>{faq.a}</div>
           )}
         </div>
       ))}
       <div style={{textAlign:"center",marginTop:64}}>
         <div style={{fontSize:13,color:"#4a3f1e",marginBottom:20,fontFamily:"'Cinzel',serif",letterSpacing:2}}>READY TO ASCEND?</div>
         <button className="btn-gold" onClick={()=>setShowJoin(true)}>Join the Team</button>
       </div>
     </div>

     {/* FOOTER */}
     <div style={{borderTop:"1px solid #1e1a12",padding:"24px",textAlign:"center"}}>
       <div style={{fontSize:9,color:"#2a2010",letterSpacing:3,textTransform:"uppercase"}}>Ascend Marketing · Built for the Top 1%</div>
     </div>

     {/* JOIN MODAL */}
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

     {/* WORK MODAL */}
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
