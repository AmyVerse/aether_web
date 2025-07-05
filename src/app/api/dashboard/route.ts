import { auth } from "@/auth";
import { db } from "@/db";
import { classTeachers, subjects, timetableEntries, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    // Get user profile
    const userProfile = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        image: users.image,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userProfile.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const dashboardData = {
      user: userProfile[0],
      stats: {},
      recentActivity: [],
    };

    // Add role-specific dashboard data
    if (userRole === "teacher") {
      // Get teacher's classes count
      const teacherClasses = await db
        .select({
          id: classTeachers.id,
          subject_name: subjects.course_name,
        })
        .from(classTeachers)
        .leftJoin(
          timetableEntries,
          eq(classTeachers.timetable_entry_id, timetableEntries.id),
        )
        .leftJoin(subjects, eq(timetableEntries.subject_id, subjects.id))
        .where(eq(classTeachers.teacher_id, userId));

      dashboardData.stats = {
        totalClasses: teacherClasses.length,
        // Add more teacher stats as needed
      };
    }

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
