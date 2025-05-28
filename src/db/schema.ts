import {
  boolean,
  integer,
  boolean as pgBoolean,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  date,
  time,
  pgEnum,
  varchar,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

import { sql } from "drizzle-orm";

// Enum for Teacher Departments
export const teacherDepartmentEnum = pgEnum("teacher_department_enum", [
  "CSE",
  "ECE",
  "BS",
]);

// Enum for Class Session Types
export const classSessionTypeEnum = pgEnum("class_session_type_enum", [
  "Lecture",
  "Lab",
  "Tutorial",
  "Extras",
]);

// Enum for Class Session Statuses
export const classSessionStatusEnum = pgEnum("class_session_status_enum", [
  "Scheduled",
  "Completed",
  "Cancelled",
  "Rescheduled",
]); // Note: 'Rescheduled' had an extra quote in your input, I've corrected it.

// Enum for Subject Types
export const subjectTypeEnum = pgEnum("subject_type_enum", [
  "BS",
  "CSE",
  "DC",
  "EC",
  "DE",
  "ES",
  "Elective",
  "OC",
  "HU",
]);

// Enum for Holiday Types
export const holidayTypeEnum = pgEnum("holiday_type_enum", [
  "Holiday",
  "Exam",
  "Event",
  "Custom",
]);

//trial
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

// Subjects Table
export const subjects = pgTable("subjects", {
  id: uuid("id").defaultRandom().primaryKey(), // Changed from integer to uuid
  year: integer("year").notNull(),
  semester: integer("semester").notNull(),
  course_code: varchar("course_code", { length: 10 }).notNull(),
  course_name: text("course_name").notNull(),
  subject_type: subjectTypeEnum("subject_type").default("BS"), // Assuming 'BS' is a valid default from your list
  credits: integer("credits"),
  created_at: timestamp("created_at").defaultNow(),
});

// Groups Table
export const groups = pgTable("groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(), // Assuming a max length for name
  type: varchar("type", { length: 50 }).notNull(), // Assuming a max length for type (e.g., 'Batch', 'Section')
  parent_id: uuid("parent_id").references((): AnyPgColumn => groups.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }), // Self-referencing for hierarchy
  batch_year: integer("batch_year"),
  branch: varchar("branch", { length: 100 }),
  semester: integer("semester"),
});

// Teachers Table
export const teachers = pgTable("teachers", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  designation: text("designation"),
  department: teacherDepartmentEnum("department").notNull(),
  email: text("email").notNull().unique(),
  contact: varchar("contact", { length: 15 }), // Changed to varchar for phone numbers, integer is not suitable
  joined_at: timestamp("joined_at").defaultNow(), // Renamed from "joined" to be consistent with created_at
});

// Students Table
export const students = pgTable("students", {
  id: uuid("id").defaultRandom().primaryKey(),
  roll_number: varchar("roll_number", { length: 10 }).notNull().unique(),
  name: text("name").notNull(),
  group_id: uuid("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "restrict", onUpdate: "cascade" }),
  batch_year: integer("batch_year").notNull(),
  is_active: boolean("is_active").notNull().default(true),
  join_date: date("join_date")
    .notNull()
    .default(sql`CURRENT_DATE`),
  exit_date: date("exit_date"),
});

// Class Sessions Table
export const classSessions = pgTable("class_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  subject_id: uuid("subject_id")
    .notNull()
    .references(() => subjects.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  teacher_id: uuid("teacher_id")
    .notNull()
    .references(() => teachers.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }), // Or 'restrict' if a session must always have a teacher
  group_id: uuid("group_id")
    .notNull()
    .references(() => groups.id, { onDelete: "cascade", onUpdate: "cascade" }),
  type: classSessionTypeEnum("type"), // Nullable as per your original SQL for class_sessions.type
  date: date("date").notNull(),
  start_time: time("start_time").notNull(),
  end_time: time("end_time"),
  status: classSessionStatusEnum("status").notNull(),
  reason: text("reason"), // For cancellation or rescheduling
});

// Attendance Record Table
export const attendanceRecords = pgTable("attendance_record", {
  id: uuid("id").defaultRandom().primaryKey(),
  student_id: uuid("student_id")
    .notNull()
    .references(() => students.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  session_id: uuid("session_id")
    .notNull()
    .references(() => classSessions.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  attendance_status: text("attendance_status").notNull(), // Consider an enum: ['present', 'absent', 'late']
  recorded_at: timestamp("recorded_at").defaultNow(),
});

// Holiday Table
export const holidays = pgTable("holiday", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: date("date").notNull(),
  description: text("description"),
  type: holidayTypeEnum("type").notNull(),
});
