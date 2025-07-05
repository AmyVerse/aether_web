import { auth } from "@/auth";
import { db } from "@/db/index";
import { teachers } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET all teachers
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has permission (teacher, editor, admin)
    if (!["teacher", "editor", "admin"].includes(session.user.role || "")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const department = searchParams.get("department");

    // Build where conditions
    const whereConditions = [];
    if (department) {
      whereConditions.push(eq(teachers.department, department as any));
    }

    let allTeachers;
    if (whereConditions.length > 0) {
      allTeachers = await db
        .select()
        .from(teachers)
        .where(
          whereConditions.length === 1
            ? whereConditions[0]
            : and(...whereConditions),
        )
        .orderBy(teachers.name);
    } else {
      allTeachers = await db.select().from(teachers).orderBy(teachers.name);
    }

    return NextResponse.json({
      success: true,
      data: allTeachers,
    });
  } catch (error) {
    console.error("Error fetching teachers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST new teacher
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
    const { name, email, department, designation, contact } = body;

    // Validate required fields
    if (!name || !email || !department) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, department" },
        { status: 400 },
      );
    }

    // Validate department
    const validDepartments = ["CSE", "ECE", "BS"];
    if (!validDepartments.includes(department)) {
      return NextResponse.json(
        { error: "Invalid department. Must be one of: CSE, ECE, BS" },
        { status: 400 },
      );
    }

    // Check if teacher with same email already exists
    const existingTeacher = await db
      .select()
      .from(teachers)
      .where(eq(teachers.email, email))
      .limit(1);

    if (existingTeacher.length > 0) {
      return NextResponse.json(
        { error: "Teacher with this email already exists" },
        { status: 409 },
      );
    }

    // Create new teacher
    const newTeacher = await db
      .insert(teachers)
      .values({
        name,
        email,
        department: department as any,
        designation: designation || null,
        contact: contact || null,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newTeacher[0],
      message: "Teacher created successfully",
    });
  } catch (error) {
    console.error("Error creating teacher:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
