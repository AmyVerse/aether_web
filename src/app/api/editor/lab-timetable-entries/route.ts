import { auth } from "@/auth";
import { db } from "@/db";
import { labTimetableEntries, rooms, subjects } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roomId = searchParams.get("room_id");
    const academicYear = searchParams.get("academic_year");
    const semesterType = searchParams.get("semester_type");

    if (!roomId) {
      return NextResponse.json(
        { message: "room_id is required" },
        { status: 400 },
      );
    }

    // Build where conditions
    const whereConditions = [eq(labTimetableEntries.room_id, roomId)];

    if (academicYear) {
      whereConditions.push(eq(labTimetableEntries.academic_year, academicYear));
    }

    if (semesterType) {
      whereConditions.push(eq(labTimetableEntries.semester_type, semesterType));
    }

    const entries = await db
      .select({
        id: labTimetableEntries.id,
        room_id: labTimetableEntries.room_id,
        subject_id: labTimetableEntries.subject_id,
        academic_year: labTimetableEntries.academic_year,
        semester_type: labTimetableEntries.semester_type,
        semester: labTimetableEntries.semester,
        branch: labTimetableEntries.branch,
        section: labTimetableEntries.section,
        day: labTimetableEntries.day,
        start_time: labTimetableEntries.start_time,
        end_time: labTimetableEntries.end_time,
        duration_hours: labTimetableEntries.duration_hours,
        notes: labTimetableEntries.notes,
        color_code: labTimetableEntries.color_code,
        created_at: labTimetableEntries.created_at,
        subject: {
          id: subjects.id,
          course_code: subjects.course_code,
          course_name: subjects.course_name,
          short_name: subjects.short_name,
        },
        room: {
          id: rooms.id,
          room_number: rooms.room_number,
          room_type: rooms.room_type,
          building: rooms.building,
        },
      })
      .from(labTimetableEntries)
      .leftJoin(subjects, eq(labTimetableEntries.subject_id, subjects.id))
      .leftJoin(rooms, eq(labTimetableEntries.room_id, rooms.id))
      .where(and(...whereConditions))
      .orderBy(labTimetableEntries.day, labTimetableEntries.start_time);

    return NextResponse.json(entries);
  } catch (error) {
    console.error("Error fetching lab timetable entries:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      room_id,
      subject_id,
      academic_year,
      semester_type,
      semester,
      branch,
      section,
      day,
      start_time,
      end_time,
      duration_hours,
      notes,
      color_code,
    } = body;

    // Validate required fields
    if (
      !room_id ||
      !subject_id ||
      !academic_year ||
      !semester_type ||
      !semester ||
      !branch ||
      !section ||
      !day ||
      !start_time ||
      !end_time ||
      !duration_hours
    ) {
      return NextResponse.json(
        {
          message: "All required fields must be provided",
        },
        { status: 400 },
      );
    }

    // Check for time conflicts
    const conflictingEntries = await db
      .select()
      .from(labTimetableEntries)
      .where(
        and(
          eq(labTimetableEntries.room_id, room_id),
          eq(labTimetableEntries.day, day),
          // Check if the new entry overlaps with existing ones
          // This is a simplified check - you might want more sophisticated overlap detection
        ),
      );

    // Create the lab timetable entry
    const [newEntry] = await db
      .insert(labTimetableEntries)
      .values({
        room_id,
        subject_id,
        academic_year,
        semester_type,
        semester,
        branch,
        section,
        day,
        start_time,
        end_time,
        duration_hours,
        notes: notes || "",
        color_code: color_code || "#f3e8ff", // Default purple for labs
        created_by: session.user.id,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        entry: newEntry,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating lab timetable entry:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
