import { generateOtpWithExpiry } from "@/utils/otp";
import { cookies } from "next/headers";
import { Resend } from "resend";

// Initialize Resend once (not per request)
const resend = new Resend(process.env.RESEND_API_KEY!);

// Validate environment variables at startup
if (!process.env.RESEND_API_KEY) {
  console.error("❌ RESEND_API_KEY is not set!");
  throw new Error("RESEND_API_KEY environment variable is required");
}

export async function sendOtp(email: string) {
  const { otp, expiresAt } = generateOtpWithExpiry(6, 10); // 6-digit OTP, 10 minutes expiry

  const cookieStore = cookies();

  // Store OTP with expiry time as JSON
  const otpData = JSON.stringify({ otp, expiresAt });

  (await cookieStore).set(`otp-${email}`, otpData, {
    httpOnly: true,
    maxAge: 600, // 10 minutes in seconds
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  // Simple, clean HTML template
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #333;">Verify Your Email</h2>
      <p>Use this OTP to complete your sign up for <strong>Aether IIITN</strong>:</p>
      
      <div style="background-color: #f8f9fa; border: 2px dashed #007bff; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
        <span style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #333; font-family: monospace;">
          ${otp}
        </span>
      </div>
      
      <p style="color: #666;">This code will expire in <strong>10 minutes</strong>.</p>
      <p style="color: #666;">If you didn't request this, you can safely ignore this email.</p>
      
      <hr style="margin: 30px 0;">
      <p style="color: #999; font-size: 14px;">
        — Aether IIITN Team<br>
        Indian Institute of Information Technology, Nagpur
      </p>
    </div>
  `;

  // Add plain text version for better deliverability
  const text = `
Verify Your Email - Aether IIITN

Use this OTP to complete your sign up for Aether IIITN:

${otp}

This code will expire in 10 minutes.
If you didn't request this, you can safely ignore this email.

— Aether IIITN Team
Indian Institute of Information Technology, Nagpur
  `.trim();

  try {
    // Send email with timeout wrapper
    const emailPromise = resend.emails.send({
      from: "Aether IIITN <noreply@aether.amyverse.in>", // Better sender format
      to: [email], // Array format is more reliable
      subject: "🔐 Your OTP Code - Aether IIITN",
      html,
      text, // Add plain text version
      // Add these headers to improve deliverability
      headers: {
        "X-Entity-Ref-ID": `otp-${Date.now()}`, // Unique reference
      },
      tags: [
        {
          name: "category",
          value: "otp-verification",
        },
      ],
    });

    // Set a 10-second timeout for the email sending
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Email sending timeout")), 10000),
    );

    const data = await Promise.race([emailPromise, timeoutPromise]);

    return { data };
  } catch (error) {
    console.error("❌ Resend API error:", error);

    // Return a meaningful error but don't expose internal details
    throw new Error("Failed to send email. Please try again.");
  }
}

// Enhanced email testing function
export async function testEmailDelivery(email: string) {
  console.log("🧪 Testing email delivery to:", email);

  try {
    const result = await resend.emails.send({
      from: "Aether IIITN <noreply@aether.amyverse.in>",
      to: [email],
      subject: "✅ Email Delivery Test - Aether IIITN",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: 0 auto;">
          <h2>✅ Email Delivery Test Successful!</h2>
          <p>If you're reading this, email delivery is working correctly.</p>
          <p><strong>Test time:</strong> ${new Date().toLocaleString()}</p>
          <p><strong>To:</strong> ${email}</p>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 14px;">
            This is a test email from Aether IIITN system.<br>
            — Aether IIITN Team
          </p>
        </div>
      `,
      text: `
Email Delivery Test Successful!

If you're reading this, email delivery is working correctly.

Test time: ${new Date().toLocaleString()}
To: ${email}

This is a test email from Aether IIITN system.
— Aether IIITN Team
      `.trim(),
    });

    console.log("✅ Test email sent successfully:", result);
    return { success: true, result };
  } catch (error) {
    console.error("❌ Test email failed:", error);
    return { success: false, error };
  }
}
