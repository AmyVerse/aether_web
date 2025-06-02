import {
  boolean,
  date,
  integer,
  boolean as pgBoolean,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  time,
  timestamp,
  uuid,
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

// Enum for Attendance Status
export const attendanceStatusEnum = pgEnum("attendance_status_enum", [
  "Present",
  "Absent",
  "Leave",
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
  userid: uuid("userid"), // Unique identifier for the user
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
  id: varchar("id", { length: 9 }).primaryKey(),
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

// Attendance Records Table
export const attendanceRecords = pgTable("attendance_record", {
  id: uuid("id").defaultRandom().primaryKey(),
  student_id: uuid("student_id").unique(),
  session_id: varchar("session_id", { length: 9 }).unique(),
  attendance_status: attendanceStatusEnum("attendance_status")
    .notNull()
    .default("Present"),
  recorded_at: timestamp("recorded_at", { withTimezone: true }).defaultNow(),
});

// Holiday Table
export const holidays = pgTable("holiday", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: date("date").notNull(),
  description: text("description"),
  type: holidayTypeEnum("type").notNull(),
});

export const recurringClassSetups = pgTable("recurring_class_setups", {
  id: uuid("id").defaultRandom().primaryKey(), // Use defaultRandom for UUID primary key
  teacher_id: uuid("teacher_id")
    .notNull()
    .references(() => teachers.id),
  subject_id: uuid("subject_id")
    .notNull()
    .references(() => subjects.id),
  group_id: uuid("group_id")
    .notNull()
    .references(() => groups.id),
  // days_of_week: 0=Sunday, 1=Monday, ..., 6=Saturday (aligns with JavaScript's getDay())
  days_of_week: integer("days_of_week").array().notNull(), // e.g., [1, 3, 5] for Mon, Wed, Fri
  start_time: time("start_time").notNull(), // e.g., '10:00:00'
  end_time: time("end_time"), // e.g., '11:00:00'
  session_type: classSessionTypeEnum("type"), // From your existing enum
  semester_start_date: date("semester_start_date").notNull(),
  semester_end_date: date("semester_end_date").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  // You might add an 'is_active' boolean or similar if setups can be disabled/archived
});
