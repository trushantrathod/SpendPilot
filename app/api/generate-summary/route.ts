import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API using the key from .env.local
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { state, report } = body;

    // Check if API key exists to prevent crashing if it's missing
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured.");
    }

    // Prepare the exact prompt for the AI
    const prompt = `
      You are an expert SaaS financial auditor. Analyze the following AI tool spend data for a company.
      
      Company Profile:
      - Team Size: ${state.teamSize}
      - Primary Use Case: ${state.useCase}
      
      Financial Audit Results:
      - Total Monthly Spend: $${state.tools.reduce((sum: any, t: any) => sum + t.spend, 0)}
      - Potential Monthly Savings: $${report.totalMonthlySavings}
      - Number of Inefficient Tools: ${report.recommendations.length}
      
      Task: Write a highly personalized, professional executive summary (exactly 80 to 100 words) explaining their current situation and why they should take action based on the audit. 
      Tone: Urgent but professional. Speak directly to the founder. Do NOT use bullet points. Do NOT include greetings like "Dear Founder". Just output the pure paragraph.
    `;

    // CHANGED: Using the universally supported "gemini-pro" model
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ summary: text });
    
  } catch (error) {
    console.error("Gemini API Error:", error);
    // Graceful fallback required by the assignment constraints
    return NextResponse.json(
      { summary: "Fallback: Your stack has been audited. Based on your team size and use case, we found specific adjustments that could optimize your run rate. Review the line-item breakdown below to capture your savings." },
      { status: 200 } 
    );
  }
}