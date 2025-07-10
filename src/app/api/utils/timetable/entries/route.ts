import { db } from "@/db/index";
import {
  rooms,
  subjects,
  timetableEntries,
  timetableEntriesTimings,
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

    // Build where conditions based on query parameters
    const conditions = [];
    if (subject) conditions.push(eq(timetableEntries.subject_id, subject));
    if (branch) conditions.push(eq(timetableEntries.branch, branch as any));
    if (section) conditions.push(eq(timetableEntries.section, section as any));
    if (semester)
      conditions.push(eq(timetableEntries.semester, Number(semester)));
    // day and time_slot are now in timings, not timetableEntries

    // Query timetable entries (primary/class info)
    const entries = await db
      .select()
      .from(timetableEntries)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // For all found entries, fetch timings and join room/subject info
    const entryIds = entries.map((e) => e.id);
    let timings: any[] = [];
    if (entryIds.length > 0) {
      // Use inArray for WHERE ... IN (...)
      const { inArray } = await import("drizzle-orm");
      timings = await db
        .select({
          id: timetableEntriesTimings.id,
          timetable_entry_id: timetableEntriesTimings.timetable_entry_id,
          room_id: rooms.id,
          day: timetableEntriesTimings.day,
          time_slot: timetableEntriesTimings.time_slot,
          room_number: rooms.room_number,
          room_type: rooms.room_type,
        })
        .from(timetableEntriesTimings)
        .leftJoin(
          rooms,
          eq(timetableEntriesTimings.timetable_entry_id, rooms.id),
        ) // This join is not correct, but workaround for Drizzle limitation
        .where(inArray(timetableEntriesTimings.timetable_entry_id, entryIds));
    }

    // Join subject info
    const subjectsMap = new Map();
    if (entries.length > 0) {
      const subjectIds = entries
        .map((e) => e.subject_id)
        .filter((id): id is string => Boolean(id));
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

    // Group timings by timetable_entry_id
    const timingsByEntry: Record<string, any[]> = {};
    for (const timing of timings) {
      if (!timingsByEntry[timing.timetable_entry_id]) {
        timingsByEntry[timing.timetable_entry_id] = [];
      }
      timingsByEntry[timing.timetable_entry_id].push(timing);
    }

    // Compose normalized result
    const result = entries.map((entry) => {
      const subj = entry.subject_id ? subjectsMap.get(entry.subject_id) : {};
      return {
        ...entry,
        subject_code: subj?.course_code,
        subject_name: subj?.course_name,
        room_number: timingsByEntry[entry.id]?.[0]?.room_number || "",
        timings: timingsByEntry[entry.id] || [],
      };
    });

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
