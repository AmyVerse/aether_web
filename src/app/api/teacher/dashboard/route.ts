import { auth } from "@/auth";
import { db } from "@/db";
import {
  classSessions,
  classStudents,
  classTeachers,
  subjects,
  timetableEntries,
} from "@/db/schema";
import { count, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "teacher") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacherId = session.user.id;

    // Get teacher's classes with subject details and student counts
    const teacherClasses = await db
      .select({
        id: classTeachers.id,
        teacher_id: classTeachers.teacher_id,
        timetable_entry_id: classTeachers.timetable_entry_id,
        subject_name: subjects.course_name,
        subject_code: subjects.course_code,
        short_name: subjects.short_name,
        assigned_at: classTeachers.assigned_at,
        student_count: sql<number>`(
          SELECT COUNT(*) 
          FROM ${classStudents} 
          WHERE ${classStudents.teacher_class_id} = ${classTeachers.id}
        )`.as("student_count"),
      })
      .from(classTeachers)
      .leftJoin(
        timetableEntries,
        eq(classTeachers.timetable_entry_id, timetableEntries.id),
      )
      .leftJoin(subjects, eq(timetableEntries.subject_id, subjects.id))
      .where(eq(classTeachers.teacher_id, teacherId));

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
      classes: teacherClasses,
      sessions: recentSessions,
      stats: {
        totalClasses: teacherClasses.length,
        totalSessions: sessionCounts[0]?.count || 0,
        totalStudents: teacherClasses.reduce(
          (sum, cls) => sum + (cls.student_count || 0),
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
