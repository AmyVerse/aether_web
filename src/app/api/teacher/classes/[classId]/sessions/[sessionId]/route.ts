import { db } from "@/db";
import {
  classSessions,
  classTeachers,
  subjects,
  timetableEntries,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string; sessionId: string }> },
) {
  try {
    const { classId, sessionId } = await params;

    // Get session data
    const sessionData = await db
      .select()
      .from(classSessions)
      .where(eq(classSessions.id, sessionId))
      .limit(1);

    if (sessionData.length === 0) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Get class data
    const classData = await db
      .select({
        id: classTeachers.id,
        subject_name: subjects.course_name,
        subject_code: subjects.course_code,
        short_name: subjects.short_name,
      })
      .from(classTeachers)
      .leftJoin(
        timetableEntries,
        eq(classTeachers.timetable_entry_id, timetableEntries.id),
      )
      .leftJoin(subjects, eq(timetableEntries.subject_id, subjects.id))
      .where(eq(classTeachers.id, classId))
      .limit(1);

    if (classData.length === 0) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json({
      session: sessionData[0],
      class: classData[0],
    });
  } catch (error) {
    console.error("Error fetching session data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH: Update a session
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string; sessionId: string }> },
) {
  try {
    const { classId, sessionId } = await params;
    const { date, start_time, end_time, notes, status } = await request.json();
    // Update session
    const updated = await db
      .update(classSessions)
      .set({ date, start_time, end_time, notes, status })
      .where(eq(classSessions.id, sessionId))
      .returning();
    if (!updated.length) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error("Error updating session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE: Delete a session
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string; sessionId: string }> },
) {
  try {
    const { classId, sessionId } = await params;
    // Delete session
    const deleted = await db
      .delete(classSessions)
      .where(eq(classSessions.id, sessionId))
      .returning();
    if (!deleted.length) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting session:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
