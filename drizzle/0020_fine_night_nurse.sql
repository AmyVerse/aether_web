CREATE TABLE "lab_timetable_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_id" uuid NOT NULL,
	"subject_id" uuid NOT NULL,
	"academic_year" varchar(10) NOT NULL,
	"semester_type" varchar(10) NOT NULL,
	"semester" integer NOT NULL,
	"branch" varchar(10) NOT NULL,
	"section" varchar(5) NOT NULL,
	"day" varchar(10) NOT NULL,
	"start_time" varchar(10) NOT NULL,
	"end_time" varchar(10) NOT NULL,
	"duration_hours" integer NOT NULL,
	"notes" text,
	"color_code" varchar(10),
	"created_by" uuid,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "lab_timetable_entries" ADD CONSTRAINT "lab_timetable_entries_room_id_rooms_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_timetable_entries" ADD CONSTRAINT "lab_timetable_entries_subject_id_subjects_id_fk" FOREIGN KEY ("subject_id") REFERENCES "public"."subjects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lab_timetable_entries" ADD CONSTRAINT "lab_timetable_entries_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_lab_room_day_time" ON "lab_timetable_entries" USING btree ("room_id","day","start_time");