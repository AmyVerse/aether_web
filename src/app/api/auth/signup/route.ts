import { students, teachers, users } from "@/db/schema";
import { db } from "@/index";
import { hash } from "bcrypt";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Check students and teachers for roleId, role, and name
    const student = await db
      .select()
      .from(students)
      .where(eq(students.email, email))
      .limit(1);
    const teacher = await db
      .select()
      .from(teachers)
      .where(eq(teachers.email, email))
      .limit(1);

    let roleId: string;
    let role: string = "student"; // Default role
    let name: string = "User"; // Default name

    if (student.length > 0) {
      roleId = student[0].id;
      role = "student";
      name = student[0].name || "User";
    } else if (teacher.length > 0) {
      roleId = teacher[0].id;
      role = "teacher";
      name = teacher[0].name || "User";
    } else {
      // If not found in either, you must still provide a roleId (notNull)
      roleId = crypto.randomUUID();
      // name remains "User"
      // role remains "student"
    }

    const hashedPassword = await hash(password, 10);

    await db.insert(users).values({
      id: crypto.randomUUID(),
      name,
      email,
      password: hashedPassword,
      roleId,
      role,
    });

    return NextResponse.json({ message: "User created" }, { status: 201 });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
