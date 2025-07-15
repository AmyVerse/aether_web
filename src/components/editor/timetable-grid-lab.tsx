"use client";

import Combobox from "@/components/ui/combobox";
import Dialog from "@/components/ui/dialog";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useSessionStore } from "@/store/useSessionStore";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FaPlus } from "react-icons/fa";

interface Room {
  id: string;
  room_number: string;
  room_type: "Classroom" | "Lab";
  capacity: number;
  building: string;
}

interface Subject {
  id: string;
  course_code: string;
  course_name: string;
  short_name: string;
}

interface LabTimetableEntry {
  id: string;
  room_id: string;
  subject_id: string;
  academic_year: string;
  semester_type: "odd" | "even";
  semester: number;
  branch: string;
  section: string;
  day: string;
  start_time: string;
  end_time: string;
  duration_hours: number;
  notes: string | null;
  color_code: string | null;
  created_at: string;
  subject: Subject | null;
  room: Room | null;
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
  "8:00",
  "9:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

export default function TimetableGridLab() {
  const sessionStore = useSessionStore();
  const academicYear = sessionStore?.academicYear || "";
  const semesterType = sessionStore?.semesterType || "odd";

  const [rooms, setRooms] = useState<Room[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timetableEntries, setTimetableEntries] = useState<LabTimetableEntry[]>(
    [],
  );
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [timetableLoading, setTimetableLoading] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{
    day: string;
    timeSlot: string;
  } | null>(null);

  // Form states for lab entry
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const [selectedDuration, setSelectedDuration] = useState<number>(2); // Default 2 hours

  // Memoized lab rooms
  const labRooms = useMemo(
    () =>
      Array.isArray(rooms)
        ? rooms.filter((room) => room.room_type === "Lab")
        : [],
    [rooms],
  );

  // Color coding based on time half
  const getSubjectColor = (timeSlot: string) => {
    const timeHour = parseInt(timeSlot.split(":")[0]);
    const isFirstHalf = timeHour < 13;

    if (isFirstHalf) {
      return "bg-purple-100 text-purple-800 border-purple-200";
    } else {
      return "bg-orange-100 text-orange-800 border-orange-200";
    }
  };

  // Unified function to fetch lab timetable data
  const fetchLabTimetableData = useCallback(
    async (roomId: string) => {
      if (!roomId) return [];

      const response = await fetch(
        `/api/editor/lab-timetable-entries?room_id=${roomId}&academic_year=${academicYear}&semester_type=${semesterType}`,
      );

      if (!response.ok) return [];

      return await response.json();
    },
    [academicYear, semesterType],
  );

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData();
  }, [academicYear, semesterType]);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch rooms and subjects in parallel
      const [roomsResponse, subjectsResponse] = await Promise.all([
        fetch("/api/editor/rooms"),
        fetch("/api/editor/subjects"),
      ]);

      if (roomsResponse.ok && subjectsResponse.ok) {
        const [roomsData, subjectsData] = await Promise.all([
          roomsResponse.json(),
          subjectsResponse.json(),
        ]);

        const allRooms = roomsData?.rooms || [];

        setRooms(allRooms);
        setSubjects(subjectsData?.subjects || subjectsData || []);

        // Don't auto-select any lab - let user choose from all available labs
      }
    } catch (error) {
      setRooms([]);
      setSubjects([]);
      setTimetableEntries([]);
    } finally {
      setLoading(false);
    }
  }, [academicYear, semesterType, fetchLabTimetableData]);

  // Handle room selection
  const handleRoomSelect = useCallback(
    async (roomId: string) => {
      setSelectedRoom(roomId);

      try {
        setTimetableLoading(true);
        const entriesWithTimings = await fetchLabTimetableData(roomId);
        setTimetableEntries(entriesWithTimings);
      } catch {
        setTimetableEntries([]);
      } finally {
        setTimetableLoading(false);
      }
    },
    [fetchLabTimetableData],
  );

  const handleCellClick = useCallback(
    (day: string, timeSlot: string) => {
      if (!selectedRoom) return; // Don't allow cell clicks if no room is selected

      setSelectedCell({ day, timeSlot });
      setSelectedSubjectId("");
      setSelectedBranch("");
      setSelectedSection("");
      setSelectedSemester(1);
      setSelectedDuration(2);
      setShowSubjectModal(true);
    },
    [selectedRoom],
  );

  const getSubjectForCell = useCallback(
    (day: string, timeSlot: string) => {
      // For labs, we need to check if the time slot falls within any lab session
      const timeHour = parseInt(timeSlot.split(":")[0]);

      const entry = timetableEntries.find((entry) => {
        if (entry.day !== day) return false;

        const startHour = parseInt(entry.start_time.split(":")[0]);
        const endHour = parseInt(entry.end_time.split(":")[0]);

        return timeHour >= startHour && timeHour < endHour;
      });

      return entry;
    },
    [timetableEntries],
  );

  // Check if this cell is the start of a lab session
  const isLabStartCell = useCallback(
    (day: string, timeSlot: string) => {
      const entry = timetableEntries.find((entry) => {
        return entry.day === day && entry.start_time === timeSlot;
      });
      return entry;
    },
    [timetableEntries],
  );

  const handleSubjectSelect = useCallback(async () => {
    if (
      !selectedCell ||
      !selectedSubjectId ||
      !selectedBranch ||
      !selectedSection ||
      !selectedDuration
    )
      return;

    try {
      // Calculate end time based on start time and duration
      const startHour = parseInt(selectedCell.timeSlot.split(":")[0]);
      const endHour = startHour + selectedDuration;
      const startTime = selectedCell.timeSlot;
      const endTime = `${endHour.toString().padStart(2, "0")}:00`;

      // For labs, we create a direct lab timetable entry
      const response = await fetch("/api/editor/lab-timetable-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room_id: selectedRoom,
          subject_id: selectedSubjectId,
          academic_year: academicYear,
          semester_type: semesterType,
          semester: selectedSemester,
          branch: selectedBranch,
          section: selectedSection,
          day: selectedCell.day,
          start_time: startTime,
          end_time: endTime,
          duration_hours: selectedDuration,
        }),
      });

      if (response.ok) {
        // Refresh timetable entries
        const entriesWithTimings = await fetchLabTimetableData(selectedRoom);
        setTimetableEntries(entriesWithTimings);
      }
    } catch {
      // Silently handle errors
    }

    setShowSubjectModal(false);
    setSelectedCell(null);
    setSelectedSubjectId("");
    setSelectedBranch("");
    setSelectedSection("");
    setSelectedSemester(1);
    setSelectedDuration(1);
  }, [
    selectedCell,
    selectedSubjectId,
    selectedBranch,
    selectedSection,
    selectedSemester,
    selectedDuration,
    selectedRoom,
    academicYear,
    semesterType,
    fetchLabTimetableData,
  ]);

  // Memoized modal handlers
  const handleCloseSubjectModal = useCallback(() => {
    setShowSubjectModal(false);
    setSelectedCell(null);
    setSelectedSubjectId("");
    setSelectedBranch("");
    setSelectedSection("");
    setSelectedSemester(1);
    setSelectedDuration(2);
  }, []);

  // Memoized subject options for Combobox
  const subjectOptions = useMemo(
    () =>
      subjects.map((subject) => ({
        value: subject.id,
        label: `${subject.course_code} - ${subject.course_name}`,
      })),
    [subjects],
  );

  // Branch options - use schema enum values
  const branchOptions = useMemo(
    () => [
      { value: "CSE", label: "CSE" },
      { value: "CSE-AIML", label: "CSE-AIML" },
      { value: "CSE-DS", label: "CSE-DS" },
      { value: "CSE-HCIGT", label: "CSE-HCIGT" },
      { value: "ECE", label: "ECE" },
      { value: "ECE-IoT", label: "ECE-IoT" },
    ],
    [],
  );

  // Section options - as requested: A1, A2, B1, B2, C1, C2
  const sectionOptions = useMemo(
    () => [
      { value: "A1", label: "Section A1" },
      { value: "A2", label: "Section A2" },
      { value: "B1", label: "Section B1" },
      { value: "B2", label: "Section B2" },
      { value: "C1", label: "Section C1" },
      { value: "C2", label: "Section C2" },
    ],
    [],
  );

  // Semester options - based on semester type from Zustand
  const semesterOptions = useMemo(() => {
    const semesters = semesterType === "odd" ? [1, 3, 5, 7] : [2, 4, 6, 8];
    return semesters.map((semester) => ({
      value: semester.toString(),
      label: `Semester ${semester}`,
    }));
  }, [semesterType]);

  if (loading) {
    return (
      <div className="flex items-center flex-col justify-center h-64">
        <LoadingSpinner size="lg" color="text-purple-600" />
        <p className="mt-2 text-sm text-gray-600">
          Loading lab timetable data...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Lab Timetable Grid
        </h1>

        {/* Lab Tabs */}
        {labRooms.length > 0 && (
          <div className="flex space-x-1 border-b border-gray-200">
            {labRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => handleRoomSelect(room.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  selectedRoom === room.id
                    ? "bg-purple-100 text-purple-700 border-b-2 border-purple-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {room.room_number}
              </button>
            ))}
          </div>
        )}

        {/* Legend */}
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Legend:</h3>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 border-l-4 border-l-blue-500 rounded"></div>
              <span>Lab session start (shows full timing)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-50 border-l-2 border-l-blue-300 rounded"></div>
              <span>Lab session continuation</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-50 border-2 border-dashed border-gray-200 rounded"></div>
              <span>Available slot</span>
            </div>
          </div>
        </div>
      </div>

      {/* Timetable Grid */}
      {labRooms.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No labs found in the system.
        </div>
      ) : !selectedRoom ? (
        <div className="text-center py-8 text-gray-500">
          Select a lab from the tabs above to view its timetable.
        </div>
      ) : (
        <div className="overflow-x-auto">
          {timetableLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" color="text-purple-600" />
              <p className="ml-2 text-sm text-gray-600">Loading lab data...</p>
            </div>
          ) : (
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-3 bg-gray-50 text-center font-medium min-w-[100px]">
                    Day / Time
                  </th>
                  {TIME_SLOTS.map((timeSlot) => (
                    <th
                      key={timeSlot}
                      className="border border-gray-300 p-3 bg-gray-50 text-center font-medium min-w-[120px]"
                    >
                      {timeSlot}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((day) => (
                  <tr key={day}>
                    <td className="border border-gray-300 p-3 bg-gray-100 text-center font-medium text-sm">
                      {day}
                    </td>
                    {TIME_SLOTS.map((timeSlot) => {
                      const subjectEntry = getSubjectForCell(day, timeSlot);
                      const isStartCell = isLabStartCell(day, timeSlot);

                      return (
                        <td
                          key={`${day}-${timeSlot}`}
                          className="border border-gray-300 p-3 min-h-[90px]"
                        >
                          <div className="space-y-1">
                            {subjectEntry ? (
                              <div
                                className={`justify-center flex px-2 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-all cursor-pointer border ${
                                  isStartCell
                                    ? "bg-blue-100 text-blue-800 border-blue-200 border-l-4 border-l-blue-500"
                                    : "bg-blue-50 text-blue-700 border-blue-100 border-l-2 border-l-blue-300"
                                }`}
                              >
                                <div className="text-center">
                                  <div className="font-semibold">
                                    {subjectEntry.subject?.short_name ||
                                      subjectEntry.subject?.course_code}
                                  </div>
                                  <div className="text-xs opacity-75">
                                    {subjectEntry.branch}-{subjectEntry.section}{" "}
                                    (S{subjectEntry.semester})
                                  </div>
                                  {isStartCell && (
                                    <div className="text-xs font-medium mt-1 bg-blue-200 px-1 rounded">
                                      {subjectEntry.start_time} -{" "}
                                      {subjectEntry.end_time}
                                      <br />({subjectEntry.duration_hours}h)
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div
                                className="bg-gray-50 justify-center flex hover:bg-gray-100 border-dashed border-2 border-gray-200 px-3 py-2 rounded text-sm text-gray-300 cursor-pointer transition-colors"
                                onClick={() => handleCellClick(day, timeSlot)}
                              >
                                <FaPlus />
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Subject Selection Dialog for Labs */}
      <Dialog
        isOpen={showSubjectModal}
        onClose={handleCloseSubjectModal}
        title="Add Lab Session"
        description={
          selectedCell ? `${selectedCell.day} at ${selectedCell.timeSlot}` : ""
        }
        confirmText="Add Lab Session"
        onConfirm={handleSubjectSelect}
        confirmVariant="default"
        showActions={true}
        size="xl"
      >
        <div className="space-y-4 mb-10">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject
            </label>
            <Combobox
              options={subjectOptions}
              value={selectedSubjectId}
              onChange={setSelectedSubjectId}
              placeholder="Search for a subject..."
              className="w-full "
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch
              </label>
              <Combobox
                options={branchOptions}
                value={selectedBranch}
                onChange={setSelectedBranch}
                placeholder="Select branch..."
                className="w-full "
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section
              </label>
              <Combobox
                options={sectionOptions}
                value={selectedSection}
                onChange={setSelectedSection}
                placeholder="Select section..."
                className="w-full "
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semester
              </label>
              <Combobox
                options={semesterOptions}
                value={selectedSemester.toString()}
                onChange={(value) => setSelectedSemester(parseInt(value))}
                placeholder="Select semester..."
                className="w-full "
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (Hours)
              </label>
              <Combobox
                options={[
                  { value: "1", label: "1 Hour" },
                  { value: "2", label: "2 Hours" },
                  { value: "3", label: "3 Hours" },
                  { value: "4", label: "4 Hours" },
                ]}
                value={selectedDuration.toString()}
                onChange={(value) => setSelectedDuration(parseInt(value))}
                placeholder="Select duration..."
                className="w-full "
              />
            </div>
          </div>

          {selectedSubjectId &&
            selectedBranch &&
            selectedSection &&
            selectedDuration && (
              <div className="p-3 bg-purple-50 rounded border">
                <div className="text-sm text-purple-800">
                  <strong>Lab Session:</strong>{" "}
                  {
                    subjects.find((s) => s.id === selectedSubjectId)
                      ?.course_code
                  }{" "}
                  -{" "}
                  {
                    subjects.find((s) => s.id === selectedSubjectId)
                      ?.course_name
                  }
                  <br />
                  <strong>For:</strong> {selectedBranch}-{selectedSection}{" "}
                  (Semester {selectedSemester})
                  <br />
                  <strong>Duration:</strong> {selectedDuration} hour
                  {selectedDuration > 1 ? "s" : ""}
                  <br />
                  <strong>Time:</strong> {selectedCell?.timeSlot} -{" "}
                  {selectedCell &&
                    (() => {
                      const startHour = parseInt(
                        selectedCell.timeSlot.split(":")[0],
                      );
                      const endHour = startHour + selectedDuration;
                      return `${endHour.toString().padStart(2, "0")}:00`;
                    })()}
                </div>
              </div>
            )}
        </div>
      </Dialog>
    </div>
  );
}
