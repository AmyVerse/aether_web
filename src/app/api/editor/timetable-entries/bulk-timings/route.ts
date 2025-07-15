import { auth } from "@/auth";
import { db } from "@/db";
import { timetableEntryTimings } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const entryIds = searchParams.get("entry_ids");

    if (!entryIds) {
      return NextResponse.json(
        { message: "entry_ids parameter is required" },
        { status: 400 },
      );
    }

    const entryIdArray = entryIds.split(",");

    const timings = await db
      .select()
      .from(timetableEntryTimings)
      .where(inArray(timetableEntryTimings.timetable_entry_id, entryIdArray));

    // Group timings by entry ID
    const timingsByEntry = timings.reduce(
      (acc, timing) => {
        if (!acc[timing.timetable_entry_id]) {
          acc[timing.timetable_entry_id] = [];
        }
        acc[timing.timetable_entry_id].push(timing);
        return acc;
      },
      {} as Record<string, typeof timings>,
    );

    return NextResponse.json(timingsByEntry);
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
