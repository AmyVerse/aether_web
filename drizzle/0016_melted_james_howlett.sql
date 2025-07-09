ALTER TABLE "attendance_record" RENAME TO "attendance_records";--> statement-breakpoint
ALTER TABLE "attendance_records" DROP CONSTRAINT "attendance_record_student_id_students_id_fk";
--> statement-breakpoint
ALTER TABLE "attendance_records" DROP CONSTRAINT "attendance_record_session_id_class_sessions_id_fk";
--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_session_id_class_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."class_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendance_records" ADD CONSTRAINT "unique_student_session" UNIQUE("student_id","session_id");