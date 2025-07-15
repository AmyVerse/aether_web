import { auth } from "@/auth";
import { db } from "@/db";
import {
  classroomAllocations,
  classSessions,
  classStudents,
  classTeachers,
  labTimetableEntries,
  rooms,
  subjects,
  timetableEntries,
} from "@/db/schema";
import { and, count, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacherId = session.user.id;

    // Get all teacher assignments using the new unified structure
    const teacherAssignments = await db
      .select({
        id: classTeachers.id,
        allocation_type: classTeachers.allocation_type,
        timetable_entry_id: classTeachers.timetable_entry_id,
        lab_entry_id: classTeachers.lab_entry_id,
        assigned_at: classTeachers.assigned_at,
        is_active: classTeachers.is_active,
      })
      .from(classTeachers)
      .where(
        and(
          eq(classTeachers.teacher_id, teacherId),
          eq(classTeachers.is_active, true),
        ),
      );

    // Process each assignment to get details
    const allClasses = await Promise.all(
      teacherAssignments.map(async (assignment) => {
        const baseInfo = {
          id: assignment.id,
          teacher_id: teacherId,
          assigned_at: assignment.assigned_at,
          allocation_type: assignment.allocation_type,
        };

        if (
          assignment.allocation_type === "class" &&
          assignment.timetable_entry_id
        ) {
          // Get regular class details with backtrace
          const classDetails = await db
            .select({
              subject_name: subjects.course_name,
              subject_code: subjects.course_code,
              short_name: subjects.short_name,
              branch: classroomAllocations.branch,
              section: classroomAllocations.section,
              semester: classroomAllocations.semester,
              room_number: rooms.room_number,
              room_type: rooms.room_type,
              academic_year: classroomAllocations.academic_year,
              semester_type: classroomAllocations.semester_type,
            })
            .from(timetableEntries)
            .innerJoin(subjects, eq(timetableEntries.subject_id, subjects.id))
            .innerJoin(
              classroomAllocations,
              eq(timetableEntries.allocation_id, classroomAllocations.id),
            )
            .innerJoin(rooms, eq(classroomAllocations.room_id, rooms.id))
            .where(eq(timetableEntries.id, assignment.timetable_entry_id));

          if (classDetails.length === 0) return null;

          // Get student count for this class
          const studentCount = await db
            .select({ count: count() })
            .from(classStudents)
            .where(eq(classStudents.teacher_class_id, assignment.id));

          return {
            ...baseInfo,
            ...classDetails[0],
            class_type: "regular",
            student_count: studentCount[0]?.count || 0,
          };
        } else if (
          assignment.allocation_type === "lab" &&
          assignment.lab_entry_id
        ) {
          // Get lab details
          const labDetails = await db
            .select({
              subject_name: subjects.course_name,
              subject_code: subjects.course_code,
              short_name: subjects.short_name,
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
            })
            .from(labTimetableEntries)
            .innerJoin(
              subjects,
              eq(labTimetableEntries.subject_id, subjects.id),
            )
            .innerJoin(rooms, eq(labTimetableEntries.room_id, rooms.id))
            .where(eq(labTimetableEntries.id, assignment.lab_entry_id));

          if (labDetails.length === 0) return null;

          // Get student count for this lab
          const studentCount = await db
            .select({ count: count() })
            .from(classStudents)
            .where(eq(classStudents.teacher_class_id, assignment.id));

          return {
            ...baseInfo,
            ...labDetails[0],
            class_type: "lab",
            student_count: studentCount[0]?.count || 0,
          };
        }

        return null;
      }),
    );

    // Filter out null results
    const validClasses = allClasses.filter((cls) => cls !== null);

    // Get recent sessions for today's classes calculation
    const recentSessions = await db
      .select({
        id: classSessions.id,
        date: classSessions.date,
        teacher_class_id: classSessions.teacher_class_id,
      })
      .from(classSessions)
      .leftJoin(
        classTeachers,
        eq(classSessions.teacher_class_id, classTeachers.id),
      )
      .where(eq(classTeachers.teacher_id, teacherId));

    // Get total sessions count for this teacher
    const sessionCounts = await db
      .select({ count: count() })
      .from(classSessions)
      .leftJoin(
        classTeachers,
        eq(classSessions.teacher_class_id, classTeachers.id),
      )
      .where(eq(classTeachers.teacher_id, teacherId));

    const dashboardData = {
      classes: validClasses,
      sessions: recentSessions,
      stats: {
        totalClasses: validClasses.length,
        totalSessions: sessionCounts[0]?.count || 0,
        totalStudents: validClasses.reduce(
          (sum: number, cls: any) => sum + (cls.student_count || 0),
          0,
        ),
      },
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Error fetching teacher dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
