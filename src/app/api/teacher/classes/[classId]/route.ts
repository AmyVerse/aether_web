import { db } from "@/db/index";
import {
  classroomAllocations,
  classTeachers,
  labTimetableEntries,
  rooms,
  subjects,
  timetableEntries,
  timetableEntryTimings,
} from "@/db/schema";
import { authenticateTeacher } from "@/utils/auth-helpers";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> },
) {
  try {
    const { teacher, error } = await authenticateTeacher();
    if (error) return error;

    const resolvedParams = await params;

    // First, get the teacher class to determine allocation type
    const teacherClassResult = await db
      .select({
        id: classTeachers.id,
        teacher_id: classTeachers.teacher_id,
        allocation_type: classTeachers.allocation_type,
        timetable_entry_id: classTeachers.timetable_entry_id,
        lab_entry_id: classTeachers.lab_entry_id,
        assigned_at: classTeachers.assigned_at,
        is_active: classTeachers.is_active,
        notes: classTeachers.notes,
      })
      .from(classTeachers)
      .where(
        and(
          eq(classTeachers.id, resolvedParams.classId),
          eq(classTeachers.teacher_id, teacher.id),
          eq(classTeachers.is_active, true),
        ),
      );

    if (teacherClassResult.length === 0) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const teacherClass = teacherClassResult[0];

    if (
      teacherClass.allocation_type === "class" &&
      teacherClass.timetable_entry_id
    ) {
      // Handle regular class
      const classDetails = await db
        .select({
          id: classTeachers.id,
          allocation_type: classTeachers.allocation_type,
          subject_name: subjects.course_name,
          subject_code: subjects.course_code,
          subject_short_name: subjects.short_name,
          branch: classroomAllocations.branch,
          section: classroomAllocations.section,
          semester: classroomAllocations.semester,
          room_number: rooms.room_number,
          room_type: rooms.room_type,
          academic_year: classroomAllocations.academic_year,
          semester_type: classroomAllocations.semester_type,
          day_half: classroomAllocations.day_half,
          notes: classTeachers.notes,
          entry_notes: timetableEntries.notes,
          entry_color: timetableEntries.color_code,
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
        .innerJoin(subjects, eq(timetableEntries.subject_id, subjects.id))
        .innerJoin(rooms, eq(classroomAllocations.room_id, rooms.id))
        .where(eq(classTeachers.id, resolvedParams.classId))
        .limit(1);

      if (classDetails.length === 0) {
        return NextResponse.json(
          { error: "Class details not found" },
          { status: 404 },
        );
      }

      // Get timings for this timetable entry
      const timings = await db
        .select({
          id: timetableEntryTimings.id,
          day: timetableEntryTimings.day,
          time_slot: timetableEntryTimings.time_slot,
        })
        .from(timetableEntryTimings)
        .where(
          eq(
            timetableEntryTimings.timetable_entry_id,
            teacherClass.timetable_entry_id,
          ),
        );

      // For backward compatibility, pick the first timing as day/time_slot
      let day = "";
      let time_slot = "";
      if (timings.length > 0) {
        day = timings[0].day;
        time_slot = timings[0].time_slot;
      }

      return NextResponse.json({
        success: true,
        data: {
          ...classDetails[0],
          day,
          time_slot,
          timings: timings,
        },
      });
    } else if (
      teacherClass.allocation_type === "lab" &&
      teacherClass.lab_entry_id
    ) {
      // Handle lab entry
      const labDetails = await db
        .select({
          id: classTeachers.id,
          allocation_type: classTeachers.allocation_type,
          subject_name: subjects.course_name,
          subject_code: subjects.course_code,
          subject_short_name: subjects.short_name,
          branch: labTimetableEntries.branch,
          section: labTimetableEntries.section,
          semester: labTimetableEntries.semester,
          room_number: rooms.room_number,
          room_type: rooms.room_type,
          academic_year: labTimetableEntries.academic_year,
          semester_type: labTimetableEntries.semester_type,
          day: labTimetableEntries.day,
          start_time: labTimetableEntries.start_time,
          end_time: labTimetableEntries.end_time,
          duration_hours: labTimetableEntries.duration_hours,
          notes: classTeachers.notes,
          lab_notes: labTimetableEntries.notes,
          lab_color: labTimetableEntries.color_code,
        })
        .from(classTeachers)
        .innerJoin(
          labTimetableEntries,
          eq(classTeachers.lab_entry_id, labTimetableEntries.id),
        )
        .innerJoin(subjects, eq(labTimetableEntries.subject_id, subjects.id))
        .innerJoin(rooms, eq(labTimetableEntries.room_id, rooms.id))
        .where(eq(classTeachers.id, resolvedParams.classId))
        .limit(1);

      if (labDetails.length === 0) {
        return NextResponse.json(
          { error: "Lab details not found" },
          { status: 404 },
        );
      }

      // For labs, create timing from embedded timing info
      const timings = [
        {
          day: labDetails[0].day,
          time_slot: `${labDetails[0].start_time}-${labDetails[0].end_time}`,
        },
      ];

      return NextResponse.json({
        success: true,
        data: {
          ...labDetails[0],
          timings: timings,
        },
      });
    }

    return NextResponse.json(
      { error: "Invalid class configuration" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Error fetching class details:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
