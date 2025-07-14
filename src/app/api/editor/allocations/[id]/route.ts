import { auth } from "@/auth";
import { db } from "@/db";
import { classroomAllocations, rooms } from "@/db/schema";
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
    const {
      academic_year,
      semester_type,
      semester,
      branch,
      section,
      room_id,
      day_half,
    } = body;

    if (
      !academic_year ||
      !semester_type ||
      !semester ||
      !branch ||
      !section ||
      !room_id ||
      !day_half
    ) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 },
      );
    }

    const [allocation] = await db
      .update(classroomAllocations)
      .set({
        academic_year,
        semester_type,
        semester,
        branch,
        section,
        room_id,
        day_half,
        updated_at: new Date(),
      })
      .where(eq(classroomAllocations.id, id))
      .returning();

    if (!allocation) {
      return NextResponse.json(
        { message: "Allocation not found" },
        { status: 404 },
      );
    }

    // Fetch the complete allocation with room details
    const completeAllocation = await db
      .select({
        id: classroomAllocations.id,
        academic_year: classroomAllocations.academic_year,
        semester_type: classroomAllocations.semester_type,
        semester: classroomAllocations.semester,
        branch: classroomAllocations.branch,
        section: classroomAllocations.section,
        room_id: classroomAllocations.room_id,
        day_half: classroomAllocations.day_half,
        created_at: classroomAllocations.created_at,
        room: {
          id: rooms.id,
          room_number: rooms.room_number,
          room_type: rooms.room_type,
          capacity: rooms.capacity,
          building: rooms.building,
        },
      })
      .from(classroomAllocations)
      .innerJoin(rooms, eq(classroomAllocations.room_id, rooms.id))
      .where(eq(classroomAllocations.id, allocation.id));

    return NextResponse.json(completeAllocation[0]);
  } catch (error) {
    console.error("Error updating allocation:", error);
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

    const [allocation] = await db
      .delete(classroomAllocations)
      .where(eq(classroomAllocations.id, id))
      .returning();

    if (!allocation) {
      return NextResponse.json(
        { message: "Allocation not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Allocation deleted successfully" });
  } catch (error) {
    console.error("Error deleting allocation:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
