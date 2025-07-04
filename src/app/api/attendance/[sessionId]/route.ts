import { auth } from "@/auth";
import { db } from "@/db/index";
import {
  attendanceRecords,
  classStudents,
  classSessions,
  rooms,
  students,
  subjects,
  teacherClasses,
  teachers,
  timetableEntries,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
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

    // Get session details with class information
    const sessionDetails = await db
      .select({
        id: classSessions.id,
        date: classSessions.date,
        start_time: classSessions.start_time,
        end_time: classSessions.end_time,
        status: classSessions.status,
        notes: classSessions.notes,
        subject_name: subjects.course_name,
        subject_code: subjects.course_code,
        branch: timetableEntries.branch,
        section: timetableEntries.section,
        room_number: rooms.room_number,
      })
      .from(classSessions)
      .innerJoin(teacherClasses, eq(classSessions.teacher_class_id, teacherClasses.id))
      .innerJoin(timetableEntries, eq(teacherClasses.timetable_entry_id, timetableEntries.id))
      .leftJoin(subjects, eq(timetableEntries.subject_id, subjects.id))
      .leftJoin(rooms, eq(timetableEntries.room_id, rooms.id))
      .where(eq(classSessions.id, params.sessionId))
      .limit(1);

    if (sessionDetails.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Verify the session belongs to the current teacher
    const teacherClassOwnership = await db
      .select()
      .from(classSessions)
      .innerJoin(teacherClasses, eq(classSessions.teacher_class_id, teacherClasses.id))
      .where(eq(classSessions.id, params.sessionId))
      .limit(1);

    if (teacherClassOwnership[0].teacher_classes.teacher_id !== teacher[0].id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const sessionData = sessionDetails[0];
    
    return NextResponse.json({
      success: true,
      session: {
        id: sessionData.id,
        date: sessionData.date,
        start_time: sessionData.start_time,
        end_time: sessionData.end_time,
        status: sessionData.status,
        notes: sessionData.notes,
        class_details: {
          subject_name: sessionData.subject_name,
          subject_code: sessionData.subject_code,
          branch: sessionData.branch,
          section: sessionData.section,
          room_number: sessionData.room_number,
        }
      }
    });
  } catch (error) {
    console.error("Error fetching session details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
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

    // Verify the session belongs to the current teacher
    const teacherClassOwnership = await db
      .select()
      .from(classSessions)
      .innerJoin(teacherClasses, eq(classSessions.teacher_class_id, teacherClasses.id))
      .where(eq(classSessions.id, params.sessionId))
      .limit(1);

    if (teacherClassOwnership.length === 0 || teacherClassOwnership[0].teacher_classes.teacher_id !== teacher[0].id) {
      return NextResponse.json({ error: "Session not found or unauthorized" }, { status: 403 });
    }

    const { attendance } = await request.json();

    if (!attendance || !Array.isArray(attendance)) {
      return NextResponse.json(
        { error: "Attendance data is required" },
        { status: 400 },
      );
    }

    // Delete existing attendance records for this session
    await db
      .delete(attendanceRecords)
      .where(eq(attendanceRecords.session_id, params.sessionId));

    // Insert new attendance records
    const attendanceData = attendance.map((record: any) => ({
      student_id: record.student_id,
      session_id: params.sessionId,
      attendance_status: record.attendance_status,
    }));

    await db.insert(attendanceRecords).values(attendanceData);

    // Update session status to completed if not already
    await db
      .update(classSessions)
      .set({ status: "Completed" })
      .where(eq(classSessions.id, params.sessionId));

    return NextResponse.json({
      success: true,
      message: "Attendance saved successfully",
    });
  } catch (error) {
    console.error("Error saving attendance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
