import { auth } from "@/auth";
import { db } from "@/db/index";
import { subjects } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// GET all subjects
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
    const subjectType = searchParams.get("subject_type");
    const isActive = searchParams.get("is_active");

    // Build where conditions
    const whereConditions = [];
    if (subjectType) {
      whereConditions.push(eq(subjects.subject_type, subjectType as any));
    }
    if (isActive !== null) {
      whereConditions.push(eq(subjects.is_active, isActive === "true"));
    }

    let allSubjects;
    if (whereConditions.length > 0) {
      allSubjects = await db
        .select()
        .from(subjects)
        .where(
          whereConditions.length === 1
            ? whereConditions[0]
            : and(...whereConditions),
        )
        .orderBy(subjects.course_code);
    } else {
      allSubjects = await db
        .select()
        .from(subjects)
        .orderBy(subjects.course_code);
    }

    return NextResponse.json({
      success: true,
      data: allSubjects,
    });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST new subject
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
    const {
      course_code,
      course_name,
      short_name,
      subject_type,
      credits,
      theory_hours,
      lab_hours,
      tutorial_hours,
    } = body;

    // Validate required fields
    if (!course_code || !course_name) {
      return NextResponse.json(
        { error: "Missing required fields: course_code, course_name" },
        { status: 400 },
      );
    }

    // Validate subject_type if provided
    const validSubjectTypes = [
      "BS",
      "CSE",
      "DC",
      "EC",
      "DE",
      "ES",
      "Elective",
      "OC",
      "HU",
    ];
    if (subject_type && !validSubjectTypes.includes(subject_type)) {
      return NextResponse.json(
        {
          error: `Invalid subject_type. Must be one of: ${validSubjectTypes.join(", ")}`,
        },
        { status: 400 },
      );
    }

    // Check if subject with same course_code already exists
    const existingSubject = await db
      .select()
      .from(subjects)
      .where(eq(subjects.course_code, course_code))
      .limit(1);

    if (existingSubject.length > 0) {
      return NextResponse.json(
        { error: "Subject with this course code already exists" },
        { status: 409 },
      );
    }

    // Create new subject
    const newSubject = await db
      .insert(subjects)
      .values({
        course_code,
        course_name,
        short_name: short_name || null,
        subject_type: (subject_type as any) || "BS",
        credits: credits ? parseInt(credits) : null,
        theory_hours: theory_hours ? parseInt(theory_hours) : 0,
        lab_hours: lab_hours ? parseInt(lab_hours) : 0,
        tutorial_hours: tutorial_hours ? parseInt(tutorial_hours) : 0,
        is_active: true,
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newSubject[0],
      message: "Subject created successfully",
    });
  } catch (error) {
    console.error("Error creating subject:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
