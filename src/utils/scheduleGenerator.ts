import { classSessions } from "@/db/schema";
import { db } from "@/index";
import { nanoid } from "nanoid"; // Use nanoid for unique IDs

export function getRecurringDates(
  start: string,
  end: string,
  daysOfWeek: number[]
): string[] {
  const result: string[] = [];
  const current = new Date(start);
  const endDate = new Date(end);

  while (current <= endDate) {
    const day = current.getDay();
    if (
      daysOfWeek.includes(day) &&
      day !== 0 && // skip Sunday
      day !== 6 // skip Saturday
    ) {
      result.push(current.toISOString().slice(0, 10));
    }
    current.setDate(current.getDate() + 1);
  }
  return result;
}

export async function createClassSessionsFromRecurring({
  recurringId,
  group_id,
  subject_id,
  teacher_id,
  days_of_week,
  start_time,
  end_time,
  session_type,
  semester_start_date,
  semester_end_date,
}: {
  recurringId: string;
  group_id: string;
  subject_id: string;
  teacher_id: string;
  days_of_week: number[];
  start_time: string;
  end_time: string | null;
  session_type: "Lecture" | "Lab" | "Tutorial" | "Extras";
  semester_start_date: string;
  semester_end_date: string;
}) {
  const dates = getRecurringDates(
    semester_start_date,
    semester_end_date,
    days_of_week
  );

  if (!dates.length) return;

  await db.insert(classSessions).values(
    dates.map((date) => ({
      id: nanoid(9), // Generate a 9-character nanoid
      recurring_id: recurringId,
      group_id,
      subject_id,
      teacher_id,
      type: session_type,
      date,
      start_time: start_time.length === 5 ? start_time + ":00" : start_time,
      end_time: end_time
        ? end_time.length === 5
          ? end_time + ":00"
          : end_time
        : null,
      status: "Scheduled" as const, // Default status
      reason: null,
    }))
  );
}
