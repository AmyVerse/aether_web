import { sql } from "drizzle-orm";
import {
  boolean,
  date,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  time,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
  varchar,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";

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

export const userRoleEnum = pgEnum("user_role_enum", [
  "student",
  "teacher",
  "editor",
  "admin",
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

// --- Auth Schema ---

export const users = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").default("User"),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  password: text("password"), // only used for credentials login
  role: text("role"), // 'student' | 'teacher' | 'admin'
  roleId: text("role_id"), // your student/teacher ID
});

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey().notNull(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const accounts = pgTable("account", {
  id: serial("id").primaryKey().notNull().unique(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 255 }).notNull(),
  provider: varchar("provider", { length: 255 }).notNull(),
  providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: varchar("token_type", { length: 255 }),
  scope: varchar("scope", { length: 255 }),
  id_token: text("id_token"),
  session_state: varchar("session_state", { length: 255 }),
});

// --- ERP Schema ---

// Subjects Table - Enhanced for comprehensive subject management
export const subjects = pgTable("subjects", {
  id: uuid("id").defaultRandom().primaryKey(),
  course_code: varchar("course_code", { length: 10 }).notNull(),
  course_name: text("course_name").notNull(),
  short_name: varchar("short_name", { length: 10 }), // Abbreviation like "CVDL", "DMW", etc.
  subject_type: subjectTypeEnum("subject_type").default("BS"), // Assuming 'BS' is a valid default from your list
  credits: integer("credits"),
  theory_hours: integer("theory_hours").default(0),
  lab_hours: integer("lab_hours").default(0),
  tutorial_hours: integer("tutorial_hours").default(0),
  // Semester and branch mapping

  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
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
  email: text("email").notNull().unique(),
  roll_number: varchar("roll_number", { length: 10 }).notNull().unique(),
  name: text("name").notNull(),
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
  teacher_class_id: varchar("teacher_class_id", { length: 9 })
    .notNull()
    .references(() => classTeachers.id, { onDelete: "cascade" }),
  date: date("date").notNull(),
  start_time: time("start_time").notNull(),
  end_time: time("end_time"),
  status: classSessionStatusEnum("status").notNull().default("Scheduled"),
  notes: text("notes"),
  created_at: timestamp("created_at").defaultNow(),
});

// Attendance Records Table
export const attendanceRecords = pgTable(
  "attendance_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    student_id: uuid("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    session_id: varchar("session_id", { length: 9 })
      .notNull()
      .references(() => classSessions.id, { onDelete: "cascade" }),
    attendance_status: attendanceStatusEnum("attendance_status")
      .notNull()
      .default("Present"),
    recorded_at: timestamp("recorded_at", { withTimezone: true }).defaultNow(),
  },
  (table) => [
    unique("unique_student_session").on(table.student_id, table.session_id),
  ],
);

// Holiday Table
export const holidays = pgTable("holiday", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: date("date").notNull(),
  description: text("description"),
  type: holidayTypeEnum("type").notNull(),
});

// Additional Enums for the new scheduling system based on Excel format
export const branchEnum = pgEnum("branch_enum", [
  "CSE",
  "CSE-AIML",
  "CSE-DS",
  "CSE-HCIGT",
  "ECE",
  "ECE-IoT",
]);

export const sectionEnum = pgEnum("section_enum", ["A", "B", "C"]);

export const roomTypeEnum = pgEnum("room_type_enum", ["Classroom", "Lab"]);

export const semesterTypeEnum = pgEnum("semester_type_enum", ["odd", "even"]);

export const dayEnum = pgEnum("day_enum", [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]);

export const dayHalfEnum = pgEnum("day_half_enum", [
  "first_half", // 8:00 AM - 1:00 PM
  "second_half", // 1:00 PM - 6:00 PM
]);

export const timeSlotEnum = pgEnum("time_slot_enum", [
  "8:00-8:55",
  "9:00-9:55",
  "10:00-10:55",
  "11:00-11:55",
  "12:00-12:55",
  "13:00-13:55", // 1:00-1:55 PM
  "14:00-14:55", // 2:00-2:55 PM
  "15:00-15:55", // 3:00-3:55 PM
  "16:00-16:55", // 4:00-4:55 PM
  "17:00-17:55", // 5:00-5:55 PM
]);

// Rooms Master Table - All classrooms and labs with IDs
export const rooms = pgTable("rooms", {
  id: uuid("id").defaultRandom().primaryKey(),
  room_number: varchar("room_number", { length: 20 }).notNull().unique(), // CR-001, CR-101, etc.
  room_type: roomTypeEnum("room_type").notNull(),
  capacity: integer("capacity"),
  floor: integer("floor"),
  building: varchar("building", { length: 100 }),
  facilities: text("facilities").array(), // ['Projector', 'AC', 'Whiteboard']
  is_active: boolean("is_active").default(true),
  created_at: timestamp("created_at").defaultNow(),
});

// STEP 1: Classroom/Lab Allocation Table - Editor allocates rooms to branch+section+semester
export const classroomAllocations = pgTable(
  "classroom_allocations",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // Academic context
    academic_year: varchar("academic_year", { length: 20 }).notNull(), // "2025-2026"
    semester_type: semesterTypeEnum("semester_type").notNull(), // "odd" or "even"
    semester: integer("semester").notNull(), // 1, 3, 5, 7

    // Class details
    branch: branchEnum("branch").notNull(),
    section: sectionEnum("section").notNull(),

    // Room allocation
    room_id: uuid("room_id")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),

    // Day half allocation (null for labs - they can use any time)
    day_half: dayHalfEnum("day_half"), // null for labs, required for classrooms

    // System fields
    created_by: uuid("created_by").references(() => users.id),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    // For classrooms: Ensure one allocation per room+academic_context+day_half
    // For labs: Ensure one allocation per room+academic_context (day_half is null)
    // uniqueIndex("unique_room_allocation").on(
    //   table.room_id,
    //   table.academic_year,
    //   table.semester_type,
    //   table.day_half, // This handles both cases
    // ),
    // Ensure one room per branch+section+semester+day_half (null for labs)
    uniqueIndex("unique_class_allocation").on(
      table.academic_year,
      table.semester_type,
      table.semester,
      table.branch,
      table.section,
      table.day_half,
    ),
  ],
);

