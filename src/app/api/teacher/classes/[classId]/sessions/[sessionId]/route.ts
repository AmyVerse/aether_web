import { db } from "@/db";
import {
  classroomAllocations,
  classSessions,
  classTeachers,
  labTimetableEntries,
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

    // Get teacher assignment to determine allocation type
    const teacherAssignment = await db
      .select({
        id: classTeachers.id,
        allocation_type: classTeachers.allocation_type,
        timetable_entry_id: classTeachers.timetable_entry_id,
        lab_entry_id: classTeachers.lab_entry_id,
      })
      .from(classTeachers)
      .where(eq(classTeachers.id, classId))
      .limit(1);

    if (teacherAssignment.length === 0) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const assignment = teacherAssignment[0];

    // Get class/lab details based on allocation type
    let classData;

    if (
      assignment.allocation_type === "class" &&
      assignment.timetable_entry_id
    ) {
      // Get regular class details
      const details = await db
        .select({
          id: classTeachers.id,
          allocation_type: classTeachers.allocation_type,
          subject_name: subjects.course_name,
          subject_code: subjects.course_code,
          short_name: subjects.short_name,
          branch: classroomAllocations.branch,
          section: classroomAllocations.section,
          semester: classroomAllocations.semester,
        })
        .from(classTeachers)
        .innerJoin(
          timetableEntries,
          eq(classTeachers.timetable_entry_id, timetableEntries.id),
        )
        .innerJoin(
          classroomAllocations,
          eq(timetableEntries.allocation_id, classroomAllocations.id),
        )
        .leftJoin(subjects, eq(timetableEntries.subject_id, subjects.id))
        .where(eq(classTeachers.id, classId))
        .limit(1);

      classData = details[0] || null;
    } else if (
      assignment.allocation_type === "lab" &&
      assignment.lab_entry_id
    ) {
      // Get lab details
      const details = await db
        .select({
          id: classTeachers.id,
          allocation_type: classTeachers.allocation_type,
          subject_name: subjects.course_name,
          subject_code: subjects.course_code,
          short_name: subjects.short_name,
          branch: labTimetableEntries.branch,
          section: labTimetableEntries.section,
          semester: labTimetableEntries.semester,
        })
        .from(classTeachers)
        .innerJoin(
          labTimetableEntries,
          eq(classTeachers.lab_entry_id, labTimetableEntries.id),
        )
        .leftJoin(subjects, eq(labTimetableEntries.subject_id, subjects.id))
        .where(eq(classTeachers.id, classId))
        .limit(1);

      classData = details[0] || null;
    }

    if (!classData) {
      return NextResponse.json(
        { error: "Class details not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      session: sessionData[0],
      class: classData,
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
