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
import { authenticateTeacher } from "@/utils/auth-helpers";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { teacher, error } = await authenticateTeacher();
    if (error) return error;

    const resolvedParams = await params;

    // Get session info with students and attendance in a single optimized query
    const sessionWithStudents = await db
      .select({
        // Session info
        session_id: classSessions.id,
        session_date: classSessions.date,
        session_start_time: classSessions.start_time,
        session_end_time: classSessions.end_time,
        session_status: classSessions.status,
        session_notes: classSessions.notes,
        teacher_class_id: classSessions.teacher_class_id,
        // Student info
        student_id: students.id,
        student_name: students.name,
        roll_number: students.roll_number,
        email: students.email,
        // Attendance info
        attendance_id: attendanceRecords.id,
        attendance_status: attendanceRecords.attendance_status,
        recorded_at: attendanceRecords.recorded_at,
      })
      .from(classSessions)
      .innerJoin(
        classStudents,
        eq(classSessions.teacher_class_id, classStudents.teacher_class_id),
      )
      .innerJoin(students, eq(classStudents.student_id, students.id))
      .leftJoin(
        attendanceRecords,
        and(
          eq(attendanceRecords.student_id, students.id),
          eq(attendanceRecords.session_id, resolvedParams.sessionId),
        ),
      )
      .where(eq(classSessions.id, resolvedParams.sessionId))
      .orderBy(students.roll_number);

    if (sessionWithStudents.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Format the response
    const sessionInfo = {
      id: sessionWithStudents[0].session_id,
      teacher_class_id: sessionWithStudents[0].teacher_class_id,
      date: sessionWithStudents[0].session_date,
      start_time: sessionWithStudents[0].session_start_time,
      end_time: sessionWithStudents[0].session_end_time,
      status: sessionWithStudents[0].session_status,
      notes: sessionWithStudents[0].session_notes,
    };

    const attendanceData = sessionWithStudents.map((record) => ({
      student: {
        id: record.student_id,
        name: record.student_name,
        roll_number: record.roll_number,
        email: record.email,
      },
      attendance: {
        id: record.attendance_id,
        status: record.attendance_status || "Present",
        recorded_at: record.recorded_at,
      },
    }));

    return NextResponse.json({
      success: true,
      data: {
        session: sessionInfo,
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
    const body = await request.json();
    const updates = body.updates || [];

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: "Updates array is required" },
        { status: 400 },
      );
    }

    // Validate all updates
    const validStatuses = ["Present", "Absent", "Leave"];
    for (const upd of updates) {
      if (!upd.student_id || !upd.attendance_status) {
        return NextResponse.json(
          { error: "Each update must have student_id and attendance_status" },
          { status: 400 },
        );
      }
      if (!validStatuses.includes(upd.attendance_status)) {
        return NextResponse.json(
          { error: `Invalid attendance status: ${upd.attendance_status}` },
          { status: 400 },
        );
      }
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

    // Use raw SQL for true bulk upsert (PostgreSQL)
    const now = new Date();
    // Use the correct table name: attendance_records (plural, as in your schema import)
    const valueStrings = updates.map(
      (upd) =>
        `('${upd.student_id.replace(/'/g, "''")}', '${resolvedParams.sessionId.replace(/'/g, "''")}', '${upd.attendance_status.replace(/'/g, "''")}', '${now.toISOString()}')`,
    );

    const sql = `
      INSERT INTO attendance_records (student_id, session_id, attendance_status, recorded_at)
      VALUES ${valueStrings.join(",\n")}
      ON CONFLICT (student_id, session_id)
      DO UPDATE SET
        attendance_status = EXCLUDED.attendance_status,
        recorded_at = EXCLUDED.recorded_at
      RETURNING *;
    `;

    const results = await db.execute(sql);

    // Update session status to "Completed" when attendance is recorded
    await db
      .update(classSessions)
      .set({
        status: "Completed",
      })
      .where(eq(classSessions.id, resolvedParams.sessionId));

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error updating attendance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
