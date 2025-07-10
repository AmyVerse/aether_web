import { TimetableEntry } from "@/types/timetable";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const TIME_SLOTS = [
  { slot: "8:00-8:55", order: 1 },
  { slot: "9:00-9:55", order: 2 },
  { slot: "10:00-10:55", order: 3 },
  { slot: "11:00-11:55", order: 4 },
  { slot: "12:00-12:55", order: 5 },
  { slot: "13:00-13:55", order: 6 },
  { slot: "14:00-14:55", order: 7 },
  { slot: "15:00-15:55", order: 8 },
  { slot: "16:00-16:55", order: 9 },
  { slot: "17:00-17:55", order: 10 },
];

export interface RoomData {
  id: string;
  room_number: string;
  room_type: string;
}

// Generate CSV content for single room (Grid Format)
export const generateSingleRoomCSV = (
  data: TimetableEntry[] = [],
  roomName: string,
): string => {
  // Add room header
  let csvContent = `"${roomName}"\n`;
  csvContent += `\n`; // Empty line

  // Create grid headers - Days vs Time Slots
  const timeSlotHeaders = TIME_SLOTS.map(({ slot }) => `"${slot}"`);
  csvContent += `"Days"` + "," + timeSlotHeaders.join(",") + "\n";

  // Create a map for easier lookup
  const dataMap = new Map();
  data.forEach((entry) => {
    const key = "`${entry.day}-${entry.time_slot}`";
    dataMap.set(key, entry);
  });

  // Create rows for each day
  DAYS.forEach((day) => {
    const dayRow = [`"${day}"`];

    TIME_SLOTS.forEach(({ slot }) => {
      const key = `${day}-${slot}`;
      const cellData = dataMap.get(key);

      if (cellData) {
        // Format: Course Code + Branch-Section
        const cellContent = `${cellData.course_code || ""}${
          cellData.branch && cellData.section
            ? ` (${cellData.branch}-${cellData.section})`
            : ""
        }`;
        dayRow.push(`"${cellContent}"`);
      } else {
        dayRow.push('""'); // Empty cell
      }
    });

    csvContent += dayRow.join(",") + "\n";
  });

  return csvContent;
};

// Generate CSV content for all rooms (Grid Format)
export const generateAllRoomsCSV = (
  timetableData: TimetableEntry[],
  roomsList: RoomData[],
  academicYear: string,
  semesterType: string,
): string => {
  // Add summary information at the top
  let csvContent = `"Complete Timetable Export - ${academicYear} ${semesterType} Semester"\n`;
  csvContent += `"Export Date: ${new Date().toLocaleDateString()}"\n`;
  csvContent += `\n\n`; // Empty lines

  // Group timetable data by room
  const roomDataMap = new Map();
  timetableData.forEach((entry: TimetableEntry) => {
    if (!roomDataMap.has(entry.room_id)) {
      roomDataMap.set(entry.room_id, {
        room_number: entry.room_number,
        room_type: entry.room_type,
        entries: [],
      });
    }
    roomDataMap.get(entry.room_id).entries.push(entry);
  });

  // Generate grid format for each room
  roomsList.forEach((room, index) => {
    // Room header
    csvContent += `"${room.room_number}"\n`;
    csvContent += `\n`; // Empty line

    // Create grid headers - Days vs Time Slots
    const timeSlotHeaders = TIME_SLOTS.map(({ slot }) => `"${slot}"`);
    csvContent += `"Days"` + "," + timeSlotHeaders.join(",") + "\n";

    const roomData = roomDataMap.get(room.id);
    const roomEntries = roomData ? roomData.entries : [];

    // Create a map for easier lookup for this room
    const roomEntriesMap = new Map();
    roomEntries.forEach((entry: TimetableEntry) => {
      const key = "`${entry.day}-${entry.time_slot}`";
      roomEntriesMap.set(key, entry);
    });

    // Create rows for each day
    DAYS.forEach((day) => {
      const dayRow = [`"${day}"`];

      TIME_SLOTS.forEach(({ slot }) => {
        const key = `${day}-${slot}`;
        const cellData = roomEntriesMap.get(key);

        if (cellData) {
          // Format: Course Code + Branch-Section
          const cellContent = `${cellData.course_code || ""}${
            cellData.branch && cellData.section
              ? ` (${cellData.branch}-${cellData.section})`
              : ""
          }`;
          dayRow.push(`"${cellContent}"`);
        } else {
          dayRow.push('""'); // Empty cell
        }
      });

      csvContent += dayRow.join(",") + "\n";
    });

    // Add spacing between rooms (except for the last room)
    if (index < roomsList.length - 1) {
      csvContent += `\n\n`; // Empty lines between rooms
    }
  });

  return csvContent;
};

// Download CSV file
export const downloadCSV = (content: string, fileName: string): void => {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", fileName);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
