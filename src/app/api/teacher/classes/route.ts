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
import { nanoid } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { teacher, error } = await authenticateTeacher();
    if (error) return error;

    const { timetable_entry_id, lab_entry_id, allocation_type } =
      await request.json();

    // Validate input - allocation_type is required
    if (!allocation_type || !["class", "lab"].includes(allocation_type)) {
      return NextResponse.json(
        { error: "allocation_type is required and must be 'class' or 'lab'" },
        { status: 400 },
      );
    }

    // Validate corresponding ID based on allocation_type
    if (allocation_type === "class" && !timetable_entry_id) {
      return NextResponse.json(
        {
          error:
            "timetable_entry_id is required when allocation_type is 'class'",
        },
        { status: 400 },
      );
    }

    if (allocation_type === "lab" && !lab_entry_id) {
      return NextResponse.json(
        { error: "lab_entry_id is required when allocation_type is 'lab'" },
        { status: 400 },
      );
    }

    // Check if teacher is already assigned to this entry
    const existingAssignment = await db
      .select()
      .from(classTeachers)
      .where(
        and(
          eq(classTeachers.teacher_id, teacher.id),
          eq(classTeachers.allocation_type, allocation_type),
          allocation_type === "class"
            ? eq(classTeachers.timetable_entry_id, timetable_entry_id)
            : eq(classTeachers.lab_entry_id, lab_entry_id),
        ),
      );

    if (existingAssignment.length > 0) {
      return NextResponse.json(
        { error: `You are already assigned to this ${allocation_type}` },
        { status: 400 },
      );
    }

    // Verify the entry exists
    if (allocation_type === "class") {
      const entryExists = await db
        .select()
        .from(timetableEntries)
        .where(eq(timetableEntries.id, timetable_entry_id));

      if (entryExists.length === 0) {
        return NextResponse.json(
          { error: "Timetable entry not found" },
          { status: 404 },
        );
      }
    } else {
      const labExists = await db
        .select()
        .from(labTimetableEntries)
        .where(eq(labTimetableEntries.id, lab_entry_id));

      if (labExists.length === 0) {
        return NextResponse.json(
          { error: "Lab entry not found" },
          { status: 404 },
        );
      }
    }

    // Add the assignment
    const newTeacherClass = await db
      .insert(classTeachers)
      .values({
        id: nanoid(9),
        teacher_id: teacher.id,
        allocation_type: allocation_type,
        timetable_entry_id:
          allocation_type === "class" ? timetable_entry_id : null,
        lab_entry_id: allocation_type === "lab" ? lab_entry_id : null,
        notes: null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newTeacherClass[0],
      type: allocation_type,
    });
  } catch (error) {
    console.error("Error adding teacher class:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { teacher, error } = await authenticateTeacher();
    if (error) return error;

    // Get session context from query params
    const { searchParams } = new URL(request.url);
    const academicYear = searchParams.get("academicYear");
    const semesterType = searchParams.get("semesterType");

    // Get all teacher assignments
    const teacherClasses = await db
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
          eq(classTeachers.teacher_id, teacher.id),
          eq(classTeachers.is_active, true),
        ),
      );

    // Process each assignment based on allocation_type and apply filters
    const classesWithDetails = await Promise.all(
      teacherClasses.map(async (teacherClass) => {
        const baseClass = {
          id: teacherClass.id,
          teacher_id: teacherClass.teacher_id,
          allocation_type: teacherClass.allocation_type,
          assigned_at: teacherClass.assigned_at,
          is_active: teacherClass.is_active,
          notes: teacherClass.notes,
        };

        if (
          teacherClass.allocation_type === "class" &&
          teacherClass.timetable_entry_id
        ) {
          // Fetch regular class details with full backtrace
          const classDetails = await db
            .select({
              entry_id: timetableEntries.id,
              subject_id: timetableEntries.subject_id,
              subject_name: subjects.course_name,
              subject_code: subjects.course_code,
              subject_short_name: subjects.short_name,
              allocation_id: timetableEntries.allocation_id,
              academic_year: classroomAllocations.academic_year,
              semester_type: classroomAllocations.semester_type,
              semester: classroomAllocations.semester,
              branch: classroomAllocations.branch,
              section: classroomAllocations.section,
              day_half: classroomAllocations.day_half,
              room_id: classroomAllocations.room_id,
              room_number: rooms.room_number,
              room_type: rooms.room_type,
              entry_notes: timetableEntries.notes,
              entry_color: timetableEntries.color_code,
            })
            .from(timetableEntries)
            .innerJoin(subjects, eq(timetableEntries.subject_id, subjects.id))
            .innerJoin(
              classroomAllocations,
              eq(timetableEntries.allocation_id, classroomAllocations.id),
            )
            .innerJoin(rooms, eq(classroomAllocations.room_id, rooms.id))
            .where(eq(timetableEntries.id, teacherClass.timetable_entry_id));

          if (classDetails.length === 0) return null;

          const classDetail = classDetails[0];

          // Apply session filters
          if (academicYear && classDetail.academic_year !== academicYear)
            return null;
          if (semesterType && classDetail.semester_type !== semesterType)
            return null;

          // Fetch timings for this entry
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

          return {
            ...baseClass,
            entry_details: classDetail,
            timings: timings,
          };
        } else if (
          teacherClass.allocation_type === "lab" &&
          teacherClass.lab_entry_id
        ) {
          // Fetch lab details
          const labDetails = await db
            .select({
              lab_id: labTimetableEntries.id,
              subject_id: labTimetableEntries.subject_id,
              subject_name: subjects.course_name,
              subject_code: subjects.course_code,
              subject_short_name: subjects.short_name,
              academic_year: labTimetableEntries.academic_year,
              semester_type: labTimetableEntries.semester_type,
              semester: labTimetableEntries.semester,
              branch: labTimetableEntries.branch,
              section: labTimetableEntries.section,
              day: labTimetableEntries.day,
              start_time: labTimetableEntries.start_time,
              end_time: labTimetableEntries.end_time,
              duration_hours: labTimetableEntries.duration_hours,
              room_id: labTimetableEntries.room_id,
              room_number: rooms.room_number,
              room_type: rooms.room_type,
              lab_notes: labTimetableEntries.notes,
              lab_color: labTimetableEntries.color_code,
            })
            .from(labTimetableEntries)
            .innerJoin(
              subjects,
              eq(labTimetableEntries.subject_id, subjects.id),
            )
            .innerJoin(rooms, eq(labTimetableEntries.room_id, rooms.id))
            .where(eq(labTimetableEntries.id, teacherClass.lab_entry_id));

          if (labDetails.length === 0) return null;

          const labDetail = labDetails[0];

          // Apply session filters
          if (academicYear && labDetail.academic_year !== academicYear)
            return null;
          if (semesterType && labDetail.semester_type !== semesterType)
            return null;

          return {
            ...baseClass,
            entry_details: labDetail,
            timings: [], // Labs have embedded timing info, not separate timings table
          };
        }

        return null;
      }),
    );

    // Filter out null results
    const validClasses = classesWithDetails.filter((cls) => cls !== null);

    return NextResponse.json({
      success: true,
      data: validClasses,
    });
  } catch (error) {
    console.error("Error fetching teacher classes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
