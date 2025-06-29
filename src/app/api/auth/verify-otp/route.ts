import { badRequest, validateFields } from "@/utils/api-auth";
import { validateOtp } from "@/utils/otp";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const fieldError = validateFields(body, ["email", "otp"]);
    if (fieldError) return badRequest(fieldError);

    const { email, otp } = body;

    const cookieStore = cookies();
    const otpDataString = (await cookieStore).get(`otp-${email}`)?.value;

    if (!otpDataString) {
      return NextResponse.json(
        { status: "expired_or_missing" },
        { status: 400 },
      );
    }

    try {
      const { otp: storedOtp, expiresAt } = JSON.parse(otpDataString);
      const validation = validateOtp(storedOtp, otp, expiresAt);

      if (!validation.valid) {
        if (validation.reason === "expired") {
          // Clear expired OTP
          (await cookieStore).delete(`otp-${email}`);
          return NextResponse.json(
            { status: "expired_or_missing" },
            { status: 400 },
          );
        }
        return NextResponse.json({ status: "invalid_otp" }, { status: 400 });
      }

      // Clear OTP after successful verification
      (await cookieStore).delete(`otp-${email}`);
      return NextResponse.json({ status: "verified" });
    } catch {
      // Invalid JSON format, treat as expired
      (await cookieStore).delete(`otp-${email}`);
      return NextResponse.json(
        { status: "expired_or_missing" },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
