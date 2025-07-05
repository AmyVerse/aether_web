import { auth } from "@/auth";
import { db } from "@/db/index";
import {
  classSessions,
  classTeachers,
  subjects,
  teachers,
  timetableEntries,
} from "@/db/schema";
import { authenticateTeacher } from "@/utils/auth-helpers";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET - Fetch session details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  try {
    const { teacher, error } = await authenticateTeacher();
    if (error) return error;

    const resolvedParams = await params;

    // Get session details with class and subject information - teacher already authenticated
    const sessionDetails = await db
      .select({
        id: classSessions.id,
        teacher_class_id: classSessions.teacher_class_id,
        date: classSessions.date,
        start_time: classSessions.start_time,
        end_time: classSessions.end_time,
        status: classSessions.status,
        notes: classSessions.notes,
        created_at: classSessions.created_at,
        subject_name: subjects.course_name,
        subject_code: subjects.course_code,
        branch: timetableEntries.branch,
        section: timetableEntries.section,
        day: timetableEntries.day,
        time_slot: timetableEntries.time_slot,
      })
      .from(classSessions)
      .innerJoin(
        classTeachers,
        eq(classSessions.teacher_class_id, classTeachers.id),
      )
      .innerJoin(
        timetableEntries,
        eq(classTeachers.timetable_entry_id, timetableEntries.id),
      )
      .leftJoin(subjects, eq(timetableEntries.subject_id, subjects.id))
      .where(eq(classSessions.id, resolvedParams.sessionId))
      .limit(1);

    if (sessionDetails.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: sessionDetails[0],
    });
  } catch (error) {
    console.error("Error fetching session details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH - Update session details
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
        { error: "Session not found or unauthorized" },
        { status: 404 },
      );
    }

    const { date, start_time, end_time, status, notes } = await request.json();

    // Build update object with only provided fields
    const updateData: any = {};
    if (date !== undefined) updateData.date = date;
    if (start_time !== undefined) updateData.start_time = start_time;
    if (end_time !== undefined) updateData.end_time = end_time;
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 },
      );
    }

    // Update the session
    const updatedSession = await db
      .update(classSessions)
      .set(updateData)
      .where(eq(classSessions.id, resolvedParams.sessionId))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedSession[0],
    });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE - Cancel/delete session
export async function DELETE(
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
        { error: "Session not found or unauthorized" },
        { status: 404 },
      );
    }

    // Delete the session (cascade will handle attendance records)
    await db
      .delete(classSessions)
      .where(eq(classSessions.id, resolvedParams.sessionId));

    return NextResponse.json({
      success: true,
      message: "Session deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
