import {
  ParsedTimetableEntry,
  RoomData,
  SubjectData,
  TimetableEntry,
} from "@/types/timetable";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const TIME_SLOTS = [
  "8:00-8:55",
  "9:00-9:55",
  "10:00-10:55",
  "11:00-11:55",
  "12:00-12:55",
  "13:00-13:55",
  "14:00-14:55",
  "15:00-15:55",
  "16:00-16:55",
  "17:00-17:55",
];

export interface ImportResult {
  success: boolean;
  message: string;
  entries?: ParsedTimetableEntry[];
  errors?: string[];
}

// Parse CSV content in grid format
export const parseGridCSV = (csvContent: string): ImportResult => {
  try {
    const lines = csvContent
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line);
    const errors: string[] = [];
    const entries: ParsedTimetableEntry[] = [];

    let currentRoom = "";
    let headerFound = false;
    let timeSlotHeaders: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip empty lines and summary lines
      if (
        !line ||
        line.startsWith('"Complete Timetable') ||
        line.startsWith('"Export Date')
      ) {
        continue;
      }

      // Parse CSV line (handle quoted values)
      const cells = parseCSVLine(line);

      // Check if this is a room header (single cell with room name)
      if (cells.length === 1 && cells[0] && !DAYS.includes(cells[0])) {
        currentRoom = cells[0];
        headerFound = false;
        continue;
      }

      // Check if this is the header row with time slots
      if (cells.length > 1 && cells[0] === "Days") {
        timeSlotHeaders = cells.slice(1); // Remove 'Days' column
        headerFound = true;
        continue;
      }

      // Process data rows (days)
      if (headerFound && cells.length > 1 && DAYS.includes(cells[0])) {
        const day = cells[0];

        for (
          let j = 1;
          j < cells.length && j - 1 < timeSlotHeaders.length;
          j++
        ) {
          const cellContent = cells[j];
          const timeSlot = timeSlotHeaders[j - 1];

          if (cellContent && cellContent.trim()) {
            const parsed = parseCellContent(cellContent);

            if (parsed.course_code) {
              entries.push({
                room_number: currentRoom,
                day: day,
                time_slot: timeSlot,
                course_code: parsed.course_code,
                branch: parsed.branch,
                section: parsed.section,
                notes: parsed.notes,
              });
            }
          }
        }
      }
    }

    return {
      success: true,
      message: `Successfully parsed ${entries.length} timetable entries`,
      entries,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to parse CSV: ${error instanceof Error ? error.message : "Unknown error"}`,
      errors: [error instanceof Error ? error.message : "Unknown error"],
    };
  }
};

// Parse a single CSV line handling quoted values
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
};

// Parse cell content to extract course code, branch, and section
const parseCellContent = (
  content: string,
): {
  course_code?: string;
  branch?: string;
  section?: string;
  notes?: string;
} => {
  const trimmed = content.trim();

  if (!trimmed) {
    return {};
  }

  // Handle common variations:
  // "COURSE_CODE (BRANCH-SECTION)" - Standard format
  // "COURSE_CODE (BRANCH SECTION)" - Space instead of dash
  // "COURSE_CODE-BRANCH-SECTION" - All dashes
  // "COURSE_CODE BRANCH SECTION" - All spaces
  // "COURSE_CODE" - Just course code

  // Pattern 1: "COURSE (BRANCH-SECTION)" or "COURSE (BRANCH SECTION)"
  let match = trimmed.match(
    /^([A-Z0-9]+)\s*\(([A-Z0-9]+)[\s\-]([A-Z0-9])\)(.*)$/i,
  );
  if (match) {
    return {
      course_code: match[1].toUpperCase(),
      branch: match[2].toUpperCase(),
      section: match[3].toUpperCase(),
      notes: match[4] ? match[4].trim() : undefined,
    };
  }

  // Pattern 2: "COURSE-BRANCH-SECTION" (all dashes)
  match = trimmed.match(/^([A-Z0-9]+)-([A-Z0-9]+)-([A-Z0-9])(.*)$/i);
  if (match) {
    return {
      course_code: match[1].toUpperCase(),
      branch: match[2].toUpperCase(),
      section: match[3].toUpperCase(),
      notes: match[4] ? match[4].trim() : undefined,
    };
  }

  // Pattern 3: "COURSE BRANCH SECTION" (all spaces, exactly 3 parts)
  const spaceParts = trimmed.split(/\s+/);
  if (
    spaceParts.length === 3 &&
    spaceParts[0].match(/^[A-Z0-9]+$/i) &&
    spaceParts[1].match(/^[A-Z0-9]+$/i) &&
    spaceParts[2].match(/^[A-Z0-9]$/i)
  ) {
    return {
      course_code: spaceParts[0].toUpperCase(),
      branch: spaceParts[1].toUpperCase(),
      section: spaceParts[2].toUpperCase(),
    };
  }

  // Pattern 4: "COURSE (BRANCH)" - Only branch, no section
  match = trimmed.match(/^([A-Z0-9]+)\s*\(([A-Z0-9]+)\)(.*)$/i);
  if (match) {
    return {
      course_code: match[1].toUpperCase(),
      branch: match[2].toUpperCase(),
      notes: match[3] ? match[3].trim() : undefined,
    };
  }

  // Pattern 5: Just course code (no branch/section)
  match = trimmed.match(/^([A-Z0-9]+)(.*)$/i);
  if (match) {
    return {
      course_code: match[1].toUpperCase(),
      notes: match[2] ? match[2].trim() : undefined,
    };
  }

  // If no pattern matches, treat entire content as course code
  return {
    course_code: trimmed.toUpperCase(),
    notes: undefined,
  };
};

// Map room numbers to UUIDs
export const mapRoomsToIds = async (
  entries: ParsedTimetableEntry[],
  rooms: RoomData[],
): Promise<{
  entries: (ParsedTimetableEntry & { room_id?: string })[];
  unmappedRooms: string[];
}> => {
  const roomMap = new Map(
    rooms.map((room) => [room.room_number.toLowerCase(), room.id]),
  );
  const unmappedRooms: string[] = [];

  const mappedEntries = entries.map((entry) => {
    const roomId = roomMap.get(entry.room_number.toLowerCase());

    if (!roomId && !unmappedRooms.includes(entry.room_number)) {
      unmappedRooms.push(entry.room_number);
    }

    return {
      ...entry,
      room_id: roomId,
    } as ParsedTimetableEntry & { room_id?: string };
  });

  return { entries: mappedEntries, unmappedRooms };
};

// Map course codes to subject UUIDs (with flexible matching)
export const mapSubjectsToIds = async (
  entries: (ParsedTimetableEntry & { room_id?: string })[],
  subjects: SubjectData[],
): Promise<{
  entries: (ParsedTimetableEntry & { room_id?: string; subject_id?: string })[];
  unmappedSubjects: string[];
}> => {
  // Create multiple mapping strategies for better matching
  const subjectMaps = {
    // Direct course code mapping
    course_code: new Map(
      subjects.map((subject) => [subject.course_code.toLowerCase(), subject]),
    ),
    // Short name mapping (if available)
    short_name: new Map(
      subjects
        .filter((subject) => subject.short_name)
        .map((subject) => [subject.short_name!.toLowerCase(), subject]),
    ),
    // Course name partial matching
    course_name: new Map(
      subjects.map((subject) => [subject.course_name.toLowerCase(), subject]),
    ),
  };

  const unmappedSubjects: string[] = [];

  const mappedEntries = entries.map((entry) => {
    if (!entry.course_code) return { ...entry, subject_id: undefined };

    const searchTerm = entry.course_code.toLowerCase();
    let matchedSubject: SubjectData | undefined;

    // Try direct course code match first
    matchedSubject = subjectMaps.course_code.get(searchTerm);

    // Try short name match
    if (!matchedSubject) {
      matchedSubject = subjectMaps.short_name.get(searchTerm);
    }

    // Try partial course name match
    if (!matchedSubject) {
      for (const [courseName, subject] of subjectMaps.course_name) {
        if (
          courseName.includes(searchTerm) ||
          searchTerm.includes(courseName)
        ) {
          matchedSubject = subject;
          break;
        }
      }
    }

    // Try acronym matching (e.g., "DS" matches "Data Structures")
    if (!matchedSubject) {
      const acronym = searchTerm.toUpperCase();
      if (acronym.length <= 4) {
        // Only for short terms that could be acronyms
        for (const subject of subjects) {
          const words = subject.course_name.split(/\s+/);
          const subjectAcronym = words
            .map((word) => word.charAt(0))
            .join("")
            .toUpperCase();
          if (subjectAcronym === acronym) {
            matchedSubject = subject;
            break;
          }
        }
      }
    }

    if (!matchedSubject && !unmappedSubjects.includes(entry.course_code)) {
      unmappedSubjects.push(entry.course_code);
    }

    return {
      ...entry,
      subject_id: matchedSubject?.id,
    };
  });

  return { entries: mappedEntries, unmappedSubjects };
};

// Validate parsed entries
export const validateEntries = (
  entries: (ParsedTimetableEntry & { room_id?: string; subject_id?: string })[],
): { valid: typeof entries; invalid: typeof entries } => {
  const valid = entries.filter(
    (entry) =>
      entry.room_id &&
      entry.subject_id &&
      DAYS.includes(entry.day) &&
      TIME_SLOTS.includes(entry.time_slot),
  );

  const invalid = entries.filter(
    (entry) =>
      !entry.room_id ||
      !entry.subject_id ||
      !DAYS.includes(entry.day) ||
      !TIME_SLOTS.includes(entry.time_slot),
  );

  return { valid, invalid };
};

// Create timetable entries from parsed data
export const createTimetableEntries = (
  validEntries: (ParsedTimetableEntry & {
    room_id?: string;
    subject_id?: string;
  })[],
  academicYear: string,
  semesterType: "odd" | "even",
): Omit<
  TimetableEntry,
  "id" | "room_number" | "room_type" | "course_code" | "course_name"
>[] => {
  return validEntries.map((entry) => ({
    room_id: entry.room_id!,
    subject_id: entry.subject_id!,
    day: entry.day,
    time_slot: entry.time_slot,
    branch: entry.branch || undefined,
    section: entry.section || undefined,
    color_code: getRandomColor(),
    notes: entry.notes || undefined,
    academic_year: academicYear,
    semester_type: semesterType,
  }));
};

// Generate random color for timetable entries
const getRandomColor = (): string => {
  const colors = [
    "#3B82F6",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EF4444",
    "#059669",
    "#DC2626",
    "#7C3AED",
    "#1D4ED8",
    "#9333EA",
    "#0F766E",
    "#EA580C",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};
