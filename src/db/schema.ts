import {
  integer,
  boolean as pgBoolean,
  pgTable,
  varchar,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  rollnumber: varchar({ length: 255 }).unique(),
  status: pgBoolean().notNull().default(true), // true for present, false for absent
});
