import {
  badRequest,
  isValidEmail,
  serverError,
  validateFields,
} from "@/utils/api-auth";
import { sendOtp } from "@/utils/resendOperator";
import { NextResponse } from "next/server";

// Rate limiting map (in production, use Redis or database)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(email: string, maxAttempts = 3, windowMs = 300000) {
  // 5 minutes
  const now = Date.now();
  const key = email.toLowerCase();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate required fields
    const fieldError = validateFields(body, ["email"]);
    if (fieldError) return badRequest(fieldError);

    const { email } = body;

    // Validate email format
    if (!isValidEmail(email)) {
      return badRequest("Invalid email format");
    }

    // Check rate limit
    if (!checkRateLimit(email)) {
      return NextResponse.json(
        { error: "Too many OTP requests. Try again in 5 minutes." },
        { status: 429 },
      );
    }

    // Send OTP via email
    const { data } = await sendOtp(email);

    return NextResponse.json(
      { message: "OTP sent successfully", data },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error sending OTP:", error);
    return serverError("Failed to send OTP");
  }
}
