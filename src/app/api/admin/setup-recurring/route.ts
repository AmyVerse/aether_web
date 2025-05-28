import { holidays, recurringClassSetups } from "@/db/schema";
import { db } from "@/index";
import { customAlphabet } from "nanoid";
import { NextRequest, NextResponse } from "next/server";

function getDatesInRange(start: Date, end: Date) {
  const dates: Date[] = [];
  const current = new Date(start);
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

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

    // Validate inputs (same as before)
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
      !session_type ||
      typeof session_type !== "string" ||
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

    // 1. Insert into recurringClassSetups
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

    // 2. Generate class session dates
    const start = new Date(semester_start_date);
    const end = new Date(semester_end_date);
    const allDates = getDatesInRange(start, end);

    const targetDates = allDates.filter((d) =>
      days_of_week.includes(d.getDay())
    );

    // 3. Exclude holidays
    const holidayResults = await db
      .select({ date: holidays.date })
      .from(holidays);
    const holidaySet = new Set(
      holidayResults.map((h) => h.date.toString().split("T")[0])
    );

    const validDates = targetDates.filter((date) => {
      const iso = date.toISOString().split("T")[0];
      return !holidaySet.has(iso);
    });

    // Nanoid to generate unique 9-character IDs (alphanumeric)
    const nanoid = customAlphabet(
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
      9
    );

    // 4. Generate session objects for each valid date
    const sessionsToInsert = validDates.map((date) => ({
      id: nanoid(),
      subject_id,
      teacher_id,
      group_id,
      type: session_type,
      date: date,
      start_time,
      end_time: end_time ?? null,
      status: "Scheduled",
      reason: null,
    }));

    return NextResponse.json({
      success: true,
      inserted: sessionsToInsert.length,
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
