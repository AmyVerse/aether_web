import { attendanceRecords, classSessions, students } from "@/db/schema";
import { db } from "@/index";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;

    // 1. Find session → group_id
    const [session] = await db
      .select({ group_id: classSessions.group_id })
      .from(classSessions)
      .where(eq(classSessions.id, sessionId));

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const groupId = session.group_id;

    // 2. Get students in the group
    const studentsInGroup = await db
      .select({
        student_id: students.id,
        name: students.name,
        roll_number: students.roll_number,
      })
      .from(students)
      .where(eq(students.group_id, groupId));

    // 3. Get attendance records for the session
    const records = await db
      .select({
        student_id: attendanceRecords.student_id,
        attendance_status: attendanceRecords.attendance_status,
      })
      .from(attendanceRecords)
      .where(eq(attendanceRecords.session_id, sessionId));

    // Map attendance status to students
    const recordMap = new Map(
      records.map((r) => [r.student_id, r.attendance_status])
    );

    const response = studentsInGroup.map((student) => ({
      ...student,
      attendance_status: recordMap.get(student.student_id) || "Not Marked",
    }));

    return NextResponse.json({ students: response });
  } catch {
    console.error("Attendance API Error");
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;
    const { students } = await req.json();

    if (!Array.isArray(students)) {
      return NextResponse.json(
        { error: "Invalid students array" },
        { status: 400 }
      );
    }

    // Prepare values for bulk upsert
    const values = students
      .filter(({ attendance_status }) =>
        ["Present", "Absent"].includes(attendance_status)
      )
      .map(({ student_id, attendance_status }) => ({
        session_id: sessionId,
        student_id,
        attendance_status,
        recorded_at: new Date(),
      }));

    // Bulk upsert using ON CONFLICT (Postgres only)
    await db
      .insert(attendanceRecords)
      .values(values)
      .onConflictDoUpdate({
        target: [attendanceRecords.session_id, attendanceRecords.student_id],
        set: {
          attendance_status: attendanceRecords.attendance_status,
          recorded_at: attendanceRecords.recorded_at,
        },
      });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
