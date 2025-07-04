import { auth } from "@/auth";
import { db } from "@/db/index";
import {
  attendanceRecords,
  classSessions,
  classStudents,
  classTeachers,
  students,
  teachers,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;

    // Get teacher ID from email
    const teacher = await db
      .select()
      .from(teachers)
      .where(eq(teachers.email, session.user.email))
      .limit(1);

    if (teacher.length === 0) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // Verify the session exists and belongs to this teacher
    const sessionData = await db
      .select({
        id: classSessions.id,
        teacher_class_id: classSessions.teacher_class_id,
        date: classSessions.date,
        start_time: classSessions.start_time,
        end_time: classSessions.end_time,
        status: classSessions.status,
        notes: classSessions.notes,
      })
      .from(classSessions)
      .innerJoin(
        classTeachers,
        eq(classSessions.teacher_class_id, classTeachers.id),
      )
      .where(
        and(
          eq(classSessions.id, resolvedParams.sessionId),
          eq(classTeachers.teacher_id, teacher[0].id),
        ),
      )
      .limit(1);

    if (sessionData.length === 0) {
      return NextResponse.json(
        {
          error: "Session not found or unauthorized",
        },
        { status: 404 },
      );
    }

    // Get all students enrolled in this class with their attendance status
    const studentsWithAttendance = await db
      .select({
        student_id: students.id,
        student_name: students.name,
        roll_number: students.roll_number,
        email: students.email,
        attendance_id: attendanceRecords.id,
        attendance_status: attendanceRecords.attendance_status,
        recorded_at: attendanceRecords.recorded_at,
      })
      .from(classStudents)
      .innerJoin(students, eq(classStudents.student_id, students.id))
      .leftJoin(
        attendanceRecords,
        and(
          eq(attendanceRecords.student_id, students.id),
          eq(attendanceRecords.session_id, resolvedParams.sessionId),
        ),
      )
      .where(
        eq(classStudents.teacher_class_id, sessionData[0].teacher_class_id),
      )
      .orderBy(students.roll_number);

    // Format the response
    const attendanceData = studentsWithAttendance.map((record) => ({
      student: {
        id: record.student_id,
        name: record.student_name,
        roll_number: record.roll_number,
        email: record.email,
      },
      attendance: {
        id: record.attendance_id,
        status: record.attendance_status || "Present", // Default to Present
        recorded_at: record.recorded_at,
      },
    }));

    return NextResponse.json({
      success: true,
      data: {
        session: sessionData[0],
        students: attendanceData,
        total_students: attendanceData.length,
      },
    });
  } catch (error) {
    console.error("Error fetching session students:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { student_id, attendance_status } = await request.json();

    if (!student_id || !attendance_status) {
      return NextResponse.json(
        { error: "Student ID and attendance status are required" },
        { status: 400 },
      );
    }

    // Validate attendance status
    const validStatuses = ["Present", "Absent", "Leave"];
    if (!validStatuses.includes(attendance_status)) {
      return NextResponse.json(
        { error: "Invalid attendance status" },
        { status: 400 },
      );
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

    // Verify the session belongs to this teacher
    const sessionData = await db
      .select()
      .from(classSessions)
      .innerJoin(
        classTeachers,
        eq(classSessions.teacher_class_id, classTeachers.id),
      )
      .where(
        and(
          eq(classSessions.id, resolvedParams.sessionId),
          eq(classTeachers.teacher_id, teacher[0].id),
        ),
      )
      .limit(1);

    if (sessionData.length === 0) {
      return NextResponse.json(
        {
          error: "Session not found or unauthorized",
        },
        { status: 404 },
      );
    }

    // Check if attendance record already exists
    const existingAttendance = await db
      .select()
      .from(attendanceRecords)
      .where(
        and(
          eq(attendanceRecords.student_id, student_id),
          eq(attendanceRecords.session_id, resolvedParams.sessionId),
        ),
      )
      .limit(1);

    let result;

    if (existingAttendance.length > 0) {
      // Update existing attendance record
      result = await db
        .update(attendanceRecords)
        .set({
          attendance_status,
          recorded_at: new Date(),
        })
        .where(eq(attendanceRecords.id, existingAttendance[0].id))
        .returning();
    } else {
      // Create new attendance record
      result = await db
        .insert(attendanceRecords)
        .values({
          student_id,
          session_id: resolvedParams.sessionId,
          attendance_status,
        })
        .returning();
    }

    return NextResponse.json({
      success: true,
      data: result[0],
    });
  } catch (error) {
    console.error("Error updating attendance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
