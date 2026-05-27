## Day 1 2026-05-21
**Hours worked:** 1.5
**What I did:** Initialized the Next.js/TypeScript repository, set up Tailwind CSS, created all 12 required project markdown files, and configured the GitHub Actions CI pipeline.
**What I learned:** How to structure a root directory specifically for automated evaluator LLMs to parse the required business and engineering files.
**Blockers / what I'm stuck on:** None yet, though I need to source the accurate pricing data tomorrow.
**Plan for tomorrow:** Build the MVP spend input form UI and hunt down the official pricing pages for all required AI tools.

## Day 2 2026-05-22
**Hours worked:** 3.5
**What I did:** - Sent out 5 outreach DMs to founders/engineers to schedule the required user interviews for this weekend.
- Sourced and documented all official pricing data for the 8 required AI tools in `PRICING_DATA.md`. 
- Built the persistent input form in Next.js using `localStorage` to retain state across reloads.
- Engineered `lib/auditEngine.ts` (Feature 2) with defensible financial math to identify redundant tool overlap (e.g., ChatGPT + Cursor for coding) and inefficient per-seat licensing.
- Built a premium dark-mode, glassmorphic Results Dashboard (Feature 3) that dynamically displays line-item savings and pitches Credex if savings exceed $500/mo.

**What I learned:** Handling Next.js hydration mismatches requires a specific `useEffect` mounting strategy when reading from `localStorage`. I also learned how to resolve compatibility issues with the brand new Tailwind v4 compiler by replacing `@tailwind base` with the new `@import "tailwindcss";` directive.

**Blockers / what I'm stuck on:** None. The UI transitions smoothly and the financial math is calculating exactly as expected.

**Plan for tomorrow:** Integrate an LLM API (Anthropic or Gemini) to generate the personalized ~100-word audit summary (Feature 4), ensure it has a graceful fallback mechanism if the API fails, and draft the 5 mandatory automated tests for the audit engine.

## Day 3 and 4 2026-05-23 / 2026-05-24
**Hours worked:** 3.0
**What I did:** - Built the Results Dashboard (Feature 3) with a 3-tier dynamic lead capture form based on the user's calculated savings.
- Engineered `app/api/generate-summary/route.ts` to securely handle AI requests on the server side.
- Integrated the Google Gemini SDK (`gemini-2.5-flash`) to generate a highly personalized, 100-word executive summary (Feature 4).
- Implemented graceful API failure handling by hardcoding a fallback summary if the LLM request fails.
- Documented my prompt engineering strategy in `PROMPTS.md`.

**What I learned:** I learned how to securely handle API keys in Next.js by routing requests through a server-side endpoint rather than exposing the key in the React client. I also learned that passing pre-calculated math to an LLM prevents it from hallucinating financial data.

**Blockers / what I'm stuck on:** Navigating Google's model versions took some debugging (had to switch from `gemini-1.5-flash` to `gemini-2.5-flash` to resolve a 404 error based on API key provisioning).

**Plan for tomorrow:** Build Feature 5: The Backend Lead Capture. I will set up a database to securely store the emails users submit when they want to save their audit or get notified of future savings.

## Day 5 2026-05-25
**Hours worked:** 2.5
**What I did:** - Set up a Firebase project and integrated Firestore to securely capture and store user leads (Feature 5).
- Implemented an invisible "Honeypot" form field as a frictionless, zero-dependency method for basic abuse protection.
- Integrated the Resend SDK and created a secure Next.js API route (`app/api/send-email/route.ts`) to handle transactional emails.
- Engineered dynamic email templates that automatically switch between "Standard" and "High Savings" messaging based on the user's calculated $500 threshold.
- Finalized UI success states and cleaned up unused boilerplate files (SVG logos).

**What I learned:** I learned how to securely chain server-side API calls in Next.js (saving to Firebase, then pinging Resend). I also learned that a simple honeypot is often a much better UX choice for MVP abuse protection than forcing users to solve an hCaptcha. Finally, I learned about Resend's free tier domain limitations and how to test transactional emails properly.

**Blockers / what I'm stuck on:** The MVP is officially complete! The only minor hurdle today was ensuring Tailwind v4 compiled correctly without third-party plugins by extracting custom CSS `@keyframes` and standardizing pseudo-classes.

**Plan for tomorrow:** Submit the final assignment repo, start reviewing the feedback from my user interviews, and take a well-deserved break!

## Day 6 2026-05-26

**Hours worked:** 2.0
**What I did:** - Engineered the "Viral Loop" by creating a dynamic, shareable public report URL (Feature 6).
- Updated the Firebase payload to store the full stack configuration and recommendation array so the public link has data to render.
- Built a server-side rendered public route (`app/report/[id]/page.tsx`) that fetches data via the Firebase REST API to bypass complex client-side SDK auth.
- Implemented dynamic Open Graph (OG) and Twitter Card metadata for rich social media link previews, automatically injecting the user's calculated savings.
- Ensured strict data privacy on the public route by explicitly stripping out the user's email and company name.
- Upgraded dynamic routing logic to comply with Next.js 15's new asynchronous `Promise`-based `params` API.

**What I learned:** I learned how powerful server-side rendering is for SEO and social sharing (OG tags). I also learned how to use a REST API to fetch Firebase data on the server, and how Next.js 15 handles dynamic route parameters differently than Next.js 14 by requiring `await params`. 

**Blockers / what I'm stuck on:** I hit a 404 error when setting up the dynamic route because I accidentally placed the `report` folder inside the `api` directory, which confused the Next.js App Router. I also hit a minor build error due to the Next.js 15 `Promise` update, but quickly debugged and resolved both issues.

Additional Debugging: My GitHub Actions CI pipeline failed during the ESLint step due to TypeScript and React linting issues, including usage of any, unescaped apostrophes in JSX, and unused variables. I resolved the issues by replacing unsafe types, escaping special characters properly, and cleaning unused code to restore a successful production build.
