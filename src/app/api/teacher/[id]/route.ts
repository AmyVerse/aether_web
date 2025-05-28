import { classSessions, groups, subjects } from "@/db/schema";
import { db } from "@/index";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const teacherId = "5dd163f4-d667-4dc3-8dc4-54256890df04";

    const sessions = await db
      .select({
        id: classSessions.id,
        date: classSessions.date,
        type: classSessions.type,
        start_time: classSessions.start_time,
        end_time: classSessions.end_time,
        status: classSessions.status,
        reason: classSessions.reason,
        subject_name: subjects.course_name,
        group_name: groups.name,
        branch: groups.branch,
        semester: groups.semester,
      })
      .from(classSessions)
      .where(eq(classSessions.teacher_id, teacherId))
      .leftJoin(subjects, eq(classSessions.subject_id, subjects.id))
      .leftJoin(groups, eq(classSessions.group_id, groups.id));

    return NextResponse.json({ sessions });
  } catch (error: unknown) {
    console.error("Fetch sessions error:", error);
    return NextResponse.json(
      {
        error: "Server error",
        detail:
          typeof error === "object" && error !== null && "message" in error
            ? (error as { message: string }).message
            : String(error),
      },
      { status: 500 }
    );
  }
}
