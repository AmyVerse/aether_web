import { auth } from "@/auth";
import { db } from "@/db/index";
import { classStudents, classTeachers, students, teachers } from "@/db/schema";
import { eq, notInArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
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

    // Get students already enrolled in this class
    const enrolledStudents = await db
      .select({
        student_id: classStudents.student_id,
      })
      .from(classStudents)
      .where(eq(classStudents.teacher_class_id, resolvedParams.classId));

    const enrolledStudentIds = enrolledStudents.map((s) => s.student_id);

    // Get all students who are not enrolled in this class
    let availableStudents;
    if (enrolledStudentIds.length > 0) {
      availableStudents = await db
        .select({
          id: students.id,
          name: students.name,
          email: students.email,
          roll_number: students.roll_number,
          batch_year: students.batch_year,
        })
        .from(students)
        .where(notInArray(students.id, enrolledStudentIds));
    } else {
      // If no students are enrolled, return all students
      availableStudents = await db
        .select({
          id: students.id,
          name: students.name,
          email: students.email,
          roll_number: students.roll_number,
          batch_year: students.batch_year,
        })
        .from(students);
    }

    return NextResponse.json({
      success: true,
      data: availableStudents,
    });
  } catch (error) {
    console.error("Error fetching available students:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
