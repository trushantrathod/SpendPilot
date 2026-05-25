import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    const { state, report } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "API Key missing" }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert SaaS financial auditor. Write a 80-100 word executive summary for a company with ${state.teamSize} employees. 
      Their total monthly AI spend is $${state.tools.reduce((acc: number, t: any) => acc + t.spend, 0)}.
      We found $${report.totalMonthlySavings} in potential monthly savings by recommending they cancel certain tools.
      Write a compelling, professional summary of these findings. Do NOT use bullet points. Do NOT include greetings or sign-offs. Be direct and analytical.
    `;

    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}