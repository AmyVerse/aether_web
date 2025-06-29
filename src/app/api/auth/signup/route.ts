import { students, teachers, users } from "@/db/schema";
import { db } from "@/index";
import {
  badRequest,
  isValidEmail,
  serverError,
  validateFields,
} from "@/utils/api-auth";
import { hash } from "bcrypt";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Helper to normalize email
function normalizeEmail(email: string | undefined | null) {
  return (email || "").trim().toLowerCase();
}

// Password validation
function isValidPassword(password: string) {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password)
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate required fields
    const fieldError = validateFields(body, ["email", "password"]);
    if (fieldError) return badRequest(fieldError);

    const { email, password } = body;
    const normalizedEmail = normalizeEmail(email);

    // Validate email format
    if (!isValidEmail(normalizedEmail)) {
      return badRequest("Invalid email format");
    }

    // Validate password strength
    if (!isValidPassword(password)) {
      return badRequest(
        "Password must be at least 8 characters with uppercase, lowercase, and number",
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existingUser.length > 0) {
      return badRequest("User already exists");
    }

    // Check students and teachers for roleId, role, and name
    const student = await db
      .select()
      .from(students)
      .where(eq(students.email, normalizedEmail))
      .limit(1);
    const teacher = await db
      .select()
      .from(teachers)
      .where(eq(teachers.email, normalizedEmail))
      .limit(1);

    let roleId: string | null = null;
    let role: string | null = null;
    let name: string = "User";

    if (student.length > 0) {
      roleId = student[0].id;
      role = "student";
      name = student[0].name || "User";
    } else if (teacher.length > 0) {
      roleId = teacher[0].id;
      role = "teacher";
      name = teacher[0].name || "User";
    }

    const hashedPassword = await hash(password, 12); // Increased salt rounds

    await db.insert(users).values({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      roleId: roleId,
      role: role,
    });

    return NextResponse.json(
      { message: "User created successfully" },
      { status: 201 },
    );
  } catch (error) {
    console.error("Signup error:", error);
    return serverError("Failed to create user");
  }
}
