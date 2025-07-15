import { auth } from "@/auth";
import { db } from "@/db";
import { classTeachers, users } from "@/db/schema";
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
      // Get teacher's assignments using unified approach
      const teacherAssignments = await db
        .select({
          id: classTeachers.id,
          allocation_type: classTeachers.allocation_type,
          timetable_entry_id: classTeachers.timetable_entry_id,
          lab_entry_id: classTeachers.lab_entry_id,
        })
        .from(classTeachers)
        .where(eq(classTeachers.teacher_id, userId));

      // Count by type for stats
      const regularClasses = teacherAssignments.filter(
        (a) => a.allocation_type === "class",
      ).length;
      const labClasses = teacherAssignments.filter(
        (a) => a.allocation_type === "lab",
      ).length;

      dashboardData.stats = {
        totalClasses: teacherAssignments.length,
        regularClasses: regularClasses,
        labClasses: labClasses,
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
