CREATE TYPE "public"."day_half_enum" AS ENUM('first_half', 'second_half');--> statement-breakpoint
CREATE TABLE "classroom_allocations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"academic_year" varchar(20) NOT NULL,
	"semester_type" "semester_type_enum" NOT NULL,
	"semester" integer NOT NULL,
	"branch" "branch_enum" NOT NULL,
	"section" "section_enum" NOT NULL,
	"room_id" uuid NOT NULL,
	"day_half" "day_half_enum",
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "timetable_entry_timings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"timetable_entry_id" uuid NOT NULL,
	"day" "day_enum" NOT NULL,
	"time_slot" time_slot_enum NOT NULL,
	"created_by" uuid,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "timetable_entries_timings" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "timetable_entries_timings" CASCADE;--> statement-breakpoint
ALTER TABLE "timetable_entries" DROP CONSTRAINT "timetable_entries_room_id_rooms_id_fk";
--> statement-breakpoint
ALTER TABLE "timetable_entries" DROP CONSTRAINT "timetable_entries_subject_id_subjects_id_fk";
--> statement-breakpoint
DROP INDEX "unique_timetable_entry";--> statement-breakpoint
ALTER TABLE "timetable_entries" ALTER COLUMN "notes" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "timetable_entries" ADD COLUMN "allocation_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "classroom_allocations" ADD CONSTRAINT "classroom_allocations_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classroom_allocations" ADD CONSTRAINT "classroom_allocations_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_entry_timings" ADD CONSTRAINT "timetable_entry_timings_timetable_entry_id_timetable_entries_id_fk" FOREIGN KEY ("timetable_entry_id") REFERENCES "public"."timetable_entries"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_entry_timings" ADD CONSTRAINT "timetable_entry_timings_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_class_allocation" ON "classroom_allocations" USING btree ("academic_year","semester_type","semester","branch","section","day_half");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_entry_timing" ON "timetable_entry_timings" USING btree ("timetable_entry_id","day","time_slot");--> statement-breakpoint
ALTER TABLE "timetable_entries" ADD CONSTRAINT "timetable_entries_allocation_id_classroom_allocations_id_fk" FOREIGN KEY ("allocation_id") REFERENCES "public"."classroom_allocations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "timetable_entries" ADD CONSTRAINT "timetable_entries_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_allocation_subject" ON "timetable_entries" USING btree ("allocation_id","subject_id");--> statement-breakpoint
ALTER TABLE "timetable_entries" DROP COLUMN "academic_year";--> statement-breakpoint
ALTER TABLE "timetable_entries" DROP COLUMN "semester_type";--> statement-breakpoint
ALTER TABLE "timetable_entries" DROP COLUMN "semester";--> statement-breakpoint
ALTER TABLE "timetable_entries" DROP COLUMN "room_id";--> statement-breakpoint
ALTER TABLE "timetable_entries" DROP COLUMN "branch";--> statement-breakpoint
ALTER TABLE "timetable_entries" DROP COLUMN "section";