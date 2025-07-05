import { auth } from "@/auth";
import { db } from "@/db/index";
import { students } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET all students
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
    const batchYear = searchParams.get("batch_year");
    const isActive = searchParams.get("is_active");

    // Build where conditions
    const whereConditions = [];
    if (batchYear) {
      whereConditions.push(eq(students.batch_year, parseInt(batchYear)));
    }
    if (isActive !== null) {
      whereConditions.push(eq(students.is_active, isActive === "true"));
    }

    let allStudents;
    if (whereConditions.length > 0) {
      allStudents = await db
        .select()
        .from(students)
        .where(
          whereConditions.length === 1
            ? whereConditions[0]
            : and(...whereConditions),
        )
        .orderBy(students.name);
    } else {
      allStudents = await db.select().from(students).orderBy(students.name);
    }

    return NextResponse.json({
      success: true,
      data: allStudents,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST new student
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
    const { email, roll_number, name, batch_year } = body;

    // Validate required fields
    if (!email || !roll_number || !name || !batch_year) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: email, roll_number, name, batch_year",
        },
        { status: 400 },
      );
    }

    // Check if student with same email or roll_number already exists
    const existingStudent = await db
      .select()
      .from(students)
      .where(eq(students.email, email))
      .limit(1);

    if (existingStudent.length > 0) {
      return NextResponse.json(
        { error: "Student with this email already exists" },
        { status: 409 },
      );
    }

    const existingRollNumber = await db
      .select()
      .from(students)
      .where(eq(students.roll_number, roll_number))
      .limit(1);

    if (existingRollNumber.length > 0) {
      return NextResponse.json(
        { error: "Student with this roll number already exists" },
        { status: 409 },
      );
    }

    // Create new student
    const newStudent = await db
      .insert(students)
      .values({
        email,
        roll_number,
        name,
        batch_year: parseInt(batch_year),
        is_active: true,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newStudent[0],
      message: "Student created successfully",
    });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
