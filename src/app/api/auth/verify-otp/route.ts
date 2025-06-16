// app/api/verify-otp/route.ts
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, otp } = await request.json();
  const cookieStore = cookies();
  const savedOtp = (await cookieStore).get(`otp-${email}`)?.value;

  if (!savedOtp) {
    return NextResponse.json({ status: "expired_or_missing" }, { status: 400 });
  }

  if (otp === savedOtp) {
    // Clear OTP from store for security
    (
      await // Clear OTP from store for security
      cookieStore
    ).delete(`otp-${email}`);
    return NextResponse.json({ status: "verified" });
  } else {
    return NextResponse.json({ status: "invalid_otp" }, { status: 400 });
  }
}
