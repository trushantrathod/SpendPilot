```markdown
# SpendPilot (Credex AI Stack Auditor)

SpendPilot is a lead-generation auditing web application designed for startup founders and engineering managers to uncover hidden overspending and redundancies within their AI infrastructure. Acting as a "Mint for AI tool spend," it allows users to input their current subscriptions and instantly receive a financial breakdown, alternative recommendations, and a path to wholesale credit pooling via Credex.

## Live Application
* **Production Deployed URL:** https://spend-pilot-git-main-trushants-projects-c8717afb.vercel.app/

## Quick Start Guide

### 1. Local Development Setup
Ensure you have Node.js 18+ installed on your local machine.

```bash
# Clone the repository
git clone [https://github.com/trushantrathod/SpendPilot.git]
cd spend-pilot

# Install dependency tree
npm install

```

Configure your local environmental variables by creating a `.env.local` file in the root directory:

```text
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
GEMINI_API_KEY=your_google_gemini_api_key
RESEND_API_KEY=your_resend_api_key

```

```bash
# Boot the local Next.js development server
npm run dev

```

Navigate to `http://localhost:3000` to interact with the application.

### 2. Running the Test Suite

The deterministic financial engine is audited using isolated unit test configurations.

```bash
# Execute unit testing suite via Jest
npm run test

```

### 3. Production Deployment

This platform is architected for instant deployment using the Vercel Edge Network.

1. Push your repository to GitHub.
2. Import the project into Vercel.


3. Add your `NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `GEMINI_API_KEY`, and `RESEND_API_KEY` into the Vercel Environment Variables console.
4. Click **Deploy**.

---

## Decisions: 5 Engineering & Product Trade-Offs

During this 7-day sprint, the following architectural and product decisions were made to balance speed, performance, and reliability:

1. **Deterministic vs. Stochastic Auditing Engine:** I hardcoded the pricing math rules in `lib/auditEngine.ts` instead of using an LLM to parse numbers. **Why:** Financial auditing requires absolute precision and auditability; stochastic LLMs risk calculation hallucination, which destroys user trust. AI was reserved exclusively for the qualitative executive summary.


2. **Server-Side REST Calls over Firebase Client SDK:** To build dynamic public report routes (`/report/[id]`), I chose to utilize native server-side `fetch` hitting the Google Firestore REST API directly instead of initializing the heavy Firebase Client SDK. **Why:** This bypassed complex client-side authentication listeners, minimized bundled JavaScript, and allowed the Open Graph tags to render flawlessly on the server for viral sharing.


3. **Frictionless UI/UX Email Gating:** I built an open entry pipeline where users get full interactive access to the audit engine dashboard completely free without upfront signup. **Why:** The email lead capture field is exclusively injected *after* financial value is proven on-screen. This trade-off risks anonymous API usage but vastly maximizes B2B conversion rates by building upfront trust.


4. **CSS Honeypot over hCaptcha Vendor Packages:** To secure lead generation pipelines from automated spam scripts, I constructed a zero-dependency invisible CSS honeypot rather than using hCaptcha. **Why:** Captchas introduce severe user friction and heavy third-party JavaScript that damages Lighthouse performance scores. A honeypot provides robust basic spam protection while keeping the UI frictionless and Lighthouse scores at 98+.


5. **Next.js 15 Async Routing API Adaptation:** Adopting Next.js 15 introduced a breaking change where dynamic route parameters are structured as native Promises. **Why:** Instead of reverting to Next.js 14, I refactored the infrastructure to explicitly handle `await params` within server-side components. This trade-off required slightly more complex data-fetching logic but ensured the application is built on the most modern, future-proof Next.js architecture.
