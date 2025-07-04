ALTER TABLE "attendance_record" DROP CONSTRAINT "attendance_record_student_id_unique";--> statement-breakpoint
ALTER TABLE "attendance_record" DROP CONSTRAINT "attendance_record_session_id_unique";--> statement-breakpoint
ALTER TABLE "attendance_record" ALTER COLUMN "student_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "attendance_record" ALTER COLUMN "session_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "attendance_record" ADD CONSTRAINT "attendance_record_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_record" ADD CONSTRAINT "attendance_record_session_id_class_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."class_sessions"("id") ON DELETE cascade ON UPDATE no action;