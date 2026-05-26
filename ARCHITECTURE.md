# Architectural Decisions & Justifications

## 1. Frontend Framework: Next.js 15 (App Router)
I chose Next.js over vanilla React or SPA frameworks (like Vite/Vue) primarily for **Server-Side Rendering (SSR)** and **API Route encapsulation**.
* **Viral Loop Requirement:** Requirement #6 demands Open Graph tags for shareable URLs. An SPA cannot dynamically generate OG tags based on fetched data because crawlers (like Twitter/Slack bots) do not execute client-side JavaScript. Next.js 15 allows me to fetch the Firebase report data on the server and inject dynamic metadata before the HTML is sent to the crawler.
* **Security:** I needed to integrate the Google Gemini API and Resend SDK. Doing this in a standard React SPA exposes API keys to the browser. Next.js Server Components and Route Handlers keep these secrets entirely server-side.

## 2. Language: TypeScript
TypeScript was chosen over vanilla JavaScript to ensure strict type safety across the application boundary. 
* By defining strict `interface` models for the `ToolEntry` and `AuditReport`, I eliminated runtime errors in the math-heavy `auditEngine.ts`. 
* It ensures the data payload sent from the client exactly matches the schema expected by the Firebase database and the Next.js API routes.

## 3. Styling: Tailwind CSS v4 (Zero UI Libraries)
I avoided heavy component libraries (MUI, Chakra) and pre-built dashboard templates. I built a custom design system using utility-first Tailwind CSS. 
* **Performance:** Tailwind compiles down to only the exact CSS classes used, ensuring the smallest possible CSS payload to easily pass the >=85 Lighthouse Performance constraint.
* **Maintainability:** All complex animations (glassmorphism, staggered list entrances) are contained within `globals.css` using standard CSS variables and keyframes, keeping the React components clean and focused purely on logic.

## 4. Abuse Protection: CSS Honeypot
Rather than introducing heavy third-party dependencies and UX friction via Google reCAPTCHA or hCaptcha, I implemented a frictionless CSS Honeypot. 
* A hidden input field traps automated bot scripts (which scrape and fill all `<input>` tags). If the field is populated upon submission, the server silently aborts the database write and returns a false success state. This provides robust basic spam protection with zero impact on Lighthouse performance scores or user experience.