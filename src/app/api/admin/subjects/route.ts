import { subjects } from "@/db/schema";
import { db } from "@/index";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Explicitly select id, code, name
    const result = await db
      .select({
        id: subjects.id,
        code: subjects.course_code,
        name: subjects.course_name,
      })
      .from(subjects);
    return NextResponse.json({ subjects: result });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch subjects" },
      { status: 500 }
    );
  }
}
