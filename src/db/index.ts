import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create the neon database connection
const sql = neon(process.env.DATABASE_URL!);

// Create and export the drizzle database instance
export const db = drizzle(sql, { schema });

// Export all schema for easy access
export * from "./schema";
