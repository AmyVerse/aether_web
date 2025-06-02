import { db } from "@/index";
import { teachers } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await db.select().from(teachers);
    return NextResponse.json({ teachers: result });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch teachers" },
      { status: 500 }
    );
  }
}
