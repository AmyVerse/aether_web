// Opt out of edge — force Node.js runtime (faster for DBs)
export const runtime = "nodejs";

import { usersTable } from "@/db/schema";
import { db } from "@/index";
import { eq } from "drizzle-orm";

// PUT /api/[id]
export async function PUT(req: Request) {
  const url = new URL(req.url);
  const id = Number(url.pathname.split("/").pop());
  if (isNaN(id))
    return new Response(JSON.stringify({ error: "Invalid ID" }), {
      status: 400,
    });

  const { name, age, email } = await req.json();

  const updated = await db
    .update(usersTable)
    .set({ name, age, email })
    .where(eq(usersTable.id, id))
    .returning();

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
