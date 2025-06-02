import { recurringClassSetups } from "@/db/schema";
import { db } from "@/index";
import { createClassSessionsFromRecurring } from "@/utils/scheduleGenerator";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      teacher_id,
      subject_id,
      group_id,
      days_of_week,
      start_time,
      end_time,
      session_type,
      semester_start_date,
      semester_end_date,
    } = body;

    // Validate inputs
    if (
      !teacher_id ||
      typeof teacher_id !== "string" ||
      !subject_id ||
      typeof subject_id !== "string" ||
      !group_id ||
      typeof group_id !== "string" ||
      !Array.isArray(days_of_week) ||
      !days_of_week.every((d) => typeof d === "number" && d >= 0 && d <= 6) ||
      !start_time ||
      typeof start_time !== "string" ||
      !semester_start_date ||
      typeof semester_start_date !== "string" ||
      !semester_end_date ||
      typeof semester_end_date !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid or missing fields" },
        { status: 400 }
      );
    }

    // Ensure session_type is one of the allowed values
    const allowedSessionTypes = ["Lecture", "Lab", "Tutorial", "Extras"];
    if (!allowedSessionTypes.includes(session_type)) {
      return NextResponse.json(
        { error: "Invalid session_type" },
        { status: 400 }
      );
    }

    // Insert into recurringClassSetups
    const [setup] = await db
      .insert(recurringClassSetups)
      .values({
        teacher_id,
        subject_id,
        group_id,
        days_of_week,
        start_time,
        end_time: end_time ?? null,
        session_type: session_type as "Lecture" | "Lab" | "Tutorial" | "Extras",
        semester_start_date,
        semester_end_date,
      })
      .returning();

    await createClassSessionsFromRecurring({
      recurringId: setup.id,
      group_id,
      subject_id,
      teacher_id,
      days_of_week,
      start_time,
      end_time,
      session_type,
      semester_start_date,
      semester_end_date,
    });

    return NextResponse.json({
      success: true,
      setup_id: setup.id,
    });
  } catch (error: unknown) {
    console.error("API Error:", error);
    const message =
      error && typeof error === "object" && "message" in error
        ? (error as { message?: string }).message
        : "Unknown error";
    return NextResponse.json(
      { error: "Server error", detail: message },
      { status: 500 }
    );
  }
}
