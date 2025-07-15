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

interface ClassroomAllocation {
  id: string;
  academic_year: string;
  semester_type: "odd" | "even";
  semester: number;
  branch: string;
  section: string;
  room_id: string;
  day_half: "first_half" | "second_half" | null;
  room: Room;
}

interface Subject {
  id: string;
  course_code: string;
  course_name: string;
  short_name: string;
}

interface TimetableEntry {
  id: string;
  allocation_id: string;
  subject_id: string;
  notes: string | null;
  color_code: string | null;
  created_at: string;
  subject: Subject | null;
  timings?: Array<{
    id: string;
    day: string;
    time_slot: string;
  }>;
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

export default function TimetableGrid() {
  const sessionStore = useSessionStore();
  const academicYear = sessionStore?.academicYear || "";
  const semesterType = sessionStore?.semesterType || "odd";
  const [allocations, setAllocations] = useState<ClassroomAllocation[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>(
    [],
  );
  const [selectedRoom, setSelectedRoom] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [timetableLoading, setTimetableLoading] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{
    day: string;
    timeSlot: string;
    allocation: ClassroomAllocation;
  } | null>(null);
  const [availableAllocations, setAvailableAllocations] = useState<
    ClassroomAllocation[]
  >([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");

  // Memoized calculations for performance
  const roomAllocations = useMemo(
    () => allocations.filter((a) => a?.room?.id === selectedRoom),
    [allocations, selectedRoom],
  );

  const uniqueRooms = useMemo(
    () =>
      Array.from(new Set(allocations.map((a) => a?.room?.id).filter(Boolean)))
        .map((roomId) => allocations.find((a) => a?.room?.id === roomId)?.room)
        .filter(Boolean),
    [allocations],
  );

  // Unified function to fetch timetable data with timings
  const fetchTimetableDataForAllocations = useCallback(
    async (allocationIds: string[]) => {
      if (allocationIds.length === 0) return [];

      const response = await fetch(
        `/api/editor/timetable-entries?allocation_ids=${allocationIds.join(",")}`,
      );

      if (!response.ok) return [];

      const entries = await response.json();
      if (entries.length === 0) return [];

      // Fetch all timings in bulk
      const entryIds = entries.map((entry: any) => entry.id);
      const timingsResponse = await fetch(
        `/api/editor/timetable-entries/bulk-timings?entry_ids=${entryIds.join(",")}`,
      );

      let timingsByEntry = {};
      if (timingsResponse.ok) {
        timingsByEntry = await timingsResponse.json();
      }

      // Combine entries with their timings
      return entries.map((entry: any) => ({
        ...entry,
        timings: timingsByEntry[entry.id as keyof typeof timingsByEntry] || [],
      }));
    },
    [],
  );

  // Color coding based on time half only
  const getSubjectColor = (timeSlot: string) => {
    const timeHour = parseInt(timeSlot.split(":")[0]);
    const isFirstHalf = timeHour < 13;

    if (isFirstHalf) {
      // First half - blue
      return "bg-blue-100 text-blue-800 border-blue-200";
    } else {
      // Second half - green
      return "bg-green-100 text-green-800 border-green-200";
    }
  };

  // Color coding for allocation badges
  const getAllocationColor = (dayHalf: string | null) => {
    if (dayHalf === "first_half") {
      return "bg-blue-100 text-blue-800";
    } else if (dayHalf === "second_half") {
      return "bg-green-100 text-green-800";
    } else {
      return "bg-gray-100 text-gray-800"; // For full day allocations
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [academicYear, semesterType]);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch allocations and subjects in parallel
      const [allocationsResponse, subjectsResponse] = await Promise.all([
        fetch(
          `/api/editor/allocations?academic_year=${academicYear}&semester_type=${semesterType}`,
        ),
        fetch("/api/editor/subjects"),
      ]);

      if (allocationsResponse.ok && subjectsResponse.ok) {
        const [allocationsData, subjectsData] = await Promise.all([
          allocationsResponse.json(),
          subjectsResponse.json(),
        ]);

        setAllocations(allocationsData || []);
        setSubjects(subjectsData?.subjects || subjectsData || []);

        // Auto-select first room and load timetable data
        if (
          allocationsData.length > 0 &&
          !selectedRoom &&
          allocationsData[0]?.room?.id
        ) {
          const firstRoomId = allocationsData[0].room.id;
          setSelectedRoom(firstRoomId);

          // Load timetable data for first room
          const firstRoomAllocations = allocationsData.filter(
            (a: ClassroomAllocation) => a?.room?.id === firstRoomId,
          );
          const allocationIds = firstRoomAllocations.map(
            (a: ClassroomAllocation) => a.id,
          );

          if (allocationIds.length > 0) {
            const entriesWithTimings =
              await fetchTimetableDataForAllocations(allocationIds);
            setTimetableEntries(entriesWithTimings);
          }
        }
      }
    } catch (error) {
      setAllocations([]);
      setSubjects([]);
      setTimetableEntries([]);
    } finally {
      setLoading(false);
    }
  }, [
    academicYear,
    semesterType,
    selectedRoom,
    fetchTimetableDataForAllocations,
  ]);

  const fetchTimetableData = useCallback(async () => {
    try {
      setTimetableLoading(true);
      const allocationIds = roomAllocations.map((a) => a.id);

      if (allocationIds.length > 0) {
        const entriesWithTimings =
          await fetchTimetableDataForAllocations(allocationIds);
        setTimetableEntries(entriesWithTimings);
      } else {
        setTimetableEntries([]);
      }
    } catch {
      setTimetableEntries([]);
    } finally {
      setTimetableLoading(false);
    }
  }, [roomAllocations, fetchTimetableDataForAllocations]);

  const getSubjectForCell = useCallback(
    (day: string, timeSlot: string, allocation: ClassroomAllocation) => {
      const entry = timetableEntries.find(
        (entry) =>
          entry.allocation_id === allocation.id &&
          entry.timings?.some(
            (timing) => timing.day === day && timing.time_slot === timeSlot,
          ),
      );
      return entry?.subject;
    },
    [timetableEntries],
  );

  const handleCellClick = useCallback(
    (day: string, timeSlot: string) => {
      // Determine which half of the day this time slot belongs to
      const timeHour = parseInt(timeSlot.split(":")[0]);
      const dayHalf = timeHour < 13 ? "first_half" : "second_half";

      // Get allocations for the specific half that don't have a subject in this slot
      const availableAllocs = roomAllocations.filter(
        (allocation) =>
          (allocation.day_half === dayHalf || allocation.day_half === null) &&
          !getSubjectForCell(day, timeSlot, allocation),
      );

      if (availableAllocs.length === 0) {
        return;
      } else if (availableAllocs.length === 1) {
        // Single allocation for this half, go directly to subject selection
        setSelectedCell({ day, timeSlot, allocation: availableAllocs[0] });
        setSelectedSubjectId("");
        setShowSubjectModal(true);
      } else {
        // Multiple allocations in the same half, show allocation selection first
        setAvailableAllocations(availableAllocs);
        setSelectedCell({ day, timeSlot, allocation: availableAllocs[0] }); // temporary
        setSelectedSubjectId("");
        setShowAllocationModal(true);
      }
    },
    [roomAllocations, getSubjectForCell],
  );

  const handleAllocationSelect = useCallback(
    (allocation: ClassroomAllocation) => {
      if (selectedCell) {
        setSelectedCell({ ...selectedCell, allocation });
        setShowAllocationModal(false);
        setSelectedSubjectId("");
        setShowSubjectModal(true);
      }
    },
    [selectedCell],
  );

  const handleSubjectSelect = useCallback(async () => {
    if (!selectedCell || !selectedSubjectId) return;

    try {
      // First, check if there's already an entry for this allocation-subject combination
      const existingEntry = timetableEntries.find(
        (entry) =>
          entry.allocation_id === selectedCell.allocation.id &&
          entry.subject_id === selectedSubjectId,
      );

      if (existingEntry) {
        // Check if timing already exists
        const timingExists = existingEntry.timings?.some(
          (timing) =>
            timing.day === selectedCell.day &&
            timing.time_slot === selectedCell.timeSlot,
        );

        if (timingExists) {
          setShowSubjectModal(false);
          setSelectedCell(null);
          setAvailableAllocations([]);
          setSelectedSubjectId("");
          return;
        }

        // Add timing to existing entry
        const response = await fetch(
          `/api/editor/timetable-entries/${existingEntry.id}/timings`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              day: selectedCell.day,
              time_slot: selectedCell.timeSlot,
            }),
          },
        );

        if (response.ok) {
          fetchTimetableData();
        }
      } else {
        // Create new timetable entry with timings
        const response = await fetch("/api/editor/timetable-entries", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            allocation_id: selectedCell.allocation.id,
            subject_id: selectedSubjectId,
            timings: [
              {
                day: selectedCell.day,
                time_slot: selectedCell.timeSlot,
              },
            ],
          }),
        });