// STEP 2: Timetable Entries - Main entries linking allocations to subjects
export const timetableEntries = pgTable(
  "timetable_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // Reference to classroom allocation
    allocation_id: uuid("allocation_id")
      .notNull()
      .references(() => classroomAllocations.id, { onDelete: "cascade" }),

    // Subject being taught
    subject_id: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),

    // Additional metadata
    notes: text("notes"), // e.g., "Lab Session", "Tutorial", "CCN Lab (ECE-VII-A1)", etc.
    color_code: varchar("color_code", { length: 10 }), // For UI color coding

    // System fields
    created_by: uuid("created_by").references(() => users.id),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    // Ensure one subject per allocation (can have multiple timings)
    uniqueIndex("unique_allocation_subject").on(
      table.allocation_id,
      table.subject_id,
    ),
  ],
);

// STEP 3: Timetable Entry Timings - Multiple day/time slots for each timetable entry
export const timetableEntryTimings = pgTable(
  "timetable_entry_timings",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // Reference to timetable entry
    timetable_entry_id: uuid("timetable_entry_id")
      .notNull()
      .references(() => timetableEntries.id, { onDelete: "cascade" }),

    // Time slot details
    day: dayEnum("day").notNull(),
    time_slot: timeSlotEnum("time_slot").notNull(),

    // System fields
    created_by: uuid("created_by").references(() => users.id),
    created_at: timestamp("created_at").defaultNow(),
  },
  (table) => [
    // Ensure no duplicate timings for same entry
    uniqueIndex("unique_entry_timing").on(
      table.timetable_entry_id,
      table.day,
      table.time_slot,
    ),
  ],
);

// Lab Timetable Entries - Separate table for lab sessions with duration support
export const labTimetableEntries = pgTable(
  "lab_timetable_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // Room reference
    room_id: uuid("room_id")
      .notNull()
      .references(() => rooms.id, { onDelete: "cascade" }),

    // Subject being taught
    subject_id: uuid("subject_id")
      .notNull()
      .references(() => subjects.id, { onDelete: "cascade" }),

    // Academic details
    academic_year: varchar("academic_year", { length: 10 }).notNull(), // e.g., "2024-2025"
    semester_type: varchar("semester_type", { length: 10 }).notNull(), // "odd" or "even"
    semester: integer("semester").notNull(), // 1-8
    branch: varchar("branch", { length: 10 }).notNull(), // e.g., "CSE", "ECE"
    section: varchar("section", { length: 5 }).notNull(), // e.g., "A", "B"

    // Timing details
    day: varchar("day", { length: 10 }).notNull(), // "Monday", "Tuesday", etc.
    start_time: varchar("start_time", { length: 10 }).notNull(), // "8:00", "9:00", etc.
    end_time: varchar("end_time", { length: 10 }).notNull(), // "10:00", "12:00", etc.
    duration_hours: integer("duration_hours").notNull(), // 1, 2, 3, etc.

    // Additional metadata
    notes: text("notes"), // e.g., "Batch A1", "Advanced Lab"
    color_code: varchar("color_code", { length: 10 }), // For UI color coding

    // System fields
    created_by: uuid("created_by").references(() => users.id),
    created_at: timestamp("created_at").defaultNow(),
    updated_at: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    // Ensure no conflicts for same room, day, and overlapping time
    uniqueIndex("unique_lab_room_day_time").on(
      table.room_id,
      table.day,
      table.start_time,
    ),
  ],
);

// Teacher Classes Table - Links teachers to their assigned timetable entries (subjects/labs)
export const classTeachers = pgTable("class_teachers", {
  id: varchar("id", { length: 9 }).primaryKey(),
  teacher_id: uuid("teacher_id")
    .notNull()
    .references(() => teachers.id, { onDelete: "cascade" }),

  // Entry type and IDs - only one should be set based on allocation_type
  allocation_type: varchar("allocation_type", { length: 10 }).notNull(), // "class" or "lab"
  timetable_entry_id: uuid("timetable_entry_id").references(
    () => timetableEntries.id,
    { onDelete: "cascade" },
  ), // For regular classes
  lab_entry_id: uuid("lab_entry_id").references(() => labTimetableEntries.id, {
    onDelete: "cascade",
  }), // For lab assignments

  assigned_at: timestamp("assigned_at").defaultNow(),
  is_active: boolean("is_active").default(true),
  notes: text("notes"), // Teacher-specific notes for this subject/lab
});

// Class Students Table - Maps students to teacher classes (works for both classes and labs)
export const classStudents = pgTable("class_students", {
  id: uuid("id").defaultRandom().primaryKey(),
  teacher_class_id: varchar("teacher_class_id", { length: 9 })
    .notNull()
    .references(() => classTeachers.id, { onDelete: "cascade" }),
  student_id: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  enrolled_at: timestamp("enrolled_at").defaultNow(),
  is_active: boolean("is_active").default(true),
  notes: text("notes"), // Additional notes like "Batch A1", "Group 1", etc.
});
