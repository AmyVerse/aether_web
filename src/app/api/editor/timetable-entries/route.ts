import { auth } from "@/auth";
import { db } from "@/db";
import {
  classroomAllocations,
  rooms,
  subjects,
  timetableEntries,
  timetableEntryTimings,
} from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const academic_year = searchParams.get("academic_year");
    const semester_type = searchParams.get("semester_type");
    const allocationIds = searchParams.get("allocation_ids");

    // Support both old and new API formats
    if (allocationIds) {
      // Old format - by allocation IDs
      const allocationIdArray = allocationIds.split(",");

      const entries = await db
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
        .where(inArray(timetableEntries.allocation_id, allocationIdArray));

      return NextResponse.json(entries);
    }

    // New format - comprehensive timetable grid
    if (!academic_year || !semester_type) {
      return NextResponse.json(
        { error: "academic_year and semester_type are required" },
        { status: 400 },
      );
    }

    // Fetch timetable entries with related data
    const entries = await db
      .select({
        // Timetable entry fields
        id: timetableEntries.id,
        notes: timetableEntries.notes,
        color_code: timetableEntries.color_code,

        // Allocation fields
        allocation_id: classroomAllocations.id,
        academic_year: classroomAllocations.academic_year,
        semester_type: classroomAllocations.semester_type,
        semester: classroomAllocations.semester,
        branch: classroomAllocations.branch,
        section: classroomAllocations.section,
        day_half: classroomAllocations.day_half,

        // Room fields
        room_id: rooms.id,
        room_number: rooms.room_number,
        room_type: rooms.room_type,
        capacity: rooms.capacity,
        floor: rooms.floor,
        building: rooms.building,

        // Subject fields
        subject_id: subjects.id,
        course_code: subjects.course_code,
        course_name: subjects.course_name,
        short_name: subjects.short_name,
      })
      .from(timetableEntries)
      .innerJoin(
        classroomAllocations,
        eq(timetableEntries.allocation_id, classroomAllocations.id),
      )
      .innerJoin(rooms, eq(classroomAllocations.room_id, rooms.id))
      .innerJoin(subjects, eq(timetableEntries.subject_id, subjects.id))
      .where(
        and(
          eq(classroomAllocations.academic_year, academic_year),
          eq(
            classroomAllocations.semester_type,
            semester_type as "odd" | "even",
          ),
        ),
      );

    // Get timings for all entries
    const entryIds = entries.map((entry) => entry.id);
    const timings =
      entryIds.length > 0
        ? await db
            .select()
            .from(timetableEntryTimings)
            .where(inArray(timetableEntryTimings.timetable_entry_id, entryIds))
        : [];

    // Group timings by timetable entry ID
    const timingsByEntry = timings.reduce(
      (acc, timing) => {
        if (!acc[timing.timetable_entry_id]) {
          acc[timing.timetable_entry_id] = [];
        }
        acc[timing.timetable_entry_id].push(timing);
        return acc;
      },
      {} as Record<string, typeof timings>,
    );

    // Format the response
    const formattedEntries = entries.map((entry) => ({
      id: entry.id,
      allocation: {
        id: entry.allocation_id,
        academic_year: entry.academic_year,
        semester_type: entry.semester_type,
        semester: entry.semester,
        branch: entry.branch,
        section: entry.section,
        day_half: entry.day_half,
        room: {
          id: entry.room_id,
          room_number: entry.room_number,
          room_type: entry.room_type,
          capacity: entry.capacity,
          floor: entry.floor,
          building: entry.building,
        },
      },
      subject: {
        id: entry.subject_id,
        course_code: entry.course_code,
        course_name: entry.course_name,
        short_name: entry.short_name,
      },
      timings: timingsByEntry[entry.id] || [],
      notes: entry.notes,
      color_code: entry.color_code,
    }));

    return NextResponse.json({
      success: true,
      entries: formattedEntries,
    });
  } catch (error) {
    console.error("Error fetching timetable entries:", error);
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
    const { allocation_id, subject_id, timings, notes, color_code } = body;

    // Validate required fields
    if (!allocation_id || !subject_id || !timings || !Array.isArray(timings)) {
      return NextResponse.json(
        {
          message: "allocation_id, subject_id, and timings array are required",
        },
        { status: 400 },
      );
    }

    // Create timetable entry
    const [newEntry] = await db
      .insert(timetableEntries)
      .values({
        allocation_id,
        subject_id,
        notes: notes || "",
        color_code: color_code || "#e5e7eb",
        created_by: session.user.id,
      })
      .returning();

    // Create timings for the entry
    if (timings.length > 0) {
      await db.insert(timetableEntryTimings).values(
        timings.map((timing: { day: string; time_slot: string }) => ({
          timetable_entry_id: newEntry.id,
          day: timing.day as
            | "Monday"
            | "Tuesday"
            | "Wednesday"
            | "Thursday"
            | "Friday"
            | "Saturday",
          time_slot: timing.time_slot as
            | "8:00-8:55"
            | "9:00-9:55"
            | "10:00-10:55"
            | "11:00-11:55"
            | "12:00-12:55"
            | "13:00-13:55"
            | "14:00-14:55"
            | "15:00-15:55"
            | "16:00-16:55"
            | "17:00-17:55",
          created_by: session.user.id,
        })),
      );
    }

    return NextResponse.json(
      {
        success: true,
        entry: newEntry,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating timetable entry:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
