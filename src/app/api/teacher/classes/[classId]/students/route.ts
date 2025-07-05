import { auth } from "@/auth";
import { db } from "@/db/index";
import { classStudents, classTeachers, students, teachers } from "@/db/schema";
import { authenticateTeacher } from "@/utils/auth-helpers";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> },
) {
  try {
    const { teacher, error } = await authenticateTeacher();
    if (error) return error;

    const resolvedParams = await params;

    // Get students enrolled in this class - teacher is already authenticated
    const classStudentsList = await db
      .select({
        id: classStudents.id,
        enrolled_at: classStudents.enrolled_at,
        is_active: classStudents.is_active,
        notes: classStudents.notes,
        student: {
          id: students.id,
          name: students.name,
          email: students.email,
          roll_number: students.roll_number,
          batch_year: students.batch_year,
        },
      })
      .from(classStudents)
      .innerJoin(students, eq(classStudents.student_id, students.id))
      .where(eq(classStudents.teacher_class_id, resolvedParams.classId));

    return NextResponse.json({
      success: true,
      data: classStudentsList,
    });
  } catch (error) {
    console.error("Error fetching class students:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> },
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

    // Verify the class belongs to the current teacher
    const teacherClass = await db
      .select()
      .from(classTeachers)
      .where(eq(classTeachers.id, resolvedParams.classId))
      .limit(1);

    if (
      teacherClass.length === 0 ||
      teacherClass[0].teacher_id !== teacher[0].id
    ) {
      return NextResponse.json(
        { error: "Class not found or unauthorized" },
        { status: 403 },
      );
    }

    const { student_ids } = await request.json();

    if (
      !student_ids ||
      !Array.isArray(student_ids) ||
      student_ids.length === 0
    ) {
      return NextResponse.json(
        { error: "Student IDs are required" },
        { status: 400 },
      );
    }

    // Add students to the class
    const newClassStudents = await db
      .insert(classStudents)
      .values(
        student_ids.map((studentId: string) => ({
          teacher_class_id: resolvedParams.classId,
          student_id: studentId,
          is_active: true,
        })),
      )
      .returning();

    return NextResponse.json({
      success: true,
      data: newClassStudents,
    });
  } catch (error) {
    console.error("Error adding students to class:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
