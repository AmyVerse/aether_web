export interface TimetableEntry {
  id: string;
  room_id: string;
  room_number: string;
  room_type: string;
  subject_id?: string;
  course_code?: string;
  course_name?: string;
  day: string;
  time_slot: string;
  branch?: string;
  section?: string;
  color_code?: string;
  notes?: string;
  academic_year: string;
  semester_type: string;
}

export interface RoomData {
  id: string;
  room_number: string;
  room_type: string;
}

export interface SubjectData {
  id: string;
  course_code: string;
  course_name: string;
  short_name?: string;
  subject_type?: string;
  semester?: number;
  credits?: number;
  is_active?: boolean;
}

export interface ParsedTimetableEntry {
  room_number: string;
  day: string;
  time_slot: string;
  course_code?: string;
  branch?: string;
  section?: string;
  notes?: string;
}
