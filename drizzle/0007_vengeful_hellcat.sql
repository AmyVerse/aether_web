CREATE TYPE "public"."branch_enum" AS ENUM('CSE', 'CSE-AIML', 'CSE-DS', 'CSE-HCIOT', 'ECE', 'ECE-IoT');--> statement-breakpoint
CREATE TYPE "public"."day_enum" AS ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday');--> statement-breakpoint
CREATE TYPE "public"."room_type_enum" AS ENUM('Classroom', 'Lab');--> statement-breakpoint
CREATE TYPE "public"."section_enum" AS ENUM('A', 'B', 'C');--> statement-breakpoint
CREATE TYPE "public"."semester_type_enum" AS ENUM('odd', 'even');--> statement-breakpoint
CREATE TYPE "public"."time_slot_enum" AS ENUM('8:00-8:55', '9:00-9:55', '10:00-10:55', '11:00-11:55', '12:00-12:55', '13:00-13:55', '14:00-14:55', '15:00-15:55', '16:00-16:55', '17:00-17:55');--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_number" varchar(20) NOT NULL,
	"room_type" "room_type_enum" NOT NULL,
	"capacity" integer,
	"floor" integer,
	"building" varchar(100),
	"facilities" text[],
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "rooms_room_number_unique" UNIQUE("room_number")
);
--> statement-breakpoint
CREATE TABLE "timetable_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"academic_year" varchar(20) NOT NULL,
	"semester_type" "semester_type_enum" NOT NULL,
	"room_id" uuid NOT NULL,
	"subject_id" uuid,
	"branch" "branch_enum",
	"section" "section_enum",
	"day" "day_enum" NOT NULL,
	"time_slot" time_slot_enum NOT NULL,
	"notes" text,
	"color_code" varchar(10),
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "subjects" ADD COLUMN "short_name" varchar(10);--> statement-breakpoint
ALTER TABLE "subjects" ADD COLUMN "theory_hours" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "subjects" ADD COLUMN "lab_hours" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "subjects" ADD COLUMN "tutorial_hours" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "subjects" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "subjects" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "timetable_entries" ADD CONSTRAINT "timetable_entries_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_entries" ADD CONSTRAINT "timetable_entries_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_entries" ADD CONSTRAINT "timetable_entries_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subjects" DROP COLUMN "year";