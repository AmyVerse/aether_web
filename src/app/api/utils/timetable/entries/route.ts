import { db } from "@/db/index";
import {
  classroomAllocations,
  labTimetableEntries,
  rooms,
  subjects,
  timetableEntries,
  timetableEntryTimings,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get("subject");
    const branch = searchParams.get("branch");
    const section = searchParams.get("section");
    const semester = searchParams.get("semester");
    const day = searchParams.get("day");
    const time_slot = searchParams.get("time_slot");

    // Build where conditions for regular timetable entries
    const regularConditions = [];
    if (subject)
      regularConditions.push(eq(timetableEntries.subject_id, subject));
    // Note: branch, section, semester are now in classroomAllocations, not timetableEntries

    // Build where conditions for lab entries
    const labConditions = [];
    if (subject)
      labConditions.push(eq(labTimetableEntries.subject_id, subject));
    if (branch)
      labConditions.push(eq(labTimetableEntries.branch, branch as any));
    if (section)
      labConditions.push(eq(labTimetableEntries.section, section as any));
    if (semester)
      labConditions.push(eq(labTimetableEntries.semester, Number(semester)));
    if (day) labConditions.push(eq(labTimetableEntries.day, day));

    // Query regular timetable entries with allocation details
    const regularEntries = await db
      .select({
        id: timetableEntries.id,
        allocation_id: timetableEntries.allocation_id,
        subject_id: timetableEntries.subject_id,
        notes: timetableEntries.notes,
        color_code: timetableEntries.color_code,
        created_at: timetableEntries.created_at,
        // Get allocation details
        academic_year: classroomAllocations.academic_year,
        semester_type: classroomAllocations.semester_type,
        semester: classroomAllocations.semester,
        branch: classroomAllocations.branch,
        section: classroomAllocations.section,
        room_id: classroomAllocations.room_id,
        day_half: classroomAllocations.day_half,
      })
      .from(timetableEntries)
      .innerJoin(
        classroomAllocations,
        eq(timetableEntries.allocation_id, classroomAllocations.id),
      )
      .where(
        regularConditions.length > 0 ? and(...regularConditions) : undefined,
      );

    // Query lab entries
    const labEntries = await db
      .select({
        id: labTimetableEntries.id,
        subject_id: labTimetableEntries.subject_id,
        notes: labTimetableEntries.notes,
        color_code: labTimetableEntries.color_code,
        created_at: labTimetableEntries.created_at,
        // Lab-specific fields
        academic_year: labTimetableEntries.academic_year,
        semester_type: labTimetableEntries.semester_type,
        semester: labTimetableEntries.semester,
        branch: labTimetableEntries.branch,
        section: labTimetableEntries.section,
        room_id: labTimetableEntries.room_id,
        // Lab timing details
        day: labTimetableEntries.day,
        start_time: labTimetableEntries.start_time,
        end_time: labTimetableEntries.end_time,
        duration_hours: labTimetableEntries.duration_hours,
      })
      .from(labTimetableEntries)
      .where(labConditions.length > 0 ? and(...labConditions) : undefined);

    // Get all entry IDs for fetching related data
    const regularEntryIds = regularEntries.map((e) => e.id);
    const allEntryIds = [...regularEntryIds, ...labEntries.map((e) => e.id)];

    // Fetch timings for regular entries
    let regularTimings: any[] = [];
    if (regularEntryIds.length > 0) {
      const { inArray } = await import("drizzle-orm");
      regularTimings = await db
        .select({
          id: timetableEntryTimings.id,
          timetable_entry_id: timetableEntryTimings.timetable_entry_id,
          day: timetableEntryTimings.day,
          time_slot: timetableEntryTimings.time_slot,
        })
        .from(timetableEntryTimings)
        .where(
          inArray(timetableEntryTimings.timetable_entry_id, regularEntryIds),
        );
    }

    // Fetch subject info for all entries
    const subjectsMap = new Map();
    if (allEntryIds.length > 0) {
      const subjectIds = [
        ...regularEntries.map((e) => e.subject_id),
        ...labEntries.map((e) => e.subject_id),
      ].filter((id): id is string => Boolean(id));

      if (subjectIds.length > 0) {
        const { inArray } = await import("drizzle-orm");
        const subjectsList = await db
          .select({
            id: subjects.id,
            course_code: subjects.course_code,
            course_name: subjects.course_name,
          })
          .from(subjects)
          .where(inArray(subjects.id, subjectIds as string[]));
        for (const subj of subjectsList) {
          subjectsMap.set(subj.id, subj);
        }
      }
    }

    // Fetch room info for all entries
    const roomsMap = new Map();
    if (allEntryIds.length > 0) {
      const roomIds = [
        ...regularEntries.map((e) => e.room_id),
        ...labEntries.map((e) => e.room_id),
      ].filter((id): id is string => Boolean(id));

      if (roomIds.length > 0) {
        const { inArray } = await import("drizzle-orm");
        const roomsList = await db
          .select({
            id: rooms.id,
            room_number: rooms.room_number,
            room_type: rooms.room_type,
          })
          .from(rooms)
          .where(inArray(rooms.id, roomIds as string[]));
        for (const room of roomsList) {
          roomsMap.set(room.id, room);
        }
      }
    }

    // Group timings by timetable_entry_id for regular entries
    const timingsByEntry: Record<string, any[]> = {};
    for (const timing of regularTimings) {
      if (!timingsByEntry[timing.timetable_entry_id]) {
        timingsByEntry[timing.timetable_entry_id] = [];
      }
      timingsByEntry[timing.timetable_entry_id].push(timing);
    }

    // Process regular entries
    const processedRegularEntries = regularEntries.map((entry) => {
      const subj = entry.subject_id ? subjectsMap.get(entry.subject_id) : {};
      const room = entry.room_id ? roomsMap.get(entry.room_id) : {};
      return {
        ...entry,
        allocation_id: entry.allocation_id,
        entry_type: "regular" as const,
        day_half: entry.day_half,
        subject_code: subj?.course_code,
        subject_name: subj?.course_name,
        room_number: room?.room_number || "",
        room_type: room?.room_type || "",
        timings: timingsByEntry[entry.id as string] || [],
      };
    });

    // Process lab entries
    const processedLabEntries = labEntries.map((entry) => {
      const subj = entry.subject_id ? subjectsMap.get(entry.subject_id) : {};
      const room = entry.room_id ? roomsMap.get(entry.room_id) : {};
      return {
        ...entry,
        allocation_id: null, // Labs don't have allocations
        entry_type: "lab" as const,
        day_half: null, // Labs don't have day_half
        subject_code: subj?.course_code,
        subject_name: subj?.course_name,
        room_number: room?.room_number || "",
        room_type: room?.room_type || "",
        // For labs, create timing format similar to regular entries
        timings: [
          {
            id: entry.id,
            timetable_entry_id: entry.id,
            day: entry.day,
            time_slot: `${entry.start_time}-${entry.end_time}`,
          },
        ],
      };
    });

    // Combine and return both types
    const result = [...processedRegularEntries, ...processedLabEntries];

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching timetable entries:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
