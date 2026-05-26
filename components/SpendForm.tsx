"use client";

import { useState, useEffect, useRef } from "react";
import { runAudit, type AuditReport } from "@/lib/auditEngine";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

type ToolEntry = {
  id: string;
  name: string;
  plan: string;
  spend: number;
  seats: number;
};

type FormState = {
  teamSize: number;
  useCase: string;
  tools: ToolEntry[];
};

const AVAILABLE_TOOLS = [
  "Cursor", "GitHub Copilot", "Claude", "ChatGPT",
  "Gemini", "v0", "OpenAI API", "Anthropic API"
];

const USE_CASES = ["coding", "writing", "data", "research", "mixed"];

const getToolIcon = (name: string) => {
  switch (name) {
    case "ChatGPT":
    case "OpenAI API": return <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
    case "Claude":
    case "Anthropic API": return <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
    case "GitHub Copilot": return <svg className="w-5 h-5 text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>;
    case "Cursor": return <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>;
    case "Gemini": return <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
    case "v0": return <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 22.525H0l12-21.05 12 21.05z" /></svg>;
    default: return <div className="w-5 h-5 rounded-full bg-slate-700"></div>;
  }
};

// ─── Animated Background Canvas ──────────────────────────────────────────────
function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let W = window.innerWidth, H = window.innerHeight;
    canvas.width = W; canvas.height = H;

    const resize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W; canvas.height = H;
    };
    window.addEventListener("resize", resize);

    // Floating orbs
    const orbs = Array.from({ length: 6 }, (_, i) => ({
      x: Math.random() * W, y: Math.random() * H,
      r: 180 + Math.random() * 220,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      hue: [258, 280, 210, 160, 320, 230][i],
      alpha: 0.06 + Math.random() * 0.05,
    }));

    // Particles
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: 0.5 + Math.random() * 1.5,
      vx: (Math.random() - 0.5) * 0.2, vy: -0.1 - Math.random() * 0.3,
      alpha: 0.1 + Math.random() * 0.4,
      life: Math.random(),
    }));

    // Grid lines
    const drawGrid = () => {
      ctx.strokeStyle = "rgba(99,102,241,0.04)";
      ctx.lineWidth = 1;
      const gap = 60;
      for (let x = 0; x < W; x += gap) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += gap) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
    };

    const tick = () => {
      ctx.clearRect(0, 0, W, H);
      drawGrid();

      // Draw orbs
      orbs.forEach(o => {
        o.x += o.vx; o.y += o.vy;
        if (o.x < -o.r) o.x = W + o.r;
        if (o.x > W + o.r) o.x = -o.r;
        if (o.y < -o.r) o.y = H + o.r;
        if (o.y > H + o.r) o.y = -o.r;
        const g = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        g.addColorStop(0, `hsla(${o.hue},80%,60%,${o.alpha})`);
        g.addColorStop(1, `hsla(${o.hue},80%,60%,0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw particles
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.life -= 0.002;
        if (p.life <= 0 || p.y < 0) {
          p.x = Math.random() * W; p.y = H; p.life = 0.5 + Math.random() * 0.5;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,92,246,${p.alpha * p.life})`;
        ctx.fill();
      });

      animId = requestAnimationFrame(tick);
    };
    tick();

    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: "screen" }}
    />
  );
}

// ─── Counter animation hook ────────────────────────────────────────────────
function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(id); }
      else setVal(start);
    }, 16);
    return () => clearInterval(id);
  }, [target, duration]);
  return val;
}

