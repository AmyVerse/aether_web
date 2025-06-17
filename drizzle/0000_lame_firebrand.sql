CREATE TYPE "public"."attendance_status_enum" AS ENUM('Present', 'Absent', 'Leave');--> statement-breakpoint
CREATE TYPE "public"."class_session_status_enum" AS ENUM('Scheduled', 'Completed', 'Cancelled', 'Rescheduled');--> statement-breakpoint
CREATE TYPE "public"."class_session_type_enum" AS ENUM('Lecture', 'Lab', 'Tutorial', 'Extras');--> statement-breakpoint
CREATE TYPE "public"."holiday_type_enum" AS ENUM('Holiday', 'Exam', 'Event', 'Custom');--> statement-breakpoint
CREATE TYPE "public"."subject_type_enum" AS ENUM('BS', 'CSE', 'DC', 'EC', 'DE', 'ES', 'Elective', 'OC', 'HU');--> statement-breakpoint
CREATE TYPE "public"."teacher_department_enum" AS ENUM('CSE', 'ECE', 'BS');--> statement-breakpoint
CREATE TYPE "public"."user_role_enum" AS ENUM('student', 'teacher', 'editor', 'admin');--> statement-breakpoint
CREATE TABLE "account" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" timestamp,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "account_id_unique" UNIQUE("id")
);
--> statement-breakpoint
CREATE TABLE "attendance_record" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_id" uuid,
	"session_id" varchar(9),
	"attendance_status" "attendance_status_enum" DEFAULT 'Present' NOT NULL,
	"recorded_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "attendance_record_student_id_unique" UNIQUE("student_id"),
	CONSTRAINT "attendance_record_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "class_sessions" (
	"id" varchar(9) PRIMARY KEY NOT NULL,
	"subject_id" uuid NOT NULL,
	"teacher_id" uuid NOT NULL,
	"group_id" uuid NOT NULL,
	"type" "class_session_type_enum",
	"date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time,
	"status" "class_session_status_enum" NOT NULL,
	"reason" text
);
--> statement-breakpoint
CREATE TABLE "groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"parent_id" uuid,
	"batch_year" integer,
	"branch" varchar(100),
	"semester" integer
);
--> statement-breakpoint
CREATE TABLE "holiday" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" date NOT NULL,
	"description" text,
	"type" "holiday_type_enum" NOT NULL
);
--> statement-breakpoint
CREATE TABLE "recurring_class_setups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"teacher_id" uuid NOT NULL,
	"subject_id" uuid NOT NULL,
	"group_id" uuid NOT NULL,
	"days_of_week" integer[] NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time,
	"type" "class_session_type_enum",
	"semester_start_date" date NOT NULL,
	"semester_end_date" date NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "session" (
	"session_token" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"roll_number" varchar(10) NOT NULL,
	"name" text NOT NULL,
	"batch_year" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"join_date" date DEFAULT CURRENT_DATE NOT NULL,
	"exit_date" date,
	CONSTRAINT "students_email_unique" UNIQUE("email"),
	CONSTRAINT "students_roll_number_unique" UNIQUE("roll_number")
);
--> statement-breakpoint
CREATE TABLE "subjects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"year" integer NOT NULL,
	"semester" integer NOT NULL,
	"course_code" varchar(10) NOT NULL,
	"course_name" text NOT NULL,
	"subject_type" "subject_type_enum" DEFAULT 'BS',
	"credits" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "teachers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"designation" text,
	"department" "teacher_department_enum" NOT NULL,
	"email" text NOT NULL,
	"contact" varchar(15),
	"joined_at" timestamp DEFAULT now(),
	CONSTRAINT "teachers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text DEFAULT 'User',
	"emailVerified" timestamp,
	"image" text,
	"password" text,
	"role" text DEFAULT 'student',
	"role_id" text,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "class_sessions" ADD CONSTRAINT "class_sessions_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "groups" ADD CONSTRAINT "groups_parent_id_groups_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."groups"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "recurring_class_setups" ADD CONSTRAINT "recurring_class_setups_teacher_id_teachers_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."teachers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_class_setups" ADD CONSTRAINT "recurring_class_setups_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_class_setups" ADD CONSTRAINT "recurring_class_setups_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;