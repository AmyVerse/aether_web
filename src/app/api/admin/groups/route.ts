import { db } from "@/index";
import { groups } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await db
      .select({
        id: groups.id,
        branch: groups.branch,
        name: groups.name,
        semester: groups.semester,
      })
      .from(groups);
    return NextResponse.json({ groups: result });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch groups" },
      { status: 500 }
    );
  }
}
