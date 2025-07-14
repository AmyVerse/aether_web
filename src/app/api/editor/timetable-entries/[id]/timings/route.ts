import { auth } from "@/auth";
import { db } from "@/db";
import { timetableEntryTimings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const timings = await db
      .select()
      .from(timetableEntryTimings)
      .where(eq(timetableEntryTimings.timetable_entry_id, id));

    return NextResponse.json(timings);
  } catch (error) {
    console.error("Error fetching timetable entry timings:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { day, time_slot } = body;

    if (!day || !time_slot) {
      return NextResponse.json(
        { message: "Day and time_slot are required" },
        { status: 400 },
      );
    }

    const newTiming = await db
      .insert(timetableEntryTimings)
      .values({
        timetable_entry_id: id,
        day,
        time_slot,
        created_by: session.user.id,
      })
      .returning();

    return NextResponse.json(newTiming[0], { status: 201 });
  } catch (error) {
    console.error("Error creating timetable entry timing:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
