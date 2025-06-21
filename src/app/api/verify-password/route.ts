import { NextResponse } from "next/server";
import { getUserByEmail } from "@/utils/auth-helpers";
import { verifyPassword } from "@/utils/verifyPassword";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const user = await getUserByEmail(email);
    if (user && user.password && await verifyPassword(password, user.password)) {
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: false });
  } catch {
    return NextResponse.json({ success: false });
  }
}