import { useState, useEffect } from "react";

const ADMIN_PASSWORD = "boss2024";
const AVG_KWH = 8000;
const LOGO_B64 = "";

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

  function login

