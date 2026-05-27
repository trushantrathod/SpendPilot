# Engineering Reflection & Self-Assessment

## 1. The hardest bug hit this week and the diagnostic process
The most stubborn obstacle encountered during this sprint was a silent data-fetching failure on the dynamic public report page (`app/report/[id]/page.tsx`). Initially, I leveraged the standard Firebase Client SDK within a `useEffect` hook to fetch saved lead data. While this worked perfectly on localhost, it completely broke when deployed onto Vercel, throwing a generic 404/500 error cascade on initial page rendering. 

My initial hypothesis was that the environment variables were not being injected properly at runtime into the client bundle. After executing a series of server-side `console.log` deep-dives, I discovered that the environment keys were populated, but the Vercel serverless functions were timing out because the client-side Firebase authentication listeners were blocking the component from resolving during initial generation. 

To resolve this, I completely shifted the fetching architecture away from the client SDK. I formulated a new hypothesis: hitting the raw Google Firestore REST API via standard server-side `fetch` would bypass the client bundle overhead entirely. I refactored the function to use an asynchronous server-side fetch layout hitting: `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/leads/${id}`. This immediately solved the problem, drastically minimized the bundled JavaScript payload sent to the client, and ensured that the open-graph scrapers could parse the static metadata flawlessly.

## 2. An engineering decision reversed mid-week and the justification
Midway through the sprint, I initially architected the audit engine (`lib/auditEngine.ts`) to lean on live asynchronous AI evaluations via the Google Gemini API to dynamically determine if a user's tool layout was unoptimized. My rationale was that an LLM would effortlessly catch messy or unpredictable input variations from the text fields. 

However, during active integration testing, I reversed this decision entirely and moved to a purely deterministic, hardcoded programmatic rule model. The reversal was driven by two core flaws: latency spikes and execution unpredictability (hallucinations). During testing, Gemini would occasionally state that a $20 Cursor plan could be downgraded to a nonexistent $5 tier, or it would provide inconsistent calculation math for the exact same inputs. 

In a financial auditing application, precision is paramount to build user trust. If a financial officer reads an audit that hallucinates baseline costs, the entire product's validity drops to zero. By moving to strict, deterministic control conditional branches (e.g., explicitly tracking if a team size uses multiple distinct IDE tools simultaneously), I guaranteed absolute mathematical precision, drastically reduced server-side processing lag, and avoided hitting external API rate limits entirely.

## 3. Scope expansion: What to build in Week 2
If granted an expansion sprint into Week 2, the development roadmap would prioritize implementing programmatic automated reporting transformations and benchmarking:
* **Asynchronous Server-Driven PDF Rendering:** Constructing a dedicated API endpoint using `puppeteer-core` or `@react-pdf/renderer` to let users convert their on-screen breakdown into a presentation-ready PDF report instantly with one click.
* **Granular Benchmark Metrics Engine:** Transitioning the platform from a flat rule evaluator to an aggregate benchmarking ecosystem. The tool will calculate the exact developer spend per seat and display a comparison dial against curated industry averages based on the company's operational lifecycle phase (e.g., "Your team spends 23% more on AI subscriptions than the average Series A startup"). This heightens the emotional trigger to book a high-savings consultation with Credex.

## 4. AI Tool Collaboration & Disclosure
Throughout this sprint, I actively utilized Cursor and Claude 3.5 Sonnet to accelerate structural code composition. AI tools were predominantly tasked with scaffolding the boilerplate SVG icons, generating standard HTML interface layouts, and constructing complex Tailwind v4 keyframe animations. 

I explicitly chose *not* to trust the AI tools with the architectural database separation logic or the core priority rules inside the math engine. AI engines routinely misinterpret conditional hierarchies when multiple variables cross over (like checking team size, use-case alignment, and specific vendor spend simultaneously), which frequently leads to double-counting optimization savings. 

A specific instance where the AI hallucinated occurred when configuring the dynamic dynamic routing for Next.js 15. The AI generated a synchronous parameter read layout (`params.id`), entirely unaware that Next.js 15 treats dynamic parameters as native asynchronous Promises. This resulted in an application crash. I immediately identified the version mismatch, caught the warning flags, and refactored the code to use the modern asynchronous `await params` syntax.

## 5. Structured Competency Self-Rating
* **Discipline: 9/10** — Maintained a highly structured daily development cadence across 6 distinct calendar days, tracking progress cleanly via conventional commits rather than single-day rushing.
* **Code Quality: 9/10** — Maintained strict TypeScript typings throughout, moving styles out of React strings and into structured global CSS layers to support caching.
* **Design Sense: 8/10** — Created a modern, premium glassmorphism interface with smooth user interaction feedback loops, though mobile data-grid rendering still has minor padding edge-cases.
* **Problem Solving: 9/10** — Swiftly diagnosed Next.js 15 breaking changes and bypassed Firebase initialization hurdles by pivoting to raw REST API requests.
* **Entrepreneurial Thinking: 10/10** — Understood that showing free upfront value before dropping an email gate maximizes B2B conversions and turns a simple audit into a highly efficient customer-acquisiti