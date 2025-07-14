import { auth } from "@/auth";
import { db } from "@/db";
import { classroomAllocations, rooms } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get("academic_year");
    const semesterType = searchParams.get("semester_type");

    let whereConditions: any[] = [];

    // If specific filters are provided, use them
    if (academicYear && semesterType) {
      whereConditions = [
        eq(classroomAllocations.academic_year, academicYear),
        eq(classroomAllocations.semester_type, semesterType as "odd" | "even"),
      ];
    }

    const query = db
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
      .innerJoin(rooms, eq(classroomAllocations.room_id, rooms.id));

    // Apply filters if provided
    const allocations =
      whereConditions.length > 0
        ? await query.where(and(...whereConditions))
        : await query;

    return NextResponse.json(allocations);
  } catch (error) {
    console.error("Error fetching allocations:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

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
      !room_id
    ) {
      return NextResponse.json(
        {
          message:
            "Academic year, semester type, semester, branch, section, and room are required",
        },
        { status: 400 },
      );
    }

    // Validate day_half is provided for classroom allocations
    // For lab allocations, day_half can be null
    const room = await db
      .select()
      .from(rooms)
      .where(eq(rooms.id, room_id))
      .limit(1);

    if (room.length === 0) {
      return NextResponse.json({ message: "Room not found" }, { status: 404 });
    }

    const isClassroom = room[0].room_type === "Classroom";
    if (isClassroom && !day_half) {
      return NextResponse.json(
        { message: "Day half is required for classroom allocations" },
        { status: 400 },
      );
    }

    // Check if allocation already exists
    const existingAllocationConditions = [
      eq(classroomAllocations.academic_year, academic_year),
      eq(classroomAllocations.semester_type, semester_type),
      eq(classroomAllocations.semester, semester),
      eq(classroomAllocations.branch, branch),
      eq(classroomAllocations.section, section),
    ];

    // Add day_half condition only if it's provided (for classrooms)
    if (day_half) {
      existingAllocationConditions.push(
        eq(classroomAllocations.day_half, day_half),
      );
    }

    const existingAllocation = await db
      .select()
      .from(classroomAllocations)
      .where(and(...existingAllocationConditions));

    if (existingAllocation.length > 0) {
      const errorMessage = day_half
        ? "Allocation already exists for this class and day half"
        : "Lab allocation already exists for this class";
      return NextResponse.json({ message: errorMessage }, { status: 409 });
    }

    const [allocation] = await db
      .insert(classroomAllocations)
      .values({
        academic_year,
        semester_type,
        semester,
        branch,
        section,
        room_id,
        day_half: day_half || null, // Explicitly set to null for labs
        created_by: session.user.id,
      })
      .returning();

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

    return NextResponse.json(completeAllocation[0], { status: 201 });
  } catch (error) {
    console.error("Error creating allocation:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
