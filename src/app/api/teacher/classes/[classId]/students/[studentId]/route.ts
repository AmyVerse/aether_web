import { auth } from "@/auth";
import { db } from "@/db/index";
import { classStudents, classTeachers, teachers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string; studentId: string }> },
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

    // Remove the student from the class
    const deletedRecord = await db
      .delete(classStudents)
      .where(eq(classStudents.id, resolvedParams.studentId))
      .returning();

    if (deletedRecord.length === 0) {
      return NextResponse.json(
        { error: "Student enrollment not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Student removed from class successfully",
    });
  } catch (error) {
    console.error("Error removing student from class:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
