// Opt out of edge — force Node.js runtime (faster for DBs)
export const runtime = "nodejs";

import { usersTable } from "@/db/schema";
import { db } from "@/index"; // Drizzle client



export async function GET() {
  const users = await db
    .select()
    .from(usersTable)
    .orderBy(usersTable.rollnumber);
  return Response.json(users);
}





export async function POST(request: Request) {
  const { name, age, rollnumber, status } = await request.json();
  const inserted = await db
    .insert(usersTable)
    .values({ name, age, rollnumber, status })
    .returning();
  return Response.json(inserted[0], { status: 201 });
}
