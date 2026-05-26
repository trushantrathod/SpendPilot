# Product Performance & Telemetry Architecture

## 1. The Core North Star Metric
The absolute North Star Metric for SpendPilot is **Total Quantifiable Financial Savings Identified (Monthly Run-Rate)**[cite: 208]. 

Because this application acts as a B2B lead generation loop for Credex, traditional consumer metrics like Daily Active Users (DAU) or Session Length are completely irrelevant—founders use an audit tool once a quarter, not every morning[cite: 30, 213]. Our success is defined by how much financial waste we uncover, because discovering significant waste is what directly drives high-value consultations into the Credex pipeline[cite: 30, 212].

## 2. Supporting Input Metrics
To shift our North Star Metric, we monitor and optimize three specific upstream input drivers[cite: 209]:
* **Average Tool Stack Complexity Density:** The total count of active tools submitted per audit sequence[cite: 37]. Higher density increases the mathematical probability of finding software redundancies and overlap.
* **Email Conversion Acquisition Yield:** The statistical percentage of visitors who complete an audit and pass through our email lead capture gate.
* **High-Ticket Consultation Velocity:** The absolute volume of audits that trigger savings $\ge \$500/\text{mo}$ and successfully schedule a strategic call[cite: 70].

## 3. Immediate Instrumentation Plan
During our initial implementation loop, we are integrating post-load telemetry hooks to monitor early user traction:
* **Form Engagement Funnel Dropout:** Tracking the exact input stage where users drop out to see if entering things like seats or spend causes too much friction[cite: 53].
* **Clipboard Interaction Tracker:** Monitoring clicks on the "Copy shareable public URL" button to measure how well our viral loops are performing[cite: 40, 93].

## 4. Analytical Pivot Conditions
We have established a clear metric threshold to drive strategic adjustments: If our **Email Conversion Yield drops below 15% across 500 consecutive unique sessions**, it signals that the landing page or results layout lacks immediate perceived value. This metric drop will instantly trigger a product pivot, shifting our layout from a text-heavy dashboard to a visual, infographic-style PDF export view to drive stronger user engagement[cite: 95, 211].