import SpendForm from "@/components/SpendForm";

export default function Home() {
  return (
    <main className="min-h-screen py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative max-w-4xl mx-auto text-center mb-16">
        <div className="inline-block px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-semibold tracking-wider mb-6">
          CREDEX AUDIT ENGINE
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight mb-6">
          Stop overpaying for AI.
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light">
          Enter your stack below to see if you&apos;re on the wrong plans, using overlapping tools, or missing out on infrastructure credits.
        </p>
      </div>
      
      <div className="relative z-10">
        <SpendForm />
      </div>
    </main>
  );
}