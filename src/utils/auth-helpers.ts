import { users } from "@/db/schema";
import { db } from "@/index";
import { eq } from "drizzle-orm";

//Fetches a user by email from the database.

export async function getUserByEmail(email: string) {
  const res = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return res[0] || null;
}
