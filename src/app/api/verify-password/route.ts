import { badRequest, serverError, validateFields } from "@/utils/api-auth";
import { getUserByEmail } from "@/utils/auth-helpers";
import { verifyPassword } from "@/utils/verifyPassword";
import { NextResponse } from "next/server";

// Rate limiting for password verification attempts
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkPasswordRateLimit(
  email: string,
  maxAttempts = 5,
  windowMs = 900000,
) {
  // 15 minutes
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
    const fieldError = validateFields(body, ["email", "password"]);
    if (fieldError) return badRequest(fieldError);

    const { email, password } = body;

    // Check rate limit
    if (!checkPasswordRateLimit(email)) {
      return NextResponse.json(
        { error: "Too many password attempts. Try again in 15 minutes." },
        { status: 429 },
      );
    }

    const user = await getUserByEmail(email);

    if (!user || !user.password) {
      return NextResponse.json({ success: false });
    }

    const isValid = await verifyPassword(password, user.password);

    if (isValid) {
      // Reset rate limit on successful verification
      rateLimitMap.delete(email.toLowerCase());
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false });
  } catch (error) {
    console.error("Password verification error:", error);
    return serverError();
  }
}
