# AI Tool Pricing Data & Logic Assumptions
*Data current as of May 2026 for Credex / SpendPilot MVP submission.*

## Baseline Pricing References
To ensure our audit engine calculations are defensible, we utilize the current retail pricing for the industry's leading AI tools. 

* **ChatGPT (OpenAI):** * Plus: $20/user/month
    * Team: $25 - $30/user/month
    * *Source: https://openai.com/api/pricing/
* **Claude (Anthropic):**
    * Pro: $20/user/month
    * *Source: https://platform.claude.com/docs/en/about-claude/pricing
* **Cursor:**
    * Pro: $20/user/month
    * *Source: https://cursor.com/pricing
* **GitHub Copilot:**
    * Individual: $10/user/month
    * Business: $19/user/month
    * *Source: https://github.com/features/copilot/plans

## Audit Engine Logic & Defensibility
Our `lib/auditEngine.ts` uses strict, mutually exclusive priority rules based on this data:

1.  **Rule 1: 100% Cancellation (Redundancy)**
    * *Logic:* If a team is paying for an IDE-integrated LLM (Cursor or Copilot) for a "coding" use case, a standalone ChatGPT Plus/Team subscription is computationally redundant for those specific developers. 
    * *Calculation:* 100% of the redundant tool's monthly spend is marked as savings.
2.  **Rule 2: 40% API Migration (Enterprise Scale)**
    * *Logic:* Paying retail ($20/user) for Chat UIs at scale (>10 users, >$300 spend) is highly inefficient compared to direct API consumption or wholesale credit pooling (via Credex).
    * *Calculation:* We estimate a conservative 40% reduction in overhead when migrating from per-seat retail to bulk API infrastructure.
3.  **Rule 3: Overkill Plan Downgrade**
    * *Logic:* A single user (1 seat) utilizing a "Team" or "Business" tier is over-provisioned. 
    * *Calculation:* We calculate savings by finding the delta between their current spend and the industry-standard Pro baseline of $20/month.