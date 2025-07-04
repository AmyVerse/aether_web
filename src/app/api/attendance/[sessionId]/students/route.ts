import { auth } from "@/auth";
import { db } from "@/db/index";
import {
  attendanceRecords,
  classStudents,
  classSessions,
  students,
  teacherClasses,
  teachers,
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

    // Verify the session belongs to the current teacher
    const teacherClassOwnership = await db
      .select({
        teacher_class_id: classSessions.teacher_class_id,
        teacher_id: teacherClasses.teacher_id,
      })
      .from(classSessions)
      .innerJoin(teacherClasses, eq(classSessions.teacher_class_id, teacherClasses.id))
      .where(eq(classSessions.id, params.sessionId))
      .limit(1);

    if (teacherClassOwnership.length === 0 || teacherClassOwnership[0].teacher_id !== teacher[0].id) {
      return NextResponse.json({ error: "Session not found or unauthorized" }, { status: 403 });
    }

    const teacherClassId = teacherClassOwnership[0].teacher_class_id;

    // Get all students enrolled in this class
    const enrolledStudents = await db
      .select({
        student_id: students.id,
        student_name: students.name,
        roll_number: students.roll_number,
        email: students.email,
      })
      .from(classStudents)
      .innerJoin(students, eq(classStudents.student_id, students.id))
      .where(eq(classStudents.teacher_class_id, teacherClassId));

    // Get existing attendance records for this session
    const existingAttendance = await db
      .select({
        student_id: attendanceRecords.student_id,
        attendance_status: attendanceRecords.attendance_status,
        recorded_at: attendanceRecords.recorded_at,
      })
      .from(attendanceRecords)
      .where(eq(attendanceRecords.session_id, params.sessionId));

    // Create attendance map for easy lookup
    const attendanceMap = new Map();
    existingAttendance.forEach(record => {
      attendanceMap.set(record.student_id, {
        status: record.attendance_status,
        recorded_at: record.recorded_at,
      });
    });

    // Combine student data with attendance status
    const studentsWithAttendance = enrolledStudents.map(student => {
      const attendance = attendanceMap.get(student.student_id);
      return {
        student_id: student.student_id,
        student_name: student.student_name,
        roll_number: student.roll_number,
        email: student.email,
        attendance_status: attendance?.status || "Present", // Default to Present
        recorded_at: attendance?.recorded_at,
      };
    });

    return NextResponse.json({
      success: true,
      students: studentsWithAttendance,
    });
  } catch (error) {
    console.error("Error fetching students for attendance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
