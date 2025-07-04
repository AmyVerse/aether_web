import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./db/schema";

// Export database instance with schema for better type safety
export const db = drizzle(process.env.DATABASE_URL!, { schema });
