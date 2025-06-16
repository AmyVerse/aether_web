import { sendOtp } from "@/utils/resendOperator";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email } = await req.json();

  try {
    const { data } = await sendOtp(email);
    return NextResponse.json(
      { message: "OTP sent successfully", data },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error sending OTP:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