        if (response.ok) {
          fetchTimetableData();
        }
      }
    } catch {
      // Silently handle errors
    }

    setShowSubjectModal(false);
    setSelectedCell(null);
    setAvailableAllocations([]);
    setSelectedSubjectId("");
  }, [selectedCell, selectedSubjectId, timetableEntries, fetchTimetableData]);

  // Optimized room selection handler
  const handleRoomSelect = useCallback(
    async (roomId: string) => {
      setSelectedRoom(roomId);

      try {
        setTimetableLoading(true);
        const roomAllocations = allocations.filter(
          (a) => a?.room?.id === roomId,
        );
        const allocationIds = roomAllocations.map((a) => a.id);

        if (allocationIds.length > 0) {
          const entriesWithTimings =
            await fetchTimetableDataForAllocations(allocationIds);
          setTimetableEntries(entriesWithTimings);
        } else {
          setTimetableEntries([]);
        }
      } catch {
        setTimetableEntries([]);
      } finally {
        setTimetableLoading(false);
      }
    },
    [allocations, fetchTimetableDataForAllocations],
  );

  // Memoized modal handlers
  const handleCloseAllocationModal = useCallback(() => {
    setShowAllocationModal(false);
    setSelectedCell(null);
    setAvailableAllocations([]);
    setSelectedSubjectId("");
  }, []);

  const handleCloseSubjectModal = useCallback(() => {
    setShowSubjectModal(false);
    setSelectedCell(null);
    setAvailableAllocations([]);
    setSelectedSubjectId("");
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

  if (loading) {
    return (
      <div className="flex items-center flex-col justify-center h-64">
        <LoadingSpinner size="lg" color="text-blue-600" />
        <p className="mt-2 text-sm text-gray-600">Loading timetable data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Timetable Grid
        </h1>

        {/* Room Tabs */}
        {uniqueRooms.length > 0 && (
          <div className="flex space-x-1 border-b border-gray-200">
            {uniqueRooms.map((room) => (
              <button
                key={room!.id}
                onClick={() => handleRoomSelect(room!.id)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  selectedRoom === room!.id
                    ? "bg-blue-100 text-blue-700 border-b-2 border-blue-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {room!.room_number}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Timetable Grid */}
      {uniqueRooms.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No classroom allocations found for the selected academic year and
          semester.
        </div>
      ) : (
        <div>
          {/* Allocation Summary */}
          {roomAllocations.length > 0 && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Allocations in this room:
              </h3>
              <div className="flex flex-wrap gap-2">
                {roomAllocations.map((allocation) => (
                  <div
                    key={allocation.id}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getAllocationColor(allocation.day_half)}`}
                  >
                    {allocation.branch}-{allocation.section} (Sem{" "}
                    {allocation.semester})
                    {allocation.day_half && (
                      <span className="ml-1 opacity-75">
                        •{" "}
                        {allocation.day_half === "first_half"
                          ? "1st Half"
                          : "2nd Half"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            {timetableLoading ? (
              <div className="flex items-center justify-center py-8">
                <LoadingSpinner size="md" color="text-blue-600" />
                <p className="ml-2 text-sm text-gray-600">
                  Loading room data...
                </p>
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
                        // Find all subjects for this time slot (across all allocations)
                        const subjectsForSlot = roomAllocations
                          .map((allocation) => ({
                            allocation,
                            subject: getSubjectForCell(
                              day,
                              timeSlot,
                              allocation,
                            ),
                          }))
                          .filter(({ subject }) => subject);

                        // Check if there are available allocations for this time slot
                        const timeHour = parseInt(timeSlot.split(":")[0]);
                        const dayHalf =
                          timeHour < 13 ? "first_half" : "second_half";
                        const availableAllocs = roomAllocations.filter(
                          (allocation) =>
                            (allocation.day_half === dayHalf ||
                              allocation.day_half === null) &&
                            !getSubjectForCell(day, timeSlot, allocation),
                        );

                        return (
                          <td
                            key={`${day}-${timeSlot}`}
                            className="border border-gray-300 p-3 min-h-[90px]"
                          >
                            <div className="space-y-1">
                              {subjectsForSlot.map(
                                ({ subject, allocation }) => (
                                  <div
                                    key={`${allocation.id}-${subject!.id}`}
                                    className={`justify-center flex px-2 py-2 rounded-lg text-sm font-medium hover:opacity-80 transition-all cursor-pointer border ${getSubjectColor(timeSlot)}`}
                                  >
                                    {subject!.short_name ||
                                      subject!.course_code}
                                  </div>
                                ),
                              )}
                              {availableAllocs.length > 0 && (
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
        </div>
      )}

      {/* Allocation Selection Modal */}
      {showAllocationModal && selectedCell && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Select Class</h3>
            <div className="text-sm text-gray-600 mb-4">
              Multiple classes are allocated to this room for the same time
              period. Select which class this subject is for:
              <br />
              <span className="font-medium">
                {selectedCell.day} at {selectedCell.timeSlot}
              </span>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2">
              {availableAllocations.map((allocation) => (
                <button
                  key={allocation.id}
                  onClick={() => handleAllocationSelect(allocation)}
                  className="w-full text-left p-3 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium">
                    {allocation.branch}-{allocation.section}
                    {allocation.day_half && (
                      <span className="ml-2 text-xs text-blue-600">
                        (
                        {allocation.day_half === "first_half"
                          ? "1st Half"
                          : "2nd Half"}
                        )
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    Semester {allocation.semester}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={handleCloseAllocationModal}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subject Selection Dialog */}
      <Dialog
        isOpen={showSubjectModal}
        onClose={handleCloseSubjectModal}
        title="Select Subject"
        description={
          selectedCell
            ? `${selectedCell.allocation.branch}-${selectedCell.allocation.section} (Semester ${selectedCell.allocation.semester}) • ${selectedCell.day} at ${selectedCell.timeSlot}`
            : ""
        }
        confirmText="Add Subject"
        onConfirm={handleSubjectSelect}
        confirmVariant="default"
        showActions={true}
        size="md"
      >
        <div className="space-y-4 mb-40">
          <Combobox
            options={subjectOptions}
            value={selectedSubjectId}
            onChange={setSelectedSubjectId}
            placeholder="Search for a subject..."
            className="w-full"
          />
          {selectedSubjectId && (
            <div className="p-3 bg-blue-50 rounded border">
              <div className="text-sm text-blue-800">
                Selected:{" "}
                {subjects.find((s) => s.id === selectedSubjectId)?.course_code}{" "}
                -{" "}
                {subjects.find((s) => s.id === selectedSubjectId)?.course_name}
              </div>
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}
