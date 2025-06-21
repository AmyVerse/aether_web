import { students, teachers, users } from "@/db/schema";
import { db } from "@/index";
import { hash } from "bcrypt";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Helper to normalize email
function normalizeEmail(email: string | undefined | null) {
  return (email || "").trim().toLowerCase();
}

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const normalizedEmail = normalizeEmail(email);

    // Check students and teachers for roleId, role, and name (normalized email)
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

    const hashedPassword = await hash(password, 10);

    await db.insert(users).values({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      roleId: roleId,
      role: role,
    });

    return NextResponse.json({ message: "User created" }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
