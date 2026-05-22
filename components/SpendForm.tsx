"use client";

import { useState, useEffect } from "react";
import { runAudit, type AuditReport } from "@/lib/auditEngine";

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
    case "OpenAI API":
      return <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>;
    case "Claude":
    case "Anthropic API":
      return <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
    case "GitHub Copilot":
      return <svg className="w-5 h-5 text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" /></svg>;
    case "Cursor":
      return <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>;
    case "Gemini":
      return <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>;
    case "v0":
      return <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M24 22.525H0l12-21.05 12 21.05z" /></svg>;
    default:
      return <div className="w-5 h-5 rounded-full bg-slate-700"></div>;
  }
};

export default function SpendForm() {
  const [mounted, setMounted] = useState(false);
  // State for the form inputs
  const [state, setState] = useState<FormState>({
    teamSize: 1,
    useCase: "mixed",
    tools: [],
  });
  // State to hold the audit results. If null, show form. If populated, show results.
  const [report, setReport] = useState<AuditReport | null>(null);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("spendpilot_state");
    if (saved) {
      try { setState(JSON.parse(saved)); } catch (e) { console.error("Failed to parse saved state"); }
    }
  }, []);

  useEffect(() => {
    if (mounted) localStorage.setItem("spendpilot_state", JSON.stringify(state));
  }, [state, mounted]);

  const addTool = () => {
    setState({
      ...state,
      tools: [...state.tools, { id: crypto.randomUUID(), name: AVAILABLE_TOOLS[0], plan: "", spend: 0, seats: 1 }]
    });
  };

  const updateTool = (id: string, field: keyof ToolEntry, value: any) => {
    setState({
      ...state,
      tools: state.tools.map(t => t.id === id ? { ...t, [field]: value } : t)
    });
  };

  const removeTool = (id: string) => {
    setState({ ...state, tools: state.tools.filter(t => t.id !== id) });
  };

  const handleRunAudit = () => {
    const generatedReport = runAudit(state);
    setReport(generatedReport);
  };

  if (!mounted) return null;

  // ==========================================
  // VIEW 2: THE RESULTS DASHBOARD
  // ==========================================
  if (report) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] animate-in fade-in zoom-in-95 duration-500">
        
        {/* HERO SECTION */}
        <div className="text-center mb-12">
          <h2 className="text-xl font-medium text-slate-400 tracking-widest uppercase mb-4">Your AI Spend Audit</h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8">
            <div className="p-6 bg-black/30 rounded-3xl border border-white/5 w-full md:w-1/2">
              <p className="text-sm text-slate-400 font-semibold mb-2">POTENTIAL MONTHLY SAVINGS</p>
              <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                ${report.totalMonthlySavings.toFixed(2)}
              </p>
            </div>
            <div className="p-6 bg-black/30 rounded-3xl border border-white/5 w-full md:w-1/2">
              <p className="text-sm text-slate-400 font-semibold mb-2">ANNUALIZED SAVINGS</p>
              <p className="text-5xl font-black text-white">
                ${report.totalAnnualSavings.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* BREAKDOWN SECTION */}
        <div className="mb-12">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            Line-Item Breakdown
          </h3>
          
          {report.recommendations.length === 0 ? (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center">
              <p className="text-emerald-400 font-medium text-lg">You're spending well!</p>
              <p className="text-slate-400 mt-2">We couldn't find any obvious waste in your current stack. Your team is highly optimized.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {report.recommendations.map((rec, idx) => (
                <div key={idx} className="p-6 bg-black/20 border border-white/5 rounded-2xl flex flex-col md:flex-row gap-6 items-start md:items-center">
                  <div className="flex items-center gap-4 min-w-[200px]">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      {getToolIcon(rec.toolName)}
                    </div>
                    <div>
                      <p className="text-white font-bold">{rec.toolName}</p>
                      <p className="text-sm text-slate-400">Current: ${rec.currentSpend.toFixed(2)}/mo</p>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-rose-400 font-bold text-sm tracking-wide uppercase mb-1">{rec.recommendedAction}</p>
                    <p className="text-slate-300 text-sm leading-relaxed">{rec.reasoning}</p>
                  </div>

                  <div className="text-right min-w-[120px]">
                    <p className="text-xs text-slate-500 font-bold tracking-wider mb-1">SAVINGS</p>
                    <p className="text-2xl font-black text-emerald-400">+${rec.savingsMonthly.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* LEAD CAPTURE SECTION (Fulfills the Assignment Logic) */}
        <div className="p-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-3xl text-center">
          {report.totalMonthlySavings > 500 ? (
            <>
              <h3 className="text-2xl font-bold text-white mb-3">Don't leave ${report.totalAnnualSavings.toFixed(0)} on the table.</h3>
              <p className="text-indigo-200 mb-6 max-w-xl mx-auto">Your infrastructure footprint is large enough to qualify for wholesale credit pooling. Book a Credex consultation to capture these savings.</p>
              <div className="flex justify-center max-w-md mx-auto gap-2">
                <input type="email" placeholder="founder@startup.com" className="flex-1 bg-black/40 border border-indigo-500/30 rounded-xl p-3 text-white focus:outline-none focus:border-indigo-400" />
                <button className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl transition-colors">Book Consult</button>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-xl font-bold text-white mb-2">Want to stay optimized?</h3>
              <p className="text-slate-400 mb-6 text-sm">AI pricing changes weekly. Drop your email and we'll notify you when cheaper alternatives to your specific stack launch.</p>
              <div className="flex justify-center max-w-md mx-auto gap-2">
                <input type="email" placeholder="name@company.com" className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-white/30" />
                <button className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold rounded-xl transition-colors">Notify Me</button>
              </div>
            </>
          )}
        </div>

        <button onClick={() => setReport(null)} className="w-full mt-6 py-4 text-slate-400 hover:text-white text-sm font-medium transition-colors">
          ← Edit Stack & Recalculate
        </button>
      </div>
    );
  }

  // ==========================================
  // VIEW 1: THE INPUT FORM (Original Code)
  // ==========================================
  return (
    <div className="w-full max-w-3xl mx-auto p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] transition-all duration-500 ease-out">
      
      {/* Global Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300 tracking-wide">TEAM SIZE</label>
          <input 
            type="number" min="1"
            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            value={state.teamSize}
            onChange={(e) => setState({...state, teamSize: parseInt(e.target.value) || 1})}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300 tracking-wide">PRIMARY USE CASE</label>
          <select 
            className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all appearance-none capitalize"
            value={state.useCase}
            onChange={(e) => setState({...state, useCase: e.target.value})}
          >
            {USE_CASES.map(uc => <option key={uc} value={uc} className="bg-slate-900">{uc}</option>)}
          </select>
        </div>
      </div>

      {/* Tool List */}
      <div className="space-y-4 mb-8">
        {state.tools.map((tool) => (
          <div key={tool.id} className="group relative p-5 bg-black/20 hover:bg-black/40 border border-white/5 hover:border-white/20 rounded-2xl flex flex-wrap gap-4 items-center transition-all duration-300 shadow-sm hover:shadow-lg">
            
            <div className="flex-1 min-w-[200px] flex items-center space-x-3">
              <div className="p-2 bg-white/5 rounded-lg border border-white/5 shadow-inner">
                {getToolIcon(tool.name)}
              </div>
              <div className="w-full">
                <label className="block text-[10px] font-bold text-slate-400 tracking-wider mb-1">TOOL</label>
                <select 
                  className="w-full bg-transparent border-none text-white font-medium p-0 focus:ring-0 appearance-none cursor-pointer"
                  value={tool.name}
                  onChange={(e) => updateTool(tool.id, "name", e.target.value)}
                >
                  {AVAILABLE_TOOLS.map(t => <option key={t} value={t} className="bg-slate-900">{t}</option>)}
                </select>
              </div>
            </div>
            
            <div className="w-24">
              <label className="block text-[10px] font-bold text-slate-400 tracking-wider mb-1">PLAN</label>
              <input 
                type="text" placeholder="e.g. Pro"
                className="w-full bg-transparent border-none text-white p-0 focus:ring-0 placeholder-slate-600"
                value={tool.plan}
                onChange={(e) => updateTool(tool.id, "plan", e.target.value)}
              />
            </div>

            <div className="w-20">
              <label className="block text-[10px] font-bold text-slate-400 tracking-wider mb-1">SEATS</label>
              <input 
                type="number" min="1"
                className="w-full bg-transparent border-none text-white p-0 focus:ring-0"
                value={tool.seats}
                onChange={(e) => updateTool(tool.id, "seats", parseInt(e.target.value) || 1)}
              />
            </div>

            <div className="w-24">
              <label className="block text-[10px] font-bold text-slate-400 tracking-wider mb-1">SPEND ($)</label>
              <input 
                type="number" min="0" step="0.01"
                className="w-full bg-transparent border-none text-white p-0 focus:ring-0"
                value={tool.spend}
                onChange={(e) => updateTool(tool.id, "spend", parseFloat(e.target.value) || 0)}
              />
            </div>

            <button 
              onClick={() => removeTool(tool.id)}
              className="absolute -right-3 -top-3 p-2 bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
      </div>

      <button 
        onClick={addTool}
        className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 border-dashed rounded-2xl text-slate-300 font-medium tracking-wide transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] mb-6 flex justify-center items-center gap-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        Add Subscription
      </button>

      <button 
        onClick={handleRunAudit}
        className="relative w-full overflow-hidden rounded-2xl group"
      >
        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-90 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative py-4 px-6 text-white font-bold tracking-wide text-lg">
          Run Spend Audit
        </div>
      </button>

    </div>
  );
}