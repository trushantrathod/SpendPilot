# AI Prompt Configuration

**Model Used:** Google Gemini (`gemini-2.5-flash`)
**Implementation:** Secure server-side execution via Next.js Route Handlers (`app/api/generate-summary/route.ts`).
**Fallback Mechanism:** If the API times out or fails, the frontend catches the error and gracefully degrades to a hardcoded, professional text string to ensure zero UI breakage.

## The Executive Summary Prompt
This prompt is dynamically injected with the user's calculated state (`teamSize`, `totalSpend`, and `totalMonthlySavings`) before being sent to the LLM. It strictly enforces length and formatting constraints.

\`\`\`text
You are an expert SaaS financial auditor. Write a 80-100 word executive summary for a company with ${state.teamSize} employees. 

Their total monthly AI spend is $${state.tools.reduce((acc: number, t: any) => acc + t.spend, 0)}.
We found $${report.totalMonthlySavings} in potential monthly savings by recommending they cancel certain tools.

Write a compelling, professional summary of these findings. Do NOT use bullet points. Do NOT include greetings or sign-offs. Be direct and analytical.
\`\`\`