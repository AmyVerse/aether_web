import {
  integer,
  boolean as pgBoolean,
  pgTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  age: integer("age").notNull(),
  rollnumber: varchar("rollnumber", { length: 255 }).unique(),
  status: pgBoolean("status").notNull().default(true),
});

// --- NextAuth Schema ---

export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  password: text("password"), // only used for credentials login
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId").notNull(),
    type: text("type").$type<"oauth" | "credentials">().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (acc) => ({
    pk: primaryKey({ columns: [acc.provider, acc.providerAccountId] }),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_token",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    pk: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
);

// --- ERP Schema ---
export const subjects = pgTable("subjects", {
  id: integer("id").generatedAlwaysAsIdentity(),
  year: integer("year").notNull(),
  semester: integer("semester").notNull(),
  course_code: varchar("course_code", { length: 10 }).notNull(),
  course_name: text("course_name").notNull(),
  type: text("type"),
  credits: integer("credits"),
  created_at: timestamp("created_at").defaultNow(),
});
