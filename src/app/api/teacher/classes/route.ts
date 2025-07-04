import { auth } from "@/auth";
import { db } from "@/db/index";
import {
  rooms,
  subjects,
  teacherClasses,
  teachers,
  timetableEntries,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get teacher ID from email
    const teacher = await db
      .select()
      .from(teachers)
      .where(eq(teachers.email, session.user.email))
      .limit(1);

    if (teacher.length === 0) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    const { timetable_entry_id } = await request.json();

    if (!timetable_entry_id) {
      return NextResponse.json(
        { error: "Timetable entry ID is required" },
        { status: 400 },
      );
    }

    // Add the class assignment
    const newTeacherClass = await db
      .insert(teacherClasses)
      .values({
        id: crypto.randomUUID(),
        teacher_id: teacher[0].id,
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
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get teacher ID from email
    const teacher = await db
      .select()
      .from(teachers)
      .where(eq(teachers.email, session.user.email))
      .limit(1);

    if (teacher.length === 0) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Get teacher's classes with timetable, subject, and room details
    const teacherClassesList = await db
      .select({
        id: teacherClasses.id,
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
      .from(teacherClasses)
      .innerJoin(
        timetableEntries,
        eq(teacherClasses.timetable_entry_id, timetableEntries.id),
      )
      .leftJoin(subjects, eq(timetableEntries.subject_id, subjects.id))
      .leftJoin(rooms, eq(timetableEntries.room_id, rooms.id))
      .where(eq(teacherClasses.teacher_id, teacher[0].id));

    return NextResponse.json({
      success: true,
      data: teacherClassesList,
    });
  } catch (error) {
    console.error("Error fetching teacher classes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
