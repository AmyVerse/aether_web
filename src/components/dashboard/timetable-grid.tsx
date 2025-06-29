"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/useToast";
import { useEffect, useRef, useState } from "react";
import {
  FaChevronDown,
  FaChevronRight,
  FaDownload,
  FaPlus,
  FaUpload,
} from "react-icons/fa";

interface TimetableEntry {
  id: string;
  room_id: string;
  room_number: string;
  room_type: string;
  subject_id?: string;
  subject_code?: string;
  subject_name?: string;
  day: string;
  time_slot: string;
  branch?: string;
  section?: string;
  color_code?: string;
  notes?: string;
  academic_year: string;
  semester_type: string;
}

interface TimetableGridProps {
  academicYear: string;
  semesterType: "odd" | "even";
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
}: TimetableGridProps) {
  const [timetableData, setTimetableData] = useState<TimetableEntry[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [roomsList, setRoomsList] = useState<
    { id: string; room_number: string; room_type: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [editingCell, setEditingCell] = useState<{
    day: string;
    timeSlot: string;
  } | null>(null);
  const [collapsedSections, setCollapsedSections] = useState<{
    [key: string]: boolean;
  }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showSuccess, showError } = useToast();

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
  const fetchRooms = async () => {
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
    } catch (error) {
      showError("Error fetching rooms");
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Fetch timetable data
  const fetchTimetableData = async () => {
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
    } catch (error) {
      showError("Error fetching timetable data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRoom) {
      fetchTimetableData();
    }
  }, [academicYear, semesterType, selectedRoom]);

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

  // Handle Excel file upload
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      showError("Please upload an Excel file (.xlsx or .xls)");
      return;
    }

    // For demo purposes, we'll simulate the Excel parsing
    // In a real implementation, you'd use a library like SheetJS to parse the Excel file
    showError(
      "Excel import functionality needs to be implemented with SheetJS library",
    );

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle cell edit
  const handleCellEdit = (day: string, timeSlot: string) => {
    setEditingCell({ day, timeSlot });
  };

  // Handle cell update
  const handleCellUpdate = async (
    day: string,
    timeSlot: string,
    data: Partial<TimetableEntry>,
  ) => {
    try {
      const existingEntry = getCellData(day, timeSlot);

      if (existingEntry) {
        // Update existing entry
        const response = await fetch("/api/editor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "update-timetable-entry",
            data: {
              id: existingEntry.id,
              ...data,
            },
          }),
        });

        if (response.ok) {
          showSuccess("Timetable entry updated successfully");
          fetchTimetableData();
        } else {
          const error = await response.json();
          showError(error.error || "Failed to update entry");
        }
      } else {
        // Create new entry - this would need to be implemented
        showError("Creating new entries not yet implemented");
      }
    } catch (error) {
      showError("Error updating timetable entry");
    }

    setEditingCell(null);
  };

  // Render cell content
  const renderCell = (day: string, timeSlot: string) => {
    const cellData = getCellData(day, timeSlot);
    const isEditing =
      editingCell?.day === day && editingCell?.timeSlot === timeSlot;

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
          {cellData.subject_code}
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
            accept=".xlsx,.xls"
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-green-600 hover:bg-green-700"
          >
            <FaUpload className="mr-2" />
            Import Excel
          </Button>
          <Button variant="outline">
            <FaDownload className="mr-2" />
            Export
          </Button>
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
                      size="sm"
                      onClick={() => setSelectedRoom(room.id)}
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
              <div className="grid grid-cols-7 border-b border-gray-300">
                <div className="p-3 bg-gray-100 font-semibold text-center border-r border-gray-300">
                  Time / Day
                </div>
                {DAYS.map((day) => (
                  <div
                    key={day}
                    className="p-3 bg-gray-100 font-semibold text-center border-r border-gray-300"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Time Slot Rows */}
              {TIME_SLOTS.map(({ slot, order }) => (
                <div
                  key={slot}
                  className="grid grid-cols-7 border-b border-gray-200"
                >
                  <div className="p-3 bg-gray-50 font-medium text-center border-r border-gray-300 flex items-center justify-center">
                    {slot}
                  </div>
                  {DAYS.map((day) => (
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
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading timetable...</p>
        </div>
      )}
    </div>
  );
}
