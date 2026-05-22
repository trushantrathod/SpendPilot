export type ToolEntry = {
  id: string;
  name: string;
  plan: string;
  spend: number;
  seats: number;
};

export type FormState = {
  teamSize: number;
  useCase: string;
  tools: ToolEntry[];
};

export type AuditRecommendation = {
  toolName: string;
  currentSpend: number;
  recommendedAction: string;
  savingsMonthly: number;
  reasoning: string;
};

export type AuditReport = {
  recommendations: AuditRecommendation[];
  totalMonthlySavings: number;
  totalAnnualSavings: number;
};

export function runAudit(data: FormState): AuditReport {
  let recommendations: AuditRecommendation[] = [];
  let totalMonthlySavings = 0;

  const hasCursor = data.tools.some(t => t.name === "Cursor");
  const hasCopilot = data.tools.some(t => t.name === "GitHub Copilot");

  data.tools.forEach(tool => {
    let savings = 0;

    // RULE 1: Overkill Plans (Single user on a Team plan)
    if (tool.seats === 1 && tool.plan.toLowerCase().includes("team")) {
      const standardProCost = 20; // Most Pro plans are $20
      if (tool.spend > standardProCost) {
        savings = tool.spend - standardProCost;
        recommendations.push({
          toolName: tool.name,
          currentSpend: tool.spend,
          recommendedAction: `Downgrade to Pro/Individual`,
          savingsMonthly: savings,
          reasoning: `A Team plan is unnecessary for 1 seat. Downgrading optimizes per-user cost while retaining premium features.`
        });
      }
    }

    // RULE 2: Redundant Coding Tools
    if (data.useCase.toLowerCase() === "coding") {
      if (tool.name === "ChatGPT" && (hasCursor || hasCopilot)) {
        savings = tool.spend;
        recommendations.push({
          toolName: tool.name,
          currentSpend: tool.spend,
          recommendedAction: `Cancel Subscription`,
          savingsMonthly: savings,
          reasoning: `For coding, IDE-integrated tools like Cursor/Copilot are superior. They include top-tier LLM access, making a separate ChatGPT subscription redundant.`
        });
      }
    }

    // RULE 3: API vs Chat UI Waste for large teams
    if (tool.name === "ChatGPT" && tool.seats > 10 && tool.spend >= 300) {
      savings = tool.spend * 0.4; // Estimate 40% savings moving to API/Credex
      recommendations.push({
        toolName: tool.name,
        currentSpend: tool.spend,
        recommendedAction: `Migrate to Direct API / Credex Pooling`,
        savingsMonthly: savings,
        reasoning: `At ${tool.seats} seats, paying retail per-user UI licenses is inefficient. Transitioning to API usage or discounted pooled credits via Credex reduces bulk overhead.`
      });
    }

    totalMonthlySavings += savings;
  });

  return {
    recommendations,
    totalMonthlySavings,
    totalAnnualSavings: totalMonthlySavings * 12
  };
}