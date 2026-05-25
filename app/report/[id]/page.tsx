import { Metadata } from "next";
import { notFound } from "next/navigation";

// Define the Next.js 15 expected type where params is a Promise
type Props = {
  params: Promise<{ id: string }>;
};

async function getPublicReport(id: string) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/leads/${id}`;
  
  try {
    const res = await fetch(url, { next: { revalidate: 60 } }); 
    if (!res.ok) return null;
    const data = await res.json();
    return data.fields;
  } catch (e) { 
    return null; 
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // 1. Await the params promise (Next.js 15 requirement)
  const resolvedParams = await params;
  
  // 2. Now we can safely use the ID
  const report = await getPublicReport(resolvedParams.id);
  
  if (!report) return { title: "Report Not Found" };

  const savings = report.totalSpend?.doubleValue || report.totalSpend?.integerValue || "0";
  const teamSize = report.teamSize?.integerValue || "a team";

  return {
    title: `AI Spend Audit | Saved $${savings}/mo`,
    description: `We optimized our AI tool stack for ${teamSize} people and found $${savings} in monthly savings using Credex.`,
    openGraph: {
      title: `AI Spend Audit | Saved $${savings}/mo`,
      description: `Credex identified $${savings}/mo in wasted AI subscription spend. View the anonymized breakdown.`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `I just saved $${savings}/mo on AI tools!`,
      description: `Credex audited our AI stack and found massive savings. Check the breakdown.`,
    },
  };
}

export default async function PublicReportPage({ params }: Props) {
  // 1. Await the params promise here too
  const resolvedParams = await params;
  const report = await getPublicReport(resolvedParams.id);
  
  if (!report) notFound();

  const savings = report.totalSpend?.doubleValue || report.totalSpend?.integerValue || 0;
  const teamSize = report.teamSize?.integerValue || 1;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center py-16 px-4">
      <div className="w-full max-w-3xl p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-10">
          <div className="inline-block px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold tracking-widest uppercase rounded-full mb-6">
            Anonymized Public Report
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">AI Infrastructure Audit</h1>
          <p className="text-slate-400">Team Size: {teamSize} Members</p>
        </div>
        
        <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-12">
          <div className="p-6 bg-black/30 rounded-3xl border border-white/5 w-full md:w-1/2 text-center">
            <p className="text-sm text-slate-400 font-semibold mb-2">IDENTIFIED MONTHLY SAVINGS</p>
            <p className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              ${Number(savings).toFixed(2)}
            </p>
          </div>
        </div>
        
        <div className="p-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-3xl text-center">
          <h3 className="text-xl font-bold text-white mb-2">Run your own audit for free.</h3>
          <p className="text-slate-400 mb-6 text-sm">Are you paying for overlapping AI tools like ChatGPT, Claude, and Copilot? Find out in 30 seconds.</p>
          <a href="/" className="inline-block px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-xl transition-colors">
            Audit My AI Stack
          </a>
        </div>
      </div>
    </div>
  );
}