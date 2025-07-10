import { auth } from "@/auth";
import { db } from "@/db/index";
import { timetableEntries, timetableEntriesTimings, users } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// POST new timetable entry
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission (editor, admin)
    if (!["editor", "admin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      academic_year,
      semester_type,
      semester,
      room_id,
      subject_id,
      branch,
      section,
      day,
      time_slot,
      notes,
      color_code,
    } = body;

    // Validate required fields
    if (!academic_year || !semester_type || !room_id || !day || !time_slot) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: academic_year, semester_type, room_id, day, time_slot",
        },
        { status: 400 },
      );
    }

    // Validate enums
    const validSemesterTypes = ["odd", "even"];
    const validDays = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const validTimeSlots = [
      "8:00-8:55",
      "9:00-9:55",
      "10:00-10:55",
      "11:00-11:55",
      "12:00-12:55",
      "13:00-13:55",
      "14:00-14:55",
      "15:00-15:55",
      "16:00-16:55",
      "17:00-17:55",
    ];
    const validBranches = [
      "CSE",
      "CSE-AIML",
      "CSE-DS",
      "CSE-HCIGT",
      "ECE",
      "ECE-IoT",
    ];
    const validSections = ["A", "B", "C"];

    if (!validSemesterTypes.includes(semester_type)) {
      return NextResponse.json(
        {
          error: `Invalid semester_type. Must be one of: ${validSemesterTypes.join(", ")}`,
        },
        { status: 400 },
      );
    }

    if (!validDays.includes(day)) {
      return NextResponse.json(
        { error: `Invalid day. Must be one of: ${validDays.join(", ")}` },
        { status: 400 },
      );
    }

    if (!validTimeSlots.includes(time_slot)) {
      return NextResponse.json(
        {
          error: `Invalid time_slot. Must be one of: ${validTimeSlots.join(", ")}`,
        },
        { status: 400 },
      );
    }

    if (branch && !validBranches.includes(branch)) {
      return NextResponse.json(
        {
          error: `Invalid branch. Must be one of: ${validBranches.join(", ")}`,
        },
        { status: 400 },
      );
    }

    if (section && !validSections.includes(section)) {
      return NextResponse.json(
        {
          error: `Invalid section. Must be one of: ${validSections.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Get current user for created_by
    const currentUser = await db
      .select()
      .from(users)
      .where(eq(users.email, session.user.email))
      .limit(1);

    // 1. Check if a timetable entry with the unique fields exists
    const whereClauses = [
      eq(timetableEntries.academic_year, academic_year),
      eq(timetableEntries.semester_type, semester_type as any),
      eq(timetableEntries.subject_id, subject_id),
      eq(timetableEntries.branch, branch as any),
      eq(timetableEntries.section, section as any),
      eq(timetableEntries.notes, notes),
    ];
    if (semester !== undefined && semester !== "") {
      whereClauses.push(eq(timetableEntries.semester, Number(semester)));
    }

    const existingEntry = await db
      .select()
      .from(timetableEntries)
      .where(and(...whereClauses))
      .limit(1);

    let timetableEntryId: string;
    let timetableEntry;
    if (existingEntry.length > 0) {
      // Entry exists, use its id
      timetableEntryId = existingEntry[0].id;
      timetableEntry = existingEntry[0];
    } else {
      // Insert new timetable entry (primary/class info only)
      const values: any = {
        academic_year,
        semester_type: semester_type as any,
        room_id,
        subject_id: subject_id || null,
        branch: (branch as any) || null,
        section: (section as any) || null,
        notes: notes,
        color_code: color_code || null,
        created_by: currentUser[0]?.id || null,
      };
      if (semester !== undefined && semester !== null && semester !== "") {
        values.semester = Number(semester);
      }
      const inserted = await db
        .insert(timetableEntries)
        .values(values)
        .returning();
      timetableEntryId = inserted[0].id;
      timetableEntry = inserted[0];
    }

    // 2. Insert into timetable_entries_timings (linking entry to day/time/room)
    // Check for conflicts: same day, time_slot, room for this timetable_entry_id
    const timingConflict = await db
      .select()
      .from(timetableEntriesTimings)
      .where(
        and(
          eq(timetableEntriesTimings.timetable_entry_id, timetableEntryId),
          eq(timetableEntriesTimings.day, day as any),
          eq(timetableEntriesTimings.time_slot, time_slot as any),
        ),
      )
      .limit(1);

    if (timingConflict.length > 0) {
      return NextResponse.json(
        { error: "Time slot already occupied for this class" },
        { status: 409 },
      );
    }

    const newTiming = await db
      .insert(timetableEntriesTimings)
      .values({
        timetable_entry_id: timetableEntryId,
        day: day as any,
        time_slot: time_slot as any,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: {
        ...timetableEntry,
        timings: [newTiming[0]],
      },
      message: "Timetable entry created successfully",
    });
  } catch (error) {
    console.error("Error creating timetable entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT update timetable entry (primary/class info only)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission (editor, admin)
    if (!["editor", "admin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { id, subject_id, branch, section, notes, color_code, semester } =
      body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "Missing required field: id" },
        { status: 400 },
      );
    }

    // Check if entry exists
    const existingEntry = await db
      .select()
      .from(timetableEntries)
      .where(eq(timetableEntries.id, id))
      .limit(1);

    if (existingEntry.length === 0) {
      return NextResponse.json(
        { error: "Timetable entry not found" },
        { status: 404 },
      );
    }

    // Update timetable entry
    const updatedEntry = await db
      .update(timetableEntries)
      .set({
        subject_id: subject_id,
        branch: branch as any,
        section: (section as any) || null,
        notes: notes || null,
        color_code: color_code || null,
        updated_at: new Date(),
        ...(semester !== undefined && semester !== null && semester !== ""
          ? { semester: Number(semester) }
          : {}),
      })
      .where(eq(timetableEntries.id, id))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedEntry[0],
      message: "Timetable entry updated successfully",
    });
  } catch (error) {
    console.error("Error updating timetable entry:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
