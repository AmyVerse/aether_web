// Opt out of edge — force Node.js runtime (faster for DBs)
export const runtime = "nodejs";

import { usersTable } from "@/db/schema";
import { db } from "@/index";
import { eq } from "drizzle-orm";

type User = {
  name: string;
  age: number;
  rollnumber: string;
  status: boolean;
};

// PUT /api/[id]
export async function PUT(req: Request) {
  const url = new URL(req.url);
  const id = Number(url.pathname.split("/").pop());
  if (isNaN(id))
    return new Response(JSON.stringify({ error: "Invalid ID" }), {
      status: 400,
    });

  // Accept all possible fields for update (including status)
  const { name, age, rollnumber, status } = await req.json();

  // Only update fields that are provided
  const updateData: Partial<User> = {};
  if (name !== undefined) updateData.name = name;
  if (age !== undefined) updateData.age = age;
  if (rollnumber !== undefined) updateData.rollnumber = rollnumber;
  if (status !== undefined) updateData.status = status;

  if (Object.keys(updateData).length === 0) {
    return new Response(JSON.stringify({ error: "No data to update" }), {
      status: 400,
    });
  }

  const updated = await db
    .update(usersTable)
    .set(updateData)
    .where(eq(usersTable.id, id))
    .returning();

  if (updated.length === 0) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
    });
  }

  return Response.json(updated[0]);
}

// DELETE /api/[id]
export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = Number(url.pathname.split("/").pop());
  if (isNaN(id))
    return new Response(JSON.stringify({ error: "Invalid ID" }), {
      status: 400,
    });

  const deleted = await db
    .delete(usersTable)
    .where(eq(usersTable.id, id))
    .returning();

  if (deleted.length === 0) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
    });
  }

  return new Response(null, { status: 204 });
}
