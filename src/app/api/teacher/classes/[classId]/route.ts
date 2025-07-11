import { db } from "@/db/index";
import { classTeachers, rooms, subjects, timetableEntries } from "@/db/schema";
import { authenticateTeacher } from "@/utils/auth-helpers";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> },
) {
  try {
    const { teacher, error } = await authenticateTeacher();
    if (error) return error;

    const resolvedParams = await params;

    // Get class details (main info)
    const classDetailsArr = await db
      .select({
        id: classTeachers.id,
        subject_name: subjects.course_name,
        subject_code: subjects.course_code,
        branch: timetableEntries.branch,
        section: timetableEntries.section,
        room_number: rooms.room_number,
        academic_year: timetableEntries.academic_year,
        semester_type: timetableEntries.semester_type,
        semester: timetableEntries.semester,
        notes: classTeachers.notes,
        timetable_entry_id: classTeachers.timetable_entry_id,
      })
      .from(classTeachers)
      .innerJoin(
        timetableEntries,
        eq(classTeachers.timetable_entry_id, timetableEntries.id),
      )
      .leftJoin(subjects, eq(timetableEntries.subject_id, subjects.id))
      .leftJoin(rooms, eq(timetableEntries.room_id, rooms.id))
      .where(eq(classTeachers.id, resolvedParams.classId))
      .limit(1);

    if (classDetailsArr.length === 0) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const classDetails = classDetailsArr[0];

    // Get all timings for this timetable entry (clubbed timings)
    // We need to get all day/time_slot pairs for the timetable_entry_id
    const timings = await db.query.timetableEntriesTimings.findMany({
      where: (timing, { eq }) =>
        eq(timing.timetable_entry_id, classDetails.timetable_entry_id),
      columns: {
        day: true,
        time_slot: true,
      },
      orderBy: (timing, { asc }) => [asc(timing.day), asc(timing.time_slot)],
    });

    // For backward compatibility, pick the first timing as day/time_slot
    let day = "";
    let time_slot = "";
    if (timings.length > 0) {
      day = timings[0].day;
      time_slot = timings[0].time_slot;
    }

    return NextResponse.json({
      success: true,
      data: {
        ...classDetails,
        day,
        time_slot,
        timings,
      },
    });
  } catch (error) {
    console.error("Error fetching class details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
