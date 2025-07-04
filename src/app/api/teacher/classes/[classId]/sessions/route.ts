import { auth } from "@/auth";
import { db } from "@/db/index";
import { classSessions, classTeachers, teachers } from "@/db/schema";
import { authenticateTeacher } from "@/utils/auth-helpers";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

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

    const { date, start_time, end_time, notes } = await request.json();

    if (!date || !start_time) {
      return NextResponse.json(
        { error: "Date and start time are required" },
        { status: 400 },
      );
    }

    // Generate unique session ID using nanoid
    const sessionId = nanoid(9); // 9 characters as per schema

    // Create the session
    const newSession = await db
      .insert(classSessions)
      .values({
        id: sessionId,
        teacher_class_id: resolvedParams.classId,
        date,
        start_time,
        end_time: end_time || null,
        status: "Scheduled",
        notes: notes || null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newSession[0],
    });
  } catch (error) {
    console.error("Error creating session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> },
) {
  try {
    const { teacher, error } = await authenticateTeacher();
    if (error) return error;

    const resolvedParams = await params;

    // Get sessions with authorization check in a single query
    const sessions = await db
      .select({
        id: classSessions.id,
        teacher_class_id: classSessions.teacher_class_id,
        date: classSessions.date,
        start_time: classSessions.start_time,
        end_time: classSessions.end_time,
        status: classSessions.status,
        notes: classSessions.notes,
        created_at: classSessions.created_at,
      })
      .from(classSessions)
      .innerJoin(
        classTeachers,
        eq(classSessions.teacher_class_id, classTeachers.id),
      )
      .where(
        and(
          eq(classSessions.teacher_class_id, resolvedParams.classId),
          eq(classTeachers.teacher_id, teacher.id),
        ),
      )
      .orderBy(classSessions.date, classSessions.start_time);

    return NextResponse.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
