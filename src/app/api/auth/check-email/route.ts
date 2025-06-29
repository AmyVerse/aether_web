import { users } from "@/db/schema";
import { db } from "@/index";
import { badRequest, isValidEmail, validateFields } from "@/utils/api-auth";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

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

    // Uncomment if you want to restrict to specific domain
    // if (!/@iiitn\.ac\.in$/i.test(email)) {
    //   return badRequest("Email must be a valid @iiitn.ac.in address");
    // }

    // Check if already registered
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase().trim()))
      .limit(1);

    if (existingUser.length > 0) {
      return badRequest("User already exists");
    }

    // Email is valid and not registered
    return NextResponse.json({ message: "Email is valid" }, { status: 200 });
  } catch (error) {
    console.error("Check email error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
