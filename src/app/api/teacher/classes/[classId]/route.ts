import { db } from "@/db/index";
import { classTeachers, rooms, subjects, timetableEntries } from "@/db/schema";
import { authenticateTeacher } from "@/utils/auth-helpers";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> },
) {
  try {
    const { teacher, error } = await authenticateTeacher();
    if (error) return error;

    const resolvedParams = await params;

    // Get class details with authorization check in a single query
    const classDetails = await db
      .select({
        id: classTeachers.id,
        subject_name: subjects.course_name,
        subject_code: subjects.course_code,
        branch: timetableEntries.branch,
        section: timetableEntries.section,
        day: timetableEntries.day,
        time_slot: timetableEntries.time_slot,
        room_number: rooms.room_number,
        academic_year: timetableEntries.academic_year,
        semester_type: timetableEntries.semester_type,
        notes: classTeachers.notes,
      })
      .from(classTeachers)
      .innerJoin(
        timetableEntries,
        eq(classTeachers.timetable_entry_id, timetableEntries.id),
      )
      .leftJoin(subjects, eq(timetableEntries.subject_id, subjects.id))
      .leftJoin(rooms, eq(timetableEntries.room_id, rooms.id))
      .where(
        and(
          eq(classTeachers.id, resolvedParams.classId),
          eq(classTeachers.teacher_id, teacher.id),
        ),
      )
      .limit(1);

    if (classDetails.length === 0) {
      return NextResponse.json(
        { error: "Class not found or unauthorized" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: classDetails[0],
    });
  } catch (error) {
    console.error("Error fetching class details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
