"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/useToast";
import { RoomData, SubjectData, TimetableEntry } from "@/types/timetable";
import {
  downloadCSV,
  generateAllRoomsCSV,
  generateSingleRoomCSV,
} from "@/utils/timetableExport";
import {
  createTimetableEntries,
  mapRoomsToIds,
  mapSubjectsToIds,
  parseGridCSV,
  validateEntries,
} from "@/utils/timetableImport";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  FaChevronDown,
  FaChevronRight,
  FaDownload,
  FaFileExcel,
  FaPlus,
  FaUpload,
} from "react-icons/fa";

interface TimetableGridProps {
  academicYear: string;
  semesterType: "odd" | "even";
  onCellClick?: (day: string, timeSlot: string, roomId?: string) => void;
}

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

export default function TimetableGrid({
  academicYear,
  semesterType,
  onCellClick,
}: TimetableGridProps) {
  const [timetableData, setTimetableData] = useState<TimetableEntry[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [roomsList, setRoomsList] = useState<RoomData[]>([]);
  const [subjectsList, setSubjectsList] = useState<SubjectData[]>([]);
  const [loading, setLoading] = useState(false);
  const [, setEditingCell] = useState<{
    day: string;
    timeSlot: string;
  } | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<{
    [key: string]: boolean;
  }>({});
  const [showExportMenu, setShowExportMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const { showSuccess, showError } = useToast();

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(event.target as Node)
      ) {
        setShowExportMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle section collapse
  const toggleSection = (sectionType: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionType]: !prev[sectionType],
    }));
  };

  // Group rooms by type
  const groupedRooms = roomsList.reduce(
    (acc, room) => {
      if (!acc[room.room_type]) {
        acc[room.room_type] = [];
      }
      acc[room.room_type].push(room);
      return acc;
    },
    {} as { [key: string]: typeof roomsList },
  );

  // Fetch rooms list
  const fetchRooms = useCallback(async () => {
    try {
      const response = await fetch("/api/editor?action=rooms");
      const data = await response.json();

      if (response.ok) {
        setRoomsList(data.rooms || []);
        if (data.rooms.length > 0 && !selectedRoom) {
          setSelectedRoom(data.rooms[0].id);
        }
      } else {
        showError(data.error || "Failed to fetch rooms");
      }
    } catch {
      showError("Error fetching rooms");
    }
  }, [selectedRoom, showError]);

  // Fetch subjects list
  const fetchSubjects = useCallback(async () => {
    try {
      const response = await fetch("/api/editor?action=subjects");
      const data = await response.json();

      if (response.ok) {
        setSubjectsList(data.subjects || []);
      } else {
        showError(data.error || "Failed to fetch subjects");
      }
    } catch {
      showError("Error fetching subjects");
    }
  }, [showError]);

  useEffect(() => {
    fetchRooms();
    fetchSubjects();
  }, [fetchRooms, fetchSubjects]);

  // Fetch timetable data
  const fetchTimetableData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/editor?action=timetable&academic_year=${academicYear}&semester_type=${semesterType}&room_id=${selectedRoom}`,
      );
      const data = await response.json();

      if (response.ok) {
        setTimetableData(data.timetable || []);
      } else {
        showError(data.error || "Failed to fetch timetable");
      }
    } catch {
      showError("Error fetching timetable data");
    } finally {
      setLoading(false);
    }
  }, [academicYear, semesterType, selectedRoom, showError]);

  useEffect(() => {
    if (selectedRoom) {
      fetchTimetableData();
    }
  }, [academicYear, semesterType, selectedRoom, fetchTimetableData]);

  // Get cell data for specific day and time slot
  const getCellData = (
    day: string,
    timeSlot: string,
  ): TimetableEntry | null => {
    return (
      timetableData.find(
        (entry) =>
          entry.day === day &&
          entry.time_slot === timeSlot &&
          entry.room_id === selectedRoom,
      ) || null
    );
  };

  // Handle file upload (CSV/Excel grid format)
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (
      !file.name.endsWith(".csv") &&
      !file.name.endsWith(".xlsx") &&
      !file.name.endsWith(".xls")
    ) {
      showError("Please upload a CSV or Excel file (.csv, .xlsx, .xls)");
      return;
    }

    try {
      setLoading(true);

      // Read file content
      const content = await readFileContent(file);

      // Parse the grid format CSV
      const parseResult = parseGridCSV(content);

      if (!parseResult.success) {
        showError(parseResult.message);
        return;
      }

      if (!parseResult.entries || parseResult.entries.length === 0) {
        showError("No timetable entries found in the file");
        return;
      }

      // Map room numbers to IDs
      const { entries: roomMappedEntries, unmappedRooms } = await mapRoomsToIds(
        parseResult.entries,
        roomsList,
      );

      // Map course codes to subject IDs
      const { entries: subjectMappedEntries, unmappedSubjects } =
        await mapSubjectsToIds(roomMappedEntries, subjectsList);

      // Validate entries
      const { valid: validEntries, invalid: invalidEntries } =
        validateEntries(subjectMappedEntries);

      // Show detailed feedback
      const feedbackMessages: string[] = [];

      if (unmappedRooms.length > 0) {
        feedbackMessages.push(
          `⚠️ Unmapped rooms (${unmappedRooms.length}): ${unmappedRooms.join(", ")}`,
        );
      }

      if (unmappedSubjects.length > 0) {
        feedbackMessages.push(
          `⚠️ Unmapped subjects (${unmappedSubjects.length}): ${unmappedSubjects.join(", ")}`,
        );
      }

      if (invalidEntries.length > 0) {
        feedbackMessages.push(
          `⚠️ Invalid entries found: ${invalidEntries.length}`,
        );
      }

      // Show warnings if any
      if (feedbackMessages.length > 0) {
        feedbackMessages.forEach((msg) => showError(msg));
      }

      if (validEntries.length === 0) {
        showError("No valid entries to import");
        return;
      }

      // Create timetable entries
      const timetableEntries = createTimetableEntries(
        validEntries,
        academicYear,
        semesterType,
      );

      // Import to database
      const response = await fetch("/api/editor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bulk-import-timetable",
          data: {
            academic_year: academicYear,
            semester_type: semesterType,
            entries: timetableEntries,
          },
        }),
      });

      if (response.ok) {
        showSuccess(
          `✅ Successfully imported ${validEntries.length} timetable entries! ${unmappedRooms.length + unmappedSubjects.length > 0 ? `(${unmappedRooms.length + unmappedSubjects.length} items couldn't be mapped)` : ""}`,
        );
        fetchTimetableData(); // Refresh the grid
      } else {
        const errorData = await response.json();
        showError(errorData.error || "Failed to import timetable");
      }
    } catch (error) {
      showError(
        `Import failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setLoading(false);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Read file content as text
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  // Handle Excel export
  const handleExportToExcel = async () => {
    try {
      setLoading(true);

      // Fetch timetable data for current room
      const response = await fetch(
        `/api/editor?action=export-timetable&academic_year=${academicYear}&semester_type=${semesterType}&room_id=${selectedRoom}`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        showError(errorData.error || "Failed to export timetable");
        return;
      }

      const { timetable } = await response.json();

      const roomName =
        roomsList.find((r) => r.id === selectedRoom)?.room_number ||
        "timetable";

      // Use utility function to generate CSV
      const csvContent = generateSingleRoomCSV(timetable, roomName);

      // Download the file
      const fileName = `${roomName}_${academicYear}_${semesterType}_timetable.csv`;
      downloadCSV(csvContent, fileName);

      showSuccess(`Timetable exported successfully as ${fileName}`);
    } catch {
      showError("Error exporting timetable data");
    } finally {
      setLoading(false);
    }
  };

  // Handle export all rooms (Grid Format)
  const handleExportAllRooms = async () => {
    try {
      setLoading(true);

      // Fetch timetable data for all rooms (without room_id filter)
      const response = await fetch(
        `/api/editor?action=export-timetable&academic_year=${academicYear}&semester_type=${semesterType}`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        showError(errorData.error || "Failed to export complete timetable");
        return;
      }

      const { timetable } = await response.json();

      // Use utility function to generate CSV
      const csvContent = generateAllRoomsCSV(
        timetable,
        roomsList,
        academicYear,
        semesterType,
      );

      // Download the file
      const fileName = `all_rooms_${academicYear}_${semesterType}_timetable.csv`;
      downloadCSV(csvContent, fileName);

      showSuccess(`Complete timetable exported successfully as ${fileName}`);
    } catch {
      showError("Error exporting complete timetable data");
    } finally {
      setLoading(false);
    }
  };

  // Handle cell edit
  const handleCellEdit = (day: string, timeSlot: string) => {
    if (onCellClick) {
      onCellClick(day, timeSlot, selectedRoom);
    } else {
      setEditingCell({ day, timeSlot });
    }
  };

  // Handle cell update

  // Render cell content
  const renderCell = (day: string, timeSlot: string) => {
    const cellData = getCellData(day, timeSlot);

    if (!cellData) {
      return (
        <div
          className="h-16 border border-gray-200 bg-white hover:bg-gray-50 cursor-pointer flex items-center justify-center"
          onClick={() => handleCellEdit(day, timeSlot)}
        >
          <FaPlus className="text-gray-400 text-sm" />
        </div>
      );
    }

    const bgColor = cellData.color_code || "bg-blue-50";
    const textColor =
      cellData.room_type === "Lab" ? "text-yellow-800" : "text-blue-800";

    return (
      <div
        className={`h-16 border border-gray-200 p-1 cursor-pointer hover:opacity-80 ${bgColor} ${textColor}`}
        onClick={() => handleCellEdit(day, timeSlot)}
        style={{ backgroundColor: cellData.color_code }}
      >
        <div className="text-xs font-semibold truncate">
          {cellData.course_code}
        </div>
        {cellData.branch && cellData.section && (
          <div className="text-xs truncate">
            {cellData.branch}-{cellData.section}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Class Occupancy - {academicYear} ({semesterType} semester)
          </h2>
          <p className="text-gray-600">
            Room:{" "}
            {roomsList.find((r) => r.id === selectedRoom)?.room_number ||
              "Select a room"}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv,.xlsx,.xls"
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-green-600 text-white hover:bg-green-700"
            width="6"
          >
            <FaUpload className="mr-2" />
            Import CSV/Excel
          </Button>

          {/* Export Dropdown */}
          <div className="relative" ref={exportMenuRef}>
            <Button
              variant="outline"
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-2"
            >
              <FaDownload className="mr-1" />
              Export
              <FaChevronDown className="ml-1 text-xs" />
            </Button>

            {showExportMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-60">
                <div className="py-1">
                  <button
                    onClick={() => {
                      handleExportToExcel();
                      setShowExportMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FaFileExcel className="mr-3 text-green-600" />
                    <div className="text-left">
                      <div className="font-medium">Export Current Room</div>
                      <div className="text-xs text-gray-500">
                        {roomsList.find((r) => r.id === selectedRoom)
                          ?.room_number || "Selected room"}{" "}
                        timetable as CSV
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      handleExportAllRooms();
                      setShowExportMenu(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <FaFileExcel className="mr-3 text-blue-600" />
                    <div className="text-left">
                      <div className="font-medium">Export All Rooms</div>
                      <div className="text-xs text-gray-500">
                        Complete timetable for all {roomsList.length} rooms
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Room Selector */}
      <div className="space-y-4">
        {Object.entries(groupedRooms).map(([roomType, rooms]) => (
          <div key={roomType} className="border border-gray-200 rounded-lg">
            {/* Section Header */}
            <div
              className="flex items-center justify-between p-3 bg-gray-50 cursor-pointer hover:bg-gray-100 rounded-t-lg"
              onClick={() => toggleSection(roomType)}
            >
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">
                  {roomType}s ({rooms.length})
                </h3>
                <Badge variant="secondary" className="text-xs">
                  {rooms.filter((r) => r.id === selectedRoom).length > 0
                    ? "1 selected"
                    : "0 selected"}
                </Badge>
              </div>
              {collapsedSections[roomType] ? (
                <FaChevronRight />
              ) : (
                <FaChevronDown />
              )}
            </div>

            {/* Section Content */}
            {!collapsedSections[roomType] && (
              <div className="p-3 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {rooms.map((room) => (
                    <Button
                      key={room.id}
                      variant={selectedRoom === room.id ? "default" : "outline"}
                      onClick={() => setSelectedRoom(room.id)}
                      width="7"
                    >
                      {room.room_number}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Timetable Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Timetable Grid -{" "}
            {roomsList.find((r) => r.id === selectedRoom)?.room_number ||
              "Select a room"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header Row */}
              <div className="grid grid-cols-11 border-b border-gray-300">
                <div className="p-3 bg-gray-100 font-semibold text-center border-r border-gray-300">
                  Day / Time
                </div>
                {TIME_SLOTS.map(({ slot }) => (
                  <div
                    key={slot}
                    className="p-3 bg-gray-100 font-semibold text-center border-r border-gray-300"
                  >
                    {slot}
                  </div>
                ))}
              </div>

              {/* Day Rows */}
              {DAYS.map((day) => (
                <div
                  key={day}
                  className="grid grid-cols-11 border-b border-gray-200"
                >
                  <div className="p-3 bg-gray-50 font-medium text-center border-r border-gray-300 flex items-center justify-center">
                    {day}
                  </div>
                  {TIME_SLOTS.map(({ slot }) => (
                    <div
                      key={`${day}-${slot}`}
                      className="border-r border-gray-200"
                    >
                      {renderCell(day, slot)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-50 border border-blue-200"></div>
          <span>Occupied Slot</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-white border border-gray-300 flex items-center justify-center">
            <FaPlus className="text-gray-400 text-xs" />
          </div>
          <span>Empty Slot (Click to add)</span>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <LoadingSpinner size="lg" color="text-blue-600" />
          <p className="mt-2 text-gray-600">Loading timetable...</p>
        </div>
      )}
    </div>
  );
}
