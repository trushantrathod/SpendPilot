# Target Profile User Research & Insights

To ensure the SpendPilot architecture solved a genuine problem, I conducted three 10-15 minute diagnostic interviews with peers currently managing software development projects.

---

## Interview 1: Tejas Rathod
* **Role & Stage:** Independent Developer / Solo Founder, currently bootstrapping two SaaS side-projects.
* **Direct Quotes:**
  1. *"Honestly, I just sign up for whatever free tier is available until the rate limits break, then I panic-upgrade to Pro."*
  2. *"I'm paying $20 for ChatGPT Plus and $20 for Cursor, and I'm pretty sure I don't even use half the limits on either of them."*
  3. *"If an app told me I was wasting money, I’d probably ignore it unless it showed me the exact button to click to downgrade or switch."*
* **The Most Surprising Insight:** Solo developers do not care about "optimizing" until their monthly bill crosses a psychological threshold (usually around $50/mo). Below that, the convenience of overlapping tools outweighs the cost.
* **What it Changed About My Design:** I realized that pushing a "consultation" to a solo dev saving $20 is terrible UX. I updated the audit engine logic to only trigger the Credex consultation CTA for audits showing >$500 in savings, routing smaller accounts to a simple email newsletter instead.

---

## Interview 2: Shreya Chaudhari
* **Role & Stage:** Technical Lead / Computer Engineering Student building active hackathon and open-source projects.
* **Direct Quotes:**
  1. *"Whenever we form a team, everyone just brings their own API keys, and we end up hitting limits on individual accounts instead of pooling them."*
  2. *"I didn't even realize GitHub Copilot had different organizational tiers until we got locked out of a student pack."*
  3. *"The hardest part isn't knowing we are overspending; it's figuring out which LLM is actually necessary for the specific backend tasks we are running."*
* **The Most Surprising Insight:** A lot of shadow-spending happens because team members default to using their personal, retail-priced accounts for collaborative projects instead of setting up a centralized organization tier.
* **What it Changed About My Design:** I added a specific "Team Size" input multiplier in the form. The engine now calculates if a team is paying retail for individual seats and automatically recommends shifting to a centralized API or wholesale pool if the headcount justifies it.

---

## Interview 3: Akash Singh
* **Role & Stage:** Junior Engineering Manager, Series A B2B Startup (team of ~15 developers).
* **Direct Quotes:**
  1. *"Finance asked me for a breakdown of our OpenAI API costs last month, and I literally just sent them a screenshot of our usage dashboard because I couldn't make sense of the token math."*
  2. *"We hand out Cursor Pro licenses like candy during onboarding. I know for a fact three of our front-end guys haven't used the AI features in weeks."*
  3. *"I would use an audit tool, but I am absolutely not uploading our corporate billing CSVs to a random website."*
* **The Most Surprising Insight:** The absolute lack of trust regarding financial data. Engineering managers are desperate for cost visibility but are terrified of data leaks.
* **What it Changed About My Design:** This entirely shaped the UX of the input form. I scrapped the idea of OAuth or uploading billing invoices. The tool only asks for manual, aggregate, anonymized numbers up front, and I explicitly state on the page that no corporate data is stored without permission.