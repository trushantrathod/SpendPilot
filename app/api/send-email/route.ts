import { NextResponse } from "next/server";
import { Resend } from "resend";

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, totalSpend, highSavings } = body;

    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is missing from .env.local");
    }

    // 1. Dynamic Subject Line
    const subject = highSavings 
      ? "Action Required: Your Credex AI Spend Audit" 
      : "Your AI Spend Audit Results";

    // 2. Dynamic Email Body (Matching the assignment logic)
    const htmlContent = highSavings
      ? `
        <div style="font-family: sans-serif; color: #333; max-w: 600px; margin: 0 auto;">
          <h2>Your AI stack has been audited.</h2>
          <p>We identified <strong>$${totalSpend.toFixed(2)}</strong> in potential monthly savings.</p>
          <p>Because your infrastructure footprint is large enough to qualify for wholesale credit pooling, a Credex optimization specialist will be reaching out to the email provided to help you capture these savings.</p>
          <hr style="border: 1px solid #eaeaea; margin: 20px 0;" />
          <p style="color: #666; font-size: 14px;">Best,<br/>The Credex Team</p>
        </div>
      `
      : `
        <div style="font-family: sans-serif; color: #333; max-w: 600px; margin: 0 auto;">
          <h2>Your AI stack has been audited.</h2>
          <p>Currently, you are spending well. We couldn't find major waste in your stack.</p>
          <p>However, AI pricing changes weekly. We have saved your stack profile and will notify you the moment new optimizations or cheaper models apply to your specific use cases.</p>
          <hr style="border: 1px solid #eaeaea; margin: 20px 0;" />
          <p style="color: #666; font-size: 14px;">Best,<br/>The Credex Team</p>
        </div>
      `;

    // 3. Send the Email
    // CRITICAL: On the free tier, Resend forces you to use "onboarding@resend.dev" as the sender.
    const data = await resend.emails.send({
      from: "Credex Audits <onboarding@resend.dev>",
      to: email,
      subject: subject,
      html: htmlContent,
    });

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error("Resend API Error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}