import { users } from "@/db/schema";
import { db } from "@/index";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email } = await req.json();

  // // Check for iiitn.ac.in email
  // if (!/@iiitn\.ac\.in$/i.test(email)) {
  //   return NextResponse.json(
  //     { error: "Email must be a valid @iiitn.ac.in address" },
  //     { status: 400 },
  //   );
  // }

  // Check if already registered
  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }

  // If all good
  return NextResponse.json({ message: "Email is valid" }, { status: 200 });
}
