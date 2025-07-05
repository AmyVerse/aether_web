ALTER TABLE "timetable_entries" ALTER COLUMN "branch" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."branch_enum";--> statement-breakpoint
CREATE TYPE "public"."branch_enum" AS ENUM('CSE', 'CSE-AIML', 'CSE-DS', 'CSE-HCIGT', 'ECE', 'ECE-IoT');--> statement-breakpoint
ALTER TABLE "timetable_entries" ALTER COLUMN "branch" SET DATA TYPE "public"."branch_enum" USING "branch"::"public"."branch_enum";