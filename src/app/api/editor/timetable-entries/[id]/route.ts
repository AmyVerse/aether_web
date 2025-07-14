import { auth } from "@/auth";
import { db } from "@/db";
import { subjects, timetableEntries } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { allocation_id, subject_id, day, time_slot, notes, color_code } =
      body;

    if (!allocation_id || !day || !time_slot) {
      return NextResponse.json(
        { message: "Allocation ID, day, and time slot are required" },
        { status: 400 },
      );
    }

    const [entry] = await db
      .update(timetableEntries)
      .set({
        allocation_id,
        subject_id: subject_id || null,
        notes: notes || "",
        color_code: color_code || "#e5e7eb",
        updated_at: new Date(),
      })
      .where(eq(timetableEntries.id, id))
      .returning();

    if (!entry) {
      return NextResponse.json(
        { message: "Timetable entry not found" },
        { status: 404 },
      );
    }

    // Fetch the complete entry with subject details
    const completeEntry = await db
      .select({
        id: timetableEntries.id,
        allocation_id: timetableEntries.allocation_id,
        subject_id: timetableEntries.subject_id,
        notes: timetableEntries.notes,
        color_code: timetableEntries.color_code,
        created_at: timetableEntries.created_at,
        subject: {
          id: subjects.id,
          course_code: subjects.course_code,
          course_name: subjects.course_name,
          short_name: subjects.short_name,
        },
      })
      .from(timetableEntries)
      .leftJoin(subjects, eq(timetableEntries.subject_id, subjects.id))
      .where(eq(timetableEntries.id, entry.id));

    return NextResponse.json(completeEntry[0]);
  } catch (error) {
    console.error("Error updating timetable entry:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    const [entry] = await db
      .delete(timetableEntries)
      .where(eq(timetableEntries.id, id))
      .returning();

    if (!entry) {
      return NextResponse.json(
        { message: "Timetable entry not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Timetable entry deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting timetable entry:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