// ─── Stat Box with counter ─────────────────────────────────────────────────
function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  const count = useCountUp(value);
  return (
    <div className={`stat-box group cursor-default select-none ${accent ? "stat-box--accent" : ""}`}>
      <div className="stat-box__inner">
        <p className="stat-label">{label}</p>
        <p className={`stat-value ${accent ? "stat-value--green" : "stat-value--white"}`}>
          <span className="stat-dollar">$</span>
          {count.toFixed(2)}
        </p>
        <div className="stat-bar" />
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function SpendForm() {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<FormState>({
    teamSize: 1,
    useCase: "mixed",
    tools: [],
  });

  const [report, setReport] = useState<AuditReport | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Lead Capture States
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);

useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("spendpilot_state");
    if (saved) {
      try { setState(JSON.parse(saved)); } catch { console.error("Failed to parse"); }
    }
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem("spendpilot_state", JSON.stringify(state));
  }, [state, mounted]);

  const addTool = () => setState({ ...state, tools: [...state.tools, { id: crypto.randomUUID(), name: AVAILABLE_TOOLS[0], plan: "", spend: 0, seats: 1 }] });
  const updateTool = (id: string, field: keyof ToolEntry, value: string | number) => setState({ ...state, tools: state.tools.map(t => t.id === id ? { ...t, [field]: value } : t) });
  const removeTool = (id: string) => setState({ ...state, tools: state.tools.filter(t => t.id !== id) });

  const handleRunAudit = async () => {
    const generatedReport = runAudit(state);
    setReport(generatedReport);
    setIsGenerating(true);
    setAiSummary(null);
    setSubmitSuccess(false);
    setReportId(null);

    try {
      const response = await fetch("/api/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state, report: generatedReport }),
      });
      const data = await response.json();
      setAiSummary(data.summary || "Fallback: We identified several optimization paths. Review the line-item breakdown below.");
    } catch (error) {
      console.error("AI Error:", error);
      setAiSummary("Your stack has been audited. Based on your team size and use case, we found specific adjustments that could optimize your run rate. Review the breakdown below.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot !== "") { setSubmitSuccess(true); return; }
    if (!email) return;
    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, "leads"), {
        email, company: company || "Not provided", role: role || "Not provided",
        teamSize: state.teamSize, totalSpend: report?.totalMonthlySavings || 0,
        highSavings: (report?.totalMonthlySavings || 0) >= 500,
        tools: state.tools, recommendations: report?.recommendations || [],
        createdAt: serverTimestamp(),
      });
      setReportId(docRef.id);
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, totalSpend: report?.totalMonthlySavings || 0, highSavings: (report?.totalMonthlySavings || 0) >= 500 }),
      });
      setSubmitSuccess(true);
    } catch (error) {
      console.error("Error saving lead: ", error);
      alert("Failed to save report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!mounted) return null;

  // ──────────────────────────────────────────────────────────────────────────
  // VIEW 2: RESULTS DASHBOARD
  // ──────────────────────────────────────────────────────────────────────────
  if (report) {
    return (
      <>
        <AnimatedBackground />

        {/* Page-level noise overlay */}
        <div className="sp-noise" aria-hidden />

        <div className="sp-results">

          {/* ── TOP BADGE ── */}
          <div className="sp-badge-row">
            <span className="sp-badge">
              <span className="sp-badge__dot" />
              SpendPilot · AI Audit Complete
            </span>
          </div>

          {/* ── HERO TITLE ── */}
          <div className="sp-hero-title">
            <h2 className="sp-eyebrow">YOUR AI SPEND AUDIT</h2>
            <div className="sp-stat-row">
              <StatCard label="POTENTIAL MONTHLY SAVINGS" value={report.totalMonthlySavings} accent />
              <div className="sp-stat-divider">
                <svg viewBox="0 0 24 24" className="sp-divider-icon" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <StatCard label="ANNUALIZED SAVINGS" value={report.totalAnnualSavings} />
            </div>
          </div>

          {/* ── AI SUMMARY ── */}
          <div className="sp-summary">
            <div className="sp-summary__accent" />
            <div className="sp-summary__header">
              <div className="sp-summary__icon-wrap">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="sp-summary__label">AI Executive Summary</span>
            </div>
            {isGenerating ? (
              <div className="sp-skeleton">
                <div className="sp-skeleton__line" style={{ width: "100%" }} />
                <div className="sp-skeleton__line" style={{ width: "83%" }} />
                <div className="sp-skeleton__line" style={{ width: "67%" }} />
              </div>
            ) : (
              <p className="sp-summary__text">{aiSummary}</p>
            )}
          </div>

          {/* ── LINE ITEM BREAKDOWN ── */}
          <div className="sp-section">
            <h3 className="sp-section__title">
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Line-Item Breakdown
            </h3>

            {report.recommendations.length === 0 ? (
              <div className="sp-success-box">
                <div className="sp-success-box__icon">
                  <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="sp-success-box__title">You&apos;re spending well!</p>
                <p className="sp-success-box__body">We couldn&apos;t find any obvious waste in your current stack. Your team is highly optimized.</p>
              </div>
            ) : (
              <div className="sp-rec-list">
                {report.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="sp-rec-row"
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <div className="sp-rec-row__bar" />
                    <div className="sp-rec-tool">
                      <div className="tool-icon-box">{getToolIcon(rec.toolName)}</div>
                      <div>
                        <p className="sp-rec-tool__name">{rec.toolName}</p>
                        <p className="sp-rec-tool__spend">Current: ${rec.currentSpend.toFixed(2)}/mo</p>
                      </div>
                    </div>
                    <div className="sp-rec-detail">
                      <p className="sp-rec-action">{rec.recommendedAction}</p>
                      <p className="sp-rec-reason">{rec.reasoning}</p>
                    </div>
                    <div className="sp-rec-savings">
                      <p className="label-micro">SAVINGS</p>
                      <p className="sp-rec-savings__val">+${rec.savingsMonthly.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── LEAD CAPTURE ── */}
          <div className="sp-lead">
            <div className="sp-lead__glow" aria-hidden />

            {submitSuccess ? (
              <div className="sp-lead__success">
                <div className="sp-lead__check">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="sp-lead__success-title">Audit Saved!</h3>
                <p className="sp-lead__success-body">Check your inbox for next steps. Here is your anonymized public link to share with your team or network:</p>
                <div className="sp-link-row">
                  <code className="sp-link-row__code">
                    {typeof window !== "undefined" ? `${window.location.origin}/report/${reportId}` : ""}
                  </code>
                  <button
                    onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/report/${reportId}`); alert("Copied to clipboard!"); }}
                    className="sp-link-row__copy"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ) : (
              <>
                {report.totalMonthlySavings >= 500 ? (
                  <div className="sp-lead__header">
                    <h3 className="sp-lead__title">Don&apos;t leave <span className="text-gradient">${report.totalAnnualSavings.toFixed(0)}</span> on the table.</h3>
                    <p className="sp-lead__subtitle">Your infrastructure footprint is large enough to qualify for wholesale credit pooling. Book a Credex consultation to capture these savings.</p>
                  </div>
                ) : report.totalMonthlySavings < 100 || report.recommendations.length === 0 ? (
                  <div className="sp-lead__header">
                    <h3 className="sp-lead__title sp-lead__title--green">You&apos;re spending well.</h3>
                    <p className="sp-lead__subtitle">We couldn&apos;t find major waste. But AI pricing changes weekly. Drop your email and we&apos;ll notify you when new optimizations apply to your stack.</p>
                  </div>
                ) : (
                  <div className="sp-lead__header">
                    <h3 className="sp-lead__title">Capture your <span className="text-gradient">${report.totalMonthlySavings.toFixed(0)}/mo</span> savings.</h3>
                    <p className="sp-lead__subtitle">Enter your details to save this report and get a step-by-step migration guide to optimize your stack.</p>
                  </div>
                )}

                <form onSubmit={handleSaveLead} className="sp-lead__form">
                  <input type="text" style={{ display: "none" }} tabIndex={-1} autoComplete="off" value={honeypot} onChange={e => setHoneypot(e.target.value)} />
                  <div className="sp-field-group">
                    <div className="sp-field">
                      <label className="sp-field__label">Email Address *</label>
                      <input type="email" required placeholder="you@company.com" className="sp-field__input" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                  </div>
                  <div className="sp-field-row">
                    <div className="sp-field">
                      <label className="sp-field__label">Company</label>
                      <input type="text" placeholder="Optional" className="sp-field__input" value={company} onChange={e => setCompany(e.target.value)} />
                    </div>
                    <div className="sp-field">
                      <label className="sp-field__label">Role</label>
                      <input type="text" placeholder="Optional" className="sp-field__input" value={role} onChange={e => setRole(e.target.value)} />
                    </div>
                  </div>
                  <button type="submit" disabled={isSubmitting} className="sp-lead__cta">
                    {isSubmitting ? (
                      <span className="sp-cta__inner">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      <span className="sp-cta__inner">
                        {report.totalMonthlySavings >= 500 ? "Book Consultation" : "Save Report"}
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          <button onClick={() => setReport(null)} className="sp-back-btn">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
            </svg>
            Edit Stack & Recalculate
          </button>
        </div>
      </>
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // VIEW 1: INPUT FORM
  // ──────────────────────────────────────────────────────────────────────────
  return (
    <>
      <AnimatedBackground />
      <div className="sp-noise" aria-hidden />

      <div className="sp-form">

        {/* Header */}
        <div className="sp-form__header">
          <div className="sp-form__logo">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h1 className="sp-form__title">AI Stack Auditor</h1>
            <p className="sp-form__subtitle">Find hidden savings in your AI subscriptions</p>
          </div>
        </div>

        {/* Team config */}
        <div className="sp-config-grid">
          <div className="sp-field">
            <label className="sp-field__label">Team Size</label>
            <div className="sp-field__icon-wrap">
              <svg className="sp-field__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                type="number" min="1" className="sp-field__input sp-field__input--icon"
                value={state.teamSize}
                onChange={e => setState({ ...state, teamSize: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
          <div className="sp-field">
            <label className="sp-field__label">Primary Use Case</label>
            <div className="sp-field__icon-wrap">
              <svg className="sp-field__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <select
                className="sp-field__input sp-field__select sp-field__input--icon capitalize"
                value={state.useCase}
                onChange={e => setState({ ...state, useCase: e.target.value })}
              >
                {USE_CASES.map(uc => <option key={uc} value={uc} className="bg-slate-900">{uc}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="sp-divider">
          <div className="sp-divider__line" />
          <span className="sp-divider__text">Your subscriptions</span>
          <div className="sp-divider__line" />
        </div>

        {/* Tools list */}
        <div className="sp-tools-list">
          {state.tools.map((tool, i) => (
            <div key={tool.id} className="sp-tool-row" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="sp-tool-row__indicator" />

              {/* Tool selector */}
              <div className="sp-tool-select">
                <div className="tool-icon-box sp-tool-row__iconbox">{getToolIcon(tool.name)}</div>
                <div className="min-w-0 flex-1">
                  <p className="label-micro">TOOL</p>
                  <select
                    className="input-transparent cursor-pointer w-full"
                    value={tool.name}
                    onChange={e => updateTool(tool.id, "name", e.target.value)}
                  >
                    {AVAILABLE_TOOLS.map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                  </select>
                </div>
              </div>

              {/* Plan */}
              <div className="sp-tool-field">
                <p className="label-micro">PLAN</p>
                <input type="text" placeholder="e.g. Pro" className="input-transparent" value={tool.plan} onChange={e => updateTool(tool.id, "plan", e.target.value)} />
              </div>

              {/* Seats */}
              <div className="sp-tool-field sp-tool-field--narrow">
                <p className="label-micro">SEATS</p>
                <input type="number" min="1" className="input-transparent" value={tool.seats} onChange={e => updateTool(tool.id, "seats", parseInt(e.target.value) || 1)} />
              </div>

              {/* Spend */}
              <div className="sp-tool-field sp-tool-field--narrow">
                <p className="label-micro">SPEND ($)</p>
                <input type="number" min="0" step="0.01" className="input-transparent" value={tool.spend} onChange={e => updateTool(tool.id, "spend", parseFloat(e.target.value) || 0)} />
              </div>

              {/* Monthly preview */}
              <div className="sp-tool-monthly">
                <span className="sp-tool-monthly__val">${(tool.spend * tool.seats).toFixed(0)}</span>
                <span className="sp-tool-monthly__label">/mo</span>
              </div>

              {/* Delete */}
              <button onClick={() => removeTool(tool.id)} className="btn-delete-tool sp-tool-delete">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Add tool */}
        <button onClick={addTool} className="btn-add-tool sp-add-btn">
          <div className="sp-add-btn__icon">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span>Add Subscription</span>
          <span className="sp-add-btn__count">{state.tools.length} added</span>
        </button>

        {/* Total preview */}
        {state.tools.length > 0 && (
          <div className="sp-total-preview">
            <span className="sp-total-preview__label">Current Monthly Total</span>
            <span className="sp-total-preview__val">
              ${state.tools.reduce((s, t) => s + t.spend * t.seats, 0).toFixed(2)}
            </span>
          </div>
        )}

        {/* CTA */}
        <button onClick={handleRunAudit} className="btn-gradient-wrapper sp-run-btn" disabled={state.tools.length === 0}>
          <div className="btn-gradient-bg"></div>
          <div className="btn-gradient-text sp-run-btn__text">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Run Spend Audit
          </div>
        </button>

        {state.tools.length === 0 && (
          <p className="sp-empty-hint">Add at least one subscription to run the audit</p>
        )}
      </div>
    </>
  );
}