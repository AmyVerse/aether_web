import { db } from "@/db/index";
import { classTeachers, rooms, subjects, timetableEntries } from "@/db/schema";
import { authenticateTeacher } from "@/utils/auth-helpers";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { teacher, error } = await authenticateTeacher();
    if (error) return error;

    const { timetable_entry_id } = await request.json();

    if (!timetable_entry_id) {
      return NextResponse.json(
        { error: "Timetable entry ID is required" },
        { status: 400 },
      );
    }

    // Add the class assignment
    const newTeacherClass = await db
      .insert(classTeachers)
      .values({
        id: nanoid(9),
        teacher_id: teacher.id,
        timetable_entry_id: timetable_entry_id,
        notes: null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newTeacherClass[0],
    });
  } catch (error) {
    console.error("Error adding teacher class:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { teacher, error } = await authenticateTeacher();
    if (error) return error;

    // Get teacher's classes with timetable, subject, and room details in a single query
    const classTeachersList = await db
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
      })
      .from(classTeachers)
      .innerJoin(
        timetableEntries,
        eq(classTeachers.timetable_entry_id, timetableEntries.id),
      )
      .leftJoin(subjects, eq(timetableEntries.subject_id, subjects.id))
      .leftJoin(rooms, eq(timetableEntries.room_id, rooms.id))
      .where(eq(classTeachers.teacher_id, teacher.id));

    return NextResponse.json({
      success: true,
      data: classTeachersList,
    });
  } catch (error) {
    console.error("Error fetching teacher classes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
