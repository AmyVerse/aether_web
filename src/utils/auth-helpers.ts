import { auth } from "@/auth";
import { classSessions, classTeachers, teachers, users } from "@/db/schema";
import { db } from "@/index";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

//Fetches a user by email from the database.

export async function getUserByEmail(email: string) {
  const res = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return res[0] || null;
}

// Teacher authentication helpers

export async function getTeacherByEmail(email: string) {
  const res = await db
    .select()
    .from(teachers)
    .where(eq(teachers.email, email))
    .limit(1);
  return res[0] || null;
}

export async function authenticateTeacher() {
  const session = await auth();
  if (!session?.user?.email) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const teacher = await getTeacherByEmail(session.user.email);
  if (!teacher) {
    return {
      error: NextResponse.json({ error: "Teacher not found" }, { status: 404 }),
    };
  }

  return { teacher };
}

export async function validateTeacherClass(teacherId: string, classId: string) {
  const teacherClass = await db
    .select()
    .from(classTeachers)
    .where(eq(classTeachers.id, classId))
    .limit(1);

  if (teacherClass.length === 0 || teacherClass[0].teacher_id !== teacherId) {
    return {
      error: NextResponse.json(
        { error: "Class not found or unauthorized" },
        { status: 403 },
      ),
    };
  }

  return { teacherClass: teacherClass[0] };
}

export async function validateTeacherSession(
  teacherId: string,
  sessionId: string,
) {
  const sessionData = await db
    .select({
      id: classSessions.id,
      teacher_class_id: classSessions.teacher_class_id,
      date: classSessions.date,
      start_time: classSessions.start_time,
      end_time: classSessions.end_time,
      status: classSessions.status,
      notes: classSessions.notes,
    })
    .from(classSessions)
    .innerJoin(
      classTeachers,
      eq(classSessions.teacher_class_id, classTeachers.id),
    )
    .where(
      and(
        eq(classSessions.id, sessionId),
        eq(classTeachers.teacher_id, teacherId),
      ),
    )
    .limit(1);

  if (sessionData.length === 0) {
    return {
      error: NextResponse.json(
        { error: "Session not found or unauthorized" },
        { status: 404 },
      ),
    };
  }

  return { session: sessionData[0] };
}
