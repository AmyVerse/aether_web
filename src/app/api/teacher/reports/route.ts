import { db } from "@/db/index";
import {
  attendanceRecords,
  classSessions,
  classStudents,
  classTeachers,
  students,
} from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET: Returns attendance report for all classes allotted to the teacher
export async function GET(request: NextRequest) {
  try {
    // TODO: Replace with real teacher auth
    const teacherId = request.nextUrl.searchParams.get("teacherId");
    if (!teacherId) {
      return NextResponse.json({ error: "Missing teacherId" }, { status: 400 });
    }

    // 1. Get all classes allotted to this teacher
    const teacherClasses = await db
      .select({ id: classTeachers.id })
      .from(classTeachers)
      .where(eq(classTeachers.teacher_id, teacherId));
    const classIds = teacherClasses.map((c) => c.id);
    if (classIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // 2. Get all sessions for these classes
    const sessions = await db
      .select({
        id: classSessions.id,
        date: classSessions.date,
        teacher_class_id: classSessions.teacher_class_id,
      })
      .from(classSessions)
      .where(inArray(classSessions.teacher_class_id, classIds));

    // 3. Get all students for these classes
    const classStudentRows = await db
      .select({
        id: classStudents.id,
        teacher_class_id: classStudents.teacher_class_id,
        student_id: classStudents.student_id,
      })
      .from(classStudents)
      .where(inArray(classStudents.teacher_class_id, classIds));
    const studentIds = classStudentRows.map((cs) => cs.student_id);
    const studentsList = await db
      .select({
        id: students.id,
        name: students.name,
        roll_number: students.roll_number,
      })
      .from(students)
      .where(inArray(students.id, studentIds));
    const studentsMap = new Map(studentsList.map((s) => [s.id, s]));

    // 4. Get all attendance records for these sessions and students
    const sessionIds = sessions.map((s) => s.id);
    const attendance = await db
      .select({
        id: attendanceRecords.id,
        student_id: attendanceRecords.student_id,
        session_id: attendanceRecords.session_id,
        attendance_status: attendanceRecords.attendance_status,
      })
      .from(attendanceRecords)
      .where(inArray(attendanceRecords.session_id, sessionIds));

    // 5. Group by class, then by student, then by session
    const report: any = {};
    for (const classId of classIds) {
      // Sessions for this class
      const classSessionsArr = sessions.filter(
        (s) => s.teacher_class_id === classId,
      );
      // Students for this class
      const classStudentsArr = classStudentRows.filter(
        (cs) => cs.teacher_class_id === classId,
      );
      // Build table: rows = students, columns = sessions
      const table = classStudentsArr.map((cs) => {
        const student = studentsMap.get(cs.student_id);
        const row: any = {
          student_id: cs.student_id,
          name: student?.name || "",
          roll_number: student?.roll_number || "",
        };
        for (const session of classSessionsArr) {
          const att = attendance.find(
            (a) =>
              a.student_id === cs.student_id && a.session_id === session.id,
          );
          row[session.id] = att
            ? att.attendance_status === "Present"
              ? 1
              : 0
            : null;
        }
        return row;
      });
      report[classId] = {
        sessions: classSessionsArr.map((s) => ({ id: s.id, date: s.date })),
        students: table,
      };
    }
    return NextResponse.json({ success: true, data: report });
  } catch (error) {
    console.error("Error generating attendance report:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
