"use client";

import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/useToast";
import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";

interface AddClassModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
}

interface TimetableEntry {
  id: string;
  subject_id: string;
  subject_name?: string;
  subject_code?: string;
  branch: string;
  section: string;
  day: string;
  time_slot: string;
  room_id: string;
  room_number?: string;
  academic_year: string;
  semester_type: string;
  notes?: string;
  color_code?: string;
}

interface Subject {
  id: string;
  course_name: string;
  course_code: string;
}

interface Room {
  id: string;
  room_number: string;
}

export default function AddClassModal({
  isOpen,
  onCloseAction,
}: AddClassModalProps) {
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);
  const [days, setDays] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);

  const [filteredEntries, setFilteredEntries] = useState<TimetableEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { showSuccess, showError } = useToast();

  // Fetch all timetable entries and extract unique values for filters
  useEffect(() => {
    if (isOpen) {
      fetchTimetableData();
    }
  }, [isOpen]);

  const fetchTimetableData = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/utils/timetable/entries");
      const data = await response.json();

      if (data.success) {
        const entries = data.data;

        // Extract unique values for filters from the joined data
        const uniqueSubjectIds = Array.from(
          new Set(entries.map((e: any) => e.subject_id).filter(Boolean)),
        );
        const uniqueSubjects = uniqueSubjectIds
          .map((id) => ({
            id: id,
            course_name:
              entries.find((e: any) => e.subject_id === id)?.subject_name || "",
            course_code:
              entries.find((e: any) => e.subject_id === id)?.subject_code || "",
          }))
          .filter((s) => s.course_name) as Subject[];

        const uniqueBranches = Array.from(
          new Set(entries.map((e: any) => e.branch).filter(Boolean)),
        ) as string[];
        const uniqueSections = Array.from(
          new Set(entries.map((e: any) => e.section).filter(Boolean)),
        ) as string[];
        const uniqueSemesters = Array.from(
          new Set(entries.map((e: any) => e.semester_type).filter(Boolean)),
        ) as string[];
        const uniqueDays = Array.from(
          new Set(entries.map((e: any) => e.day).filter(Boolean)),
        ) as string[];
        const uniqueTimeSlots = Array.from(
          new Set(entries.map((e: any) => e.time_slot).filter(Boolean)),
        ) as string[];

        setSubjects(uniqueSubjects);
        setBranches(uniqueBranches);
        setSections(uniqueSections);
        setSemesters(uniqueSemesters);
        setDays(uniqueDays);
        setTimeSlots(uniqueTimeSlots);

        // Initially show all entries
        setFilteredEntries(entries);
      }
    } catch (error) {
      showError("Failed to fetch timetable data");
    } finally {
      setLoading(false);
    }
  };

  // Filter entries based on selected criteria
  useEffect(() => {
    const filterEntries = async () => {
      if (!isOpen) return;

      const params = new URLSearchParams();
      if (selectedSubject) params.append("subject", selectedSubject);
      if (selectedBranch) params.append("branch", selectedBranch);
      if (selectedSection) params.append("section", selectedSection);
      if (selectedSemester) params.append("semester", selectedSemester);
      if (selectedDay) params.append("day", selectedDay);
      if (selectedTimeSlot) params.append("time_slot", selectedTimeSlot);

      try {
        const response = await fetch(
          `/api/utils/timetable/entries?${params.toString()}`,
        );
        const data = await response.json();

        if (data.success) {
          setFilteredEntries(data.data);
          setSelectedEntry(""); // Reset selection when filters change
        }
      } catch (error) {
        console.error("Error filtering entries:", error);
      }
    };

    filterEntries();
  }, [
    selectedSubject,
    selectedBranch,
    selectedSection,
    selectedSemester,
    selectedDay,
    selectedTimeSlot,
    isOpen,
  ]);

  const handleSubmit = async () => {
    if (!selectedEntry) {
      showError("Please select a timetable entry");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/teacher/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          timetable_entry_id: selectedEntry,
        }),
      });

      if (response.ok) {
        showSuccess("Class added successfully!");
        handleClose();
      } else {
        const error = await response.json();
        showError(error.error || "Failed to add class");
      }
    } catch (error) {
      showError("An error occurred while adding the class");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedSubject("");
    setSelectedBranch("");
    setSelectedSection("");
    setSelectedSemester("");
    setSelectedDay("");
    setSelectedTimeSlot("");
    setSelectedEntry("");
    setFilteredEntries([]);
    onCloseAction();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 min-h-screen">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-auto my-auto animate-in fade-in-0 zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">
              Add New Class
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm">
              Filter and select from available timetable entries
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 flex-shrink-0"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Filter Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.course_code} - {subject.course_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Branches</option>
                {branches.map((branch) => (
                  <option key={branch} value={branch}>
                    {branch}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Section
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Sections</option>
                {sections.map((section) => (
                  <option key={section} value={section}>
                    Section {section}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Semester Type
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Semesters</option>
                {semesters.map((semester) => (
                  <option key={semester} value={semester}>
                    {semester.charAt(0).toUpperCase() + semester.slice(1)}{" "}
                    Semester
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Day
              </label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Days</option>
                {days.map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Slot
              </label>
              <select
                value={selectedTimeSlot}
                onChange={(e) => setSelectedTimeSlot(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Time Slots</option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Available Timetable Entries */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available Timetable Entries ({filteredEntries.length} found)
            </label>

            {loading ? (
              <div className="flex items-center justify-center p-8">
                <LoadingSpinner
                  size="lg"
                  color="text-blue-600"
                  className="mr-2"
                />
                <span className="text-gray-600">
                  Loading timetable entries...
                </span>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">
                  No timetable entries found for the selected criteria
                </p>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredEntries.map((entry) => (
                  <label
                    key={entry.id}
                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedEntry === entry.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="timetableEntry"
                      value={entry.id}
                      checked={selectedEntry === entry.id}
                      onChange={(e) => setSelectedEntry(e.target.value)}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-900">
                            Subject:
                          </span>
                          <div>
                            {entry.subject_code} - {entry.subject_name}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">
                            Branch:
                          </span>
                          <div>
                            {entry.branch} - {entry.section}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">
                            Schedule:
                          </span>
                          <div>{entry.day}</div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">
                            Time:
                          </span>
                          <div>{entry.time_slot}</div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">
                            Room:
                          </span>
                          <div>{entry.room_number}</div>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedEntry || submitting}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {submitting ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Adding...
              </>
            ) : (
              "Add Class"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
