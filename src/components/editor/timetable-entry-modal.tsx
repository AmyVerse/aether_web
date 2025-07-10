"use client";

import { useSessionStore } from "@/store/useSessionStore";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import Dialog from "../ui/dialog";

interface TimetableEntryModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onEntryAddedAction: () => void;
  prefilledData?: {
    day: string;
    timeSlot: string;
  };
}

interface Subject {
  id: string;
  course_name: string;
  course_code: string;
}

interface Room {
  id: string;
  room_number: string;
  room_type: string;
}

export function TimetableEntryModal({
  isOpen,
  onCloseAction,
  onEntryAddedAction,
  prefilledData,
}: TimetableEntryModalProps) {
  const academicYear = useSessionStore((s) => s.academicYear);
  const semesterType = useSessionStore((s) => s.semesterType);
  const [formData, setFormData] = useState({
    subjectId: "",
    roomId: "",
    branch: "",
    section: "",
    day: prefilledData?.day || "",
    timeSlot: "",
    academicYear,
    semesterType,
    semester: 1,
    notes: "",
    color_code: "",
  });

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Dropdown filtering states
  const [subjectFilter, setSubjectFilter] = useState("");
  const [roomFilter, setRoomFilter] = useState("");
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);

  // Refs for dropdown containers
  const subjectDropdownRef = useRef<HTMLDivElement>(null);
  const roomDropdownRef = useRef<HTMLDivElement>(null);

  // Load dropdown data
  useEffect(() => {
    if (isOpen) {
      loadDropdownData();
      // Reset filter states when modal opens
      setSubjectFilter("");
      setRoomFilter("");
      setShowSubjectDropdown(false);
      setShowRoomDropdown(false);
    }
  }, [isOpen]);

  // Update form when prefilled data changes or when modal opens (auto-detect year/sem)
  useEffect(() => {
    if (prefilledData) {
      setFormData((prev) => ({
        ...prev,
        day: prefilledData.day || "",
        timeSlot: prefilledData.timeSlot || "",
      }));
    }
    if (isOpen) {
      setFormData((prev) => ({
        ...prev,
        academicYear,
        semesterType,
      }));
    }
  }, [prefilledData, isOpen]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        subjectDropdownRef.current &&
        !subjectDropdownRef.current.contains(event.target as Node)
      ) {
        setShowSubjectDropdown(false);
      }
      if (
        roomDropdownRef.current &&
        !roomDropdownRef.current.contains(event.target as Node)
      ) {
        setShowRoomDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const loadDropdownData = async () => {
    try {
      const [subjectsRes, roomsRes] = await Promise.all([
        fetch("/api/subjects"),
        fetch("/api/rooms"),
      ]);

      if (subjectsRes.ok) {
        const subjectsData = await subjectsRes.json();
        setSubjects(subjectsData.data || []);
      } else {
        console.error("Failed to fetch subjects:", subjectsRes.status);
      }

      if (roomsRes.ok) {
        const roomsData = await roomsRes.json();
        setRooms(roomsData.data || []);
      } else {
        console.error("Failed to fetch rooms:", roomsRes.status);
      }
    } catch (error) {
      console.error("Failed to load dropdown data:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/timetable-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject_id: formData.subjectId,
          room_id: formData.roomId,
          branch: formData.branch,
          section: formData.section,
          day: formData.day,
          time_slot: formData.timeSlot,
          academic_year: formData.academicYear,
          semester_type: formData.semesterType,
          semester: formData.semester,
          notes: formData.notes,
          color_code: formData.color_code,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add timetable entry");
      }

      // Reset form and close modal
      setFormData({
        subjectId: "",
        roomId: "",
        branch: "",
        section: "",
        day: prefilledData?.day || "",
        timeSlot: prefilledData?.timeSlot || "",
        academicYear,
        semesterType,
        semester: 1,
        notes: "",
        color_code: "",
      });
      setSubjectFilter("");
      setRoomFilter("");
      setShowSubjectDropdown(false);
      setShowRoomDropdown(false);
      onEntryAddedAction();
      onCloseAction();
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Helper functions for handling form changes
  const handleSubjectChange = (value: string, name: string) => {
    setFormData((prev) => ({
      ...prev,
      subjectId: value,
    }));
    setSubjectFilter(name);
    setShowSubjectDropdown(false);
  };

  const handleRoomChange = (value: string, name: string) => {
    setFormData((prev) => ({
      ...prev,
      roomId: value,
    }));
    setRoomFilter(name);
    setShowRoomDropdown(false);
  };

  // Dedicated handler for textarea
  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Filter functions
  const filteredSubjects = subjects.filter((subject) =>
    `${subject.course_code} - ${subject.course_name}`
      .toLowerCase()
      .includes(subjectFilter.toLowerCase()),
  );

  const filteredRooms = rooms.filter((room) =>
    `${room.room_number} (${room.room_type})`
      .toLowerCase()
      .includes(roomFilter.toLowerCase()),
  );

  // Get display text for selected items
  const selectedSubject = formData.subjectId
    ? subjects.find((s) => s.id === formData.subjectId)
    : null;
  const selectedSubjectText = selectedSubject
    ? `${selectedSubject.course_code} - ${selectedSubject.course_name}`
    : "";

  const selectedRoom = formData.roomId
    ? rooms.find((r) => r.id === formData.roomId)
    : null;
  const selectedRoomText = selectedRoom
    ? `${selectedRoom.room_number} (${selectedRoom.room_type})`
    : "";

  // Color accent suggestions
  const colorSuggestions = [
    "#60a5fa", // blue-400
    "#f59e42", // orange-400
    "#34d399", // green-400
    "#f87171", // red-400
    "#a78bfa", // purple-400
  ];

  if (!isOpen) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onCloseAction}
      title="Add/Edit Timetable Entry"
      showActions={false}
    >
      <div className="p-4 sm:p-6">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="day"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Day *
              </label>
              <select
                id="day"
                name="day"
                value={formData.day}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Day</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="timeSlot"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Time Slot *
              </label>
              <select
                id="timeSlot"
                name="timeSlot"
                value={formData.timeSlot}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Time Slot</option>
                <option value="8:00-8:55">8:00-8:55</option>
                <option value="9:00-9:55">9:00-9:55</option>
                <option value="10:00-10:55">10:00-10:55</option>
                <option value="11:00-11:55">11:00-11:55</option>
                <option value="12:00-12:55">12:00-12:55</option>
                <option value="13:00-13:55">13:00-13:55</option>
                <option value="14:00-14:55">14:00-14:55</option>
                <option value="15:00-15:55">15:00-15:55</option>
                <option value="16:00-16:55">16:00-16:55</option>
                <option value="17:00-17:55">17:00-17:55</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="academicYear"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Academic Year *
              </label>
              <select
                id="academicYear"
                name="academicYear"
                value={academicYear}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
                <option value="2026-2027">2026-2027</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="semesterType"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Semester Type *
              </label>
              <select
                id="semesterType"
                name="semesterType"
                value={semesterType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="odd">Odd</option>
                <option value="even">Even</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="semester"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Semester No. *
              </label>
              <select
                id="semester"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select</option>
                {[...Array(8)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="subjectId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Subject *
            </label>
            <div className="relative" ref={subjectDropdownRef}>
              <input
                type="text"
                placeholder="Search and select subject..."
                value={
                  showSubjectDropdown ? subjectFilter : selectedSubjectText
                }
                onChange={(e) => setSubjectFilter(e.target.value)}
                onFocus={() => {
                  setShowSubjectDropdown(true);
                  setSubjectFilter("");
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {showSubjectDropdown && (
                <div className="absolute w-full max-h-48 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                  {subjects.length > 0 ? (
                    subjects.map((subject) => (
                      <div
                        key={subject.id}
                        onClick={() =>
                          handleSubjectChange(
                            subject.id,
                            `${subject.course_code} - ${subject.course_name}`,
                          )
                        }
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium">{subject.course_code}</div>
                        <div className="text-sm text-gray-600">
                          {subject.course_name}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-gray-500">
                      No subjects found (Total loaded: {subjects.length})
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div>
            <label
              htmlFor="roomId"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Room *
            </label>
            <div className="relative" ref={roomDropdownRef}>
              <input
                type="text"
                placeholder="Search and select room..."
                value={showRoomDropdown ? roomFilter : selectedRoomText}
                onChange={(e) => setRoomFilter(e.target.value)}
                onFocus={() => {
                  setShowRoomDropdown(true);
                  setRoomFilter("");
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              {showRoomDropdown && (
                <div className="absolute w-full max-h-48 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg mt-1">
                  {rooms.length > 0 ? (
                    rooms.map((room) => (
                      <div
                        key={room.id}
                        onClick={() =>
                          handleRoomChange(
                            room.id,
                            `${room.room_number} (${room.room_type})`,
                          )
                        }
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <div className="font-medium">{room.room_number}</div>
                        <div className="text-sm text-gray-600">
                          {room.room_type}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-gray-500">
                      No rooms found (Total loaded: {rooms.length})
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="branch"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Branch *
              </label>
              <select
                id="branch"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select</option>
                <option value="CSE">CSE</option>
                <option value="CSE-AIML">CSE-AIML</option>
                <option value="CSE-DS">CSE-DS</option>
                <option value="CSE-HCIGT">CSE-HCIGT</option>
                <option value="ECE">ECE</option>
                <option value="ECE-IoT">ECE-IoT</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="section"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Section *
              </label>
              <select
                id="section"
                name="section"
                value={formData.section}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
              </select>
            </div>
          </div>

          {/* Notes field */}
          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleTextAreaChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any additional notes..."
              rows={2}
            />
          </div>

          {/* Color field */}
          <div>
            <label
              htmlFor="color_code"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                id="color_code"
                name="color_code"
                value={formData.color_code}
                onChange={handleChange}
                className="w-12 h-8 p-0 border-0 bg-transparent"
              />
              {/* Color suggestions */}
              <div className="flex gap-1">
                {colorSuggestions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    title={color}
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, color_code: color }))
                    }
                    className={`w-6 h-6 rounded-full border-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${formData.color_code === color ? "border-blue-600" : "border-gray-200"}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onCloseAction}
              width="flex-1"
              height="h-10"
              padding="px-4 py-2"
              font="text-sm"
              className="border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              width="flex-1"
              height="h-10"
              padding="px-4 py-2"
              font="text-sm"
              className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isSubmitting ? "Adding..." : "Add Entry"}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
