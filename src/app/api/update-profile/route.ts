import { students, teachers, users } from "@/db/schema";
import { db } from "@/index";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// Helper to normalize email
function normalizeEmail(email: string | undefined | null) {
  return (email || "").trim().toLowerCase();
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const normalizedEmail = normalizeEmail(email);

    // Check students and teachers for roleId and name (normalized email)
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

    if (student.length > 0) {
      await db
        .update(users)
        .set({ role: "student", roleId: student[0].id, name: student[0].name })
        .where(eq(users.email, normalizedEmail));
      return NextResponse.json({ success: true }, { status: 200 });
    } else if (teacher.length > 0) {
      await db
        .update(users)
        .set({ role: "teacher", roleId: teacher[0].id, name: teacher[0].name })
        .where(eq(users.email, normalizedEmail));
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json(
        { success: false, error: "No matching student or teacher found." },
        { status: 404 },
      );
    }
  } catch (error) {
    console.error("Role assignment error:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
