import { auth } from "@/auth";
import { db } from "@/db";
import { subjects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const subjectList = await db
      .select({
        id: subjects.id,
        course_code: subjects.course_code,
        course_name: subjects.course_name,
        short_name: subjects.short_name,
        subject_type: subjects.subject_type,
        credits: subjects.credits,
        theory_hours: subjects.theory_hours,
        lab_hours: subjects.lab_hours,
      })
      .from(subjects)
      .where(eq(subjects.is_active, true))
      .orderBy(subjects.course_code);

    return NextResponse.json(subjectList);
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
