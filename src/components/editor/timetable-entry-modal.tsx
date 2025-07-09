"use client";

import { getAcademicSession } from "@/lib/getAcademicSession";
import { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";

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
  const autoSession = getAcademicSession();
  const [formData, setFormData] = useState({
    subjectId: "",
    roomId: "",
    branch: "",
    section: "",
    day: prefilledData?.day || "",
    timeSlot: "",
    academicYear: autoSession.academicYear,
    semesterType: autoSession.semesterType,
    semester: 1,
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
      const auto = getAcademicSession();
      setFormData((prev) => ({
        ...prev,
        academicYear: auto.academicYear,
        semesterType: auto.semesterType,
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
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add timetable entry");
      }

      // Reset form and close modal
      const auto = getAcademicSession();
      setFormData({
        subjectId: "",
        roomId: "",
        branch: "",
        section: "",
        day: prefilledData?.day || "",
        timeSlot: prefilledData?.timeSlot || "",
        academicYear: auto.academicYear,
        semesterType: auto.semesterType,
        semester: 1,
      });
      <div>
        <label
          htmlFor="semester"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Semester *
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
      </div>;
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Add Timetable Entry
            </h2>
            <Button
              onClick={onCloseAction}
              width="w-8"
              height="h-8"
              padding="p-0"
              font="text-lg"
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </Button>
          </div>

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
                  value={formData.academicYear}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="2024-25">2024-25</option>
                  <option value="2025-26">2025-26</option>
                  <option value="2026-27">2026-27</option>
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
                  value={formData.semesterType}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="odd">Odd</option>
                  <option value="even">Even</option>
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
                          <div className="font-medium">
                            {subject.course_code}
                          </div>
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
      </div>
    </div>
  );
}
