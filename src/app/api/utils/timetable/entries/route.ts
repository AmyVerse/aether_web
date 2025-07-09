import { db } from "@/db/index";
import { rooms, subjects, timetableEntries } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get("subject");
    const branch = searchParams.get("branch");
    const section = searchParams.get("section");
    const semester = searchParams.get("semester");
    const day = searchParams.get("day");
    const time_slot = searchParams.get("time_slot");

    // Build where conditions based on query parameters
    const conditions = [];
    if (subject) conditions.push(eq(timetableEntries.subject_id, subject));
    if (branch) conditions.push(eq(timetableEntries.branch, branch as any));
    if (section) conditions.push(eq(timetableEntries.section, section as any));
    if (semester)
      conditions.push(eq(timetableEntries.semester, Number(semester)));
    if (day) conditions.push(eq(timetableEntries.day, day as any));
    if (time_slot)
      conditions.push(eq(timetableEntries.time_slot, time_slot as any));

    // Query timetable entries with joins to get subject and room details
    const entries = await db
      .select({
        id: timetableEntries.id,
        subject_id: timetableEntries.subject_id,
        branch: timetableEntries.branch,
        section: timetableEntries.section,
        day: timetableEntries.day,
        time_slot: timetableEntries.time_slot,
        room_id: timetableEntries.room_id,
        academic_year: timetableEntries.academic_year,
        semester_type: timetableEntries.semester_type,
        notes: timetableEntries.notes,
        color_code: timetableEntries.color_code,
        semester: timetableEntries.semester,
        subject_name: subjects.course_name,
        subject_code: subjects.course_code,
        room_number: rooms.room_number,
      })
      .from(timetableEntries)
      .leftJoin(subjects, eq(timetableEntries.subject_id, subjects.id))
      .leftJoin(rooms, eq(timetableEntries.room_id, rooms.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return NextResponse.json({
      success: true,
      data: entries,
    });
  } catch (error) {
    console.error("Error fetching timetable entries:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
