import { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

async function getPublicReport(id: string) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/leads/${id}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.fields;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const report = await getPublicReport(resolvedParams.id);

  if (!report) {
    return {
      title: "Report Not Found",
    };
  }

  const savings =
    report.totalSpend?.doubleValue ||
    report.totalSpend?.integerValue ||
    "0";

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
      description:
        "Credex audited our AI stack and found massive savings. Check the breakdown.",
    },
  };
}

export default async function PublicReportPage({
  params,
}: Props) {
  const resolvedParams = await params;
  const report = await getPublicReport(resolvedParams.id);

  if (!report) notFound();

  const savings =
    report.totalSpend?.doubleValue ||
    report.totalSpend?.integerValue ||
    0;

  const teamSize =
    report.teamSize?.integerValue || 1;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl shadow-2xl">
        <div className="mb-10 text-center">
          <div className="mb-5 inline-block rounded-full border border-indigo-500/30 bg-indigo-500/20 px-3 py-1 text-xs font-bold uppercase tracking-widest text-indigo-300">
            Anonymized Public Report
          </div>

          <h1 className="mb-2 text-3xl font-bold text-white">
            AI Infrastructure Audit
          </h1>

          <p className="text-slate-400">
            Team Size: {teamSize} Members
          </p>
        </div>

        <div className="mb-12 rounded-3xl border border-white/5 bg-black/30 p-8 text-center">
          <p className="mb-3 text-sm font-semibold text-slate-400">
            IDENTIFIED MONTHLY SAVINGS
          </p>

          <p className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-5xl font-black text-transparent">
            ${Number(savings).toFixed(2)}
          </p>
        </div>

        <div className="rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-8 text-center">
          <h3 className="mb-2 text-xl font-bold text-white">
            Run your own audit for free.
          </h3>

          <p className="mb-6 text-sm text-slate-400">
            Are you paying for overlapping AI tools like ChatGPT,
            Claude, and Copilot? Find out in 30 seconds.
          </p>

          <a
            href="/"
            className="inline-block rounded-xl bg-indigo-500 px-8 py-4 font-bold text-white transition-colors hover:bg-indigo-400"
          >
            Audit My AI Stack
          </a>
        </div>
      </div>
    </div>
  );
}