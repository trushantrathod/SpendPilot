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
  "Cursor",
  "GitHub Copilot",
  "Claude",
  "ChatGPT",
  "Gemini",
  "v0",
  "OpenAI API",
  "Anthropic API",
];

const USE_CASES = [
  "coding",
  "writing",
  "data",
  "research",
  "mixed",
];

const getInitialState = (): FormState => {
  if (typeof window === "undefined") {
    return {
      teamSize: 1,
      useCase: "mixed",
      tools: [],
    };
  }

  try {
    const saved = localStorage.getItem("spendpilot_state");

    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    console.error("Failed to parse localStorage state");
  }

  return {
    teamSize: 1,
    useCase: "mixed",
    tools: [],
  };
};

const getToolIcon = (name: string) => {
  switch (name) {
    case "ChatGPT":
    case "OpenAI API":
      return (
        <svg
          className="w-5 h-5 text-emerald-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      );

    case "Claude":
    case "Anthropic API":
      return (
        <svg
          className="w-5 h-5 text-amber-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      );

    default:
      return (
        <div className="w-5 h-5 rounded-full bg-slate-700" />
      );
  }
};

function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    let animId: number;

    let W = window.innerWidth;
    let H = window.innerHeight;

    canvas.width = W;
    canvas.height = H;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;

      canvas.width = W;
      canvas.height = H;
    };

    window.addEventListener("resize", resize);

    const orbs = Array.from({ length: 6 }, (_, i) => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 180 + Math.random() * 220,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      hue: [258, 280, 210, 160, 320, 230][i],
      alpha: 0.06 + Math.random() * 0.05,
    }));

    const tick = () => {
      ctx.clearRect(0, 0, W, H);

      orbs.forEach((o) => {
        o.x += o.vx;
        o.y += o.vy;

        const g = ctx.createRadialGradient(
          o.x,
          o.y,
          0,
          o.x,
          o.y,
          o.r
        );

        g.addColorStop(
          0,
          `hsla(${o.hue},80%,60%,${o.alpha})`
        );

        g.addColorStop(
          1,
          `hsla(${o.hue},80%,60%,0)`
        );

        ctx.fillStyle = g;

        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();
      });

      animId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: "screen" }}
    />
  );
}

export default function SpendForm() {
  const [state, setState] =
    useState<FormState>(getInitialState);

  const [report, setReport] =
    useState<AuditReport | null>(null);

  const [aiSummary, setAiSummary] =
    useState<string | null>(null);

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [submitSuccess, setSubmitSuccess] =
    useState(false);

  const [reportId, setReportId] =
    useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(
      "spendpilot_state",
      JSON.stringify(state)
    );
  }, [state]);

  const addTool = () => {
    setState({
      ...state,
      tools: [
        ...state.tools,
        {
          id: crypto.randomUUID(),
          name: AVAILABLE_TOOLS[0],
          plan: "",
          spend: 0,
          seats: 1,
        },
      ],
    });
  };

  const updateTool = (
    id: string,
    field: keyof ToolEntry,
    value: string | number
  ) => {
    setState({
      ...state,
      tools: state.tools.map((tool) =>
        tool.id === id
          ? { ...tool, [field]: value }
          : tool
      ),
    });
  };

  const removeTool = (id: string) => {
    setState({
      ...state,
      tools: state.tools.filter(
        (tool) => tool.id !== id
      ),
    });
  };

  const handleRunAudit = async () => {
    const generatedReport = runAudit(state);

    setReport(generatedReport);
    setIsGenerating(true);
    setAiSummary(null);
    setSubmitSuccess(false);
    setReportId(null);

    try {
      const response = await fetch(
        "/api/generate-summary",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            state,
            report: generatedReport,
          }),
        }
      );

      const data = await response.json();

      setAiSummary(
        data.summary ||
          "Fallback summary generated."
      );
    } catch (error) {
      console.error(error);

      setAiSummary(
        "Your stack has been audited successfully."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveLead = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (honeypot !== "") {
      setSubmitSuccess(true);
      return;
    }

    if (!email) return;

    setIsSubmitting(true);

    try {
      const docRef = await addDoc(
        collection(db, "leads"),
        {
          email,
          company: company || "Not provided",
          role: role || "Not provided",
          teamSize: state.teamSize,
          totalSpend:
            report?.totalMonthlySavings || 0,
          highSavings:
            (report?.totalMonthlySavings || 0) >=
            500,
          tools: state.tools,
          recommendations:
            report?.recommendations || [],
          createdAt: serverTimestamp(),
        }
      );

      setReportId(docRef.id);

      setSubmitSuccess(true);
    } catch (error) {
      console.error(error);
      alert("Failed to save report.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AnimatedBackground />

      <div className="min-h-screen relative z-10 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl rounded-3xl border border-white/10 bg-slate-900/70 p-8 backdrop-blur-xl">
          <div className="mb-8">
            <h1 className="text-4xl font-black text-white">
              AI Stack Auditor
            </h1>

            <p className="mt-2 text-slate-400">
              Find hidden savings in your AI
              subscriptions
            </p>
          </div>

          {!report ? (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Team Size
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={state.teamSize}
                    onChange={(e) =>
                      setState({
                        ...state,
                        teamSize:
                          parseInt(e.target.value) ||
                          1,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Use Case
                  </label>

                  <select
                    value={state.useCase}
                    onChange={(e) =>
                      setState({
                        ...state,
                        useCase: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white"
                  >
                    {USE_CASES.map((useCase) => (
                      <option
                        key={useCase}
                        value={useCase}
                      >
                        {useCase}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                {state.tools.map((tool) => (
                  <div
                    key={tool.id}
                    className="grid gap-4 rounded-2xl border border-white/10 bg-slate-800/60 p-4 md:grid-cols-5"
                  >
                    <div>
                      <label className="mb-2 block text-xs text-slate-400">
                        TOOL
                      </label>

                      <select
                        value={tool.name}
                        onChange={(e) =>
                          updateTool(
                            tool.id,
                            "name",
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg bg-slate-900 px-3 py-2 text-white"
                      >
                        {AVAILABLE_TOOLS.map((t) => (
                          <option
                            key={t}
                            value={t}
                          >
                            {t}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs text-slate-400">
                        PLAN
                      </label>

                      <input
                        type="text"
                        value={tool.plan}
                        onChange={(e) =>
                          updateTool(
                            tool.id,
                            "plan",
                            e.target.value
                          )
                        }
                        className="w-full rounded-lg bg-slate-900 px-3 py-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs text-slate-400">
                        SPEND
                      </label>

                      <input
                        type="number"
                        value={tool.spend}
                        onChange={(e) =>
                          updateTool(
                            tool.id,
                            "spend",
                            parseFloat(
                              e.target.value
                            ) || 0
                          )
                        }
                        className="w-full rounded-lg bg-slate-900 px-3 py-2 text-white"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-xs text-slate-400">
                        SEATS
                      </label>

                      <input
                        type="number"
                        value={tool.seats}
                        onChange={(e) =>
                          updateTool(
                            tool.id,
                            "seats",
                            parseInt(
                              e.target.value
                            ) || 1
                          )
                        }
                        className="w-full rounded-lg bg-slate-900 px-3 py-2 text-white"
                      />
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={() =>
                          removeTool(tool.id)
                        }
                        className="w-full rounded-lg bg-red-500 px-4 py-2 text-white"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={addTool}
                  className="rounded-xl bg-slate-700 px-5 py-3 font-semibold text-white"
                >
                  Add Tool
                </button>

                <button
                  onClick={handleRunAudit}
                  disabled={state.tools.length === 0}
                  className="rounded-xl bg-indigo-500 px-5 py-3 font-semibold text-white disabled:opacity-50"
                >
                  Run Audit
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-8">
              <div className="rounded-3xl bg-slate-800/70 p-8 text-center">
                <p className="text-sm text-slate-400">
                  IDENTIFIED MONTHLY SAVINGS
                </p>

                <h2 className="mt-3 text-6xl font-black text-emerald-400">
                  $
                  {report.totalMonthlySavings.toFixed(
                    2
                  )}
                </h2>
              </div>

              <div className="rounded-2xl bg-slate-800/60 p-6">
                <h3 className="mb-3 text-xl font-bold text-white">
                  AI Executive Summary
                </h3>

                <p className="text-slate-300">
                  {isGenerating
                    ? "Generating AI summary..."
                    : aiSummary}
                </p>
              </div>

              <form
                onSubmit={handleSaveLead}
                className="space-y-4 rounded-2xl bg-slate-800/60 p-6"
              >
                <input
                  type="text"
                  style={{ display: "none" }}
                  value={honeypot}
                  onChange={(e) =>
                    setHoneypot(e.target.value)
                  }
                />

                <div>
                  <label className="mb-2 block text-sm text-slate-300">
                    Email
                  </label>

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    className="w-full rounded-xl bg-slate-900 px-4 py-3 text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-xl bg-emerald-500 px-6 py-3 font-bold text-white"
                >
                  {isSubmitting
                    ? "Saving..."
                    : "Save Report"}
                </button>
              </form>

              {submitSuccess && (
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-6 text-emerald-300">
                  Report saved successfully.
                  {reportId && (
                    <div className="mt-2">
                      Report ID: {reportId}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}