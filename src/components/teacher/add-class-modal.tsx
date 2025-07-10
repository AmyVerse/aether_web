import { Button } from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/useToast";
import { useSessionStore } from "@/store/useSessionStore";
import { useEffect, useState } from "react";

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
  room_id: string;
  room_number?: string;
  academic_year: string;
  semester_type: string;
  semester?: string | number;
  notes?: string;
  color_code?: string;
  timings?: { day: string; time_slot: string }[];
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
  // Use zustand for academic year and semester type (hidden from UI)
  const academicYear = useSessionStore((s) => s.academicYear);
  const semesterType = useSessionStore((s) => s.semesterType);
  const [semester, setSemester] = useState(1);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSemesterType, setSelectedSemesterType] = useState("");
  const [selectedSemesterNumber, setSelectedSemesterNumber] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [sections, setSections] = useState<string[]>([]);
  const [semesters, setSemesters] = useState<string[]>([]);
  const [days, setDays] = useState<string[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);

  const [allEntries, setAllEntries] = useState<TimetableEntry[]>([]);
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
        const uniqueSemesterTypes = Array.from(
          new Set(entries.map((e: any) => e.semester_type).filter(Boolean)),
        ) as string[];
        const uniqueSemesterNumbers = Array.from(
          new Set(entries.map((e: any) => e.semester).filter(Boolean)),
        ) as (string | number)[];

        setSubjects(uniqueSubjects);
        setBranches(uniqueBranches);
        setSections(uniqueSections);
        setSemesters(uniqueSemesterTypes);
        setDays([]); // Not used in new schema
        setTimeSlots([]); // Not used in new schema

        // Store all entries for filtering
        setAllEntries(entries);
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
    const filterEntries = () => {
      if (!isOpen) return;

      // Always filter in-memory by academic year and semester type, as well as other filters
      let filtered = allEntries;
      // Always filter by academic year and semester type from zustand
      if (academicYear) {
        filtered = filtered.filter((e) => e.academic_year === academicYear);
      }
      if (semesterType) {
        filtered = filtered.filter((e) => e.semester_type === semesterType);
      }
      // Semester number is a user filter, not part of session context
      if (selectedSubject) {
        filtered = filtered.filter((e) => e.subject_id === selectedSubject);
      }
      if (selectedBranch) {
        filtered = filtered.filter((e) => e.branch === selectedBranch);
      }
      if (selectedSection) {
        filtered = filtered.filter((e) => e.section === selectedSection);
      }
      if (selectedSemesterNumber) {
        filtered = filtered.filter(
          (e) => String(e.semester) === String(selectedSemesterNumber),
        );
      }
      setFilteredEntries(filtered);
      setSelectedEntry("");
    };

    filterEntries();
  }, [
    academicYear,
    semesterType,
    selectedSubject,
    selectedBranch,
    selectedSection,
    selectedSemesterNumber,
    isOpen,
    allEntries,
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
    setSelectedSemesterType("");
    setSelectedSemesterNumber("");
    setSelectedDay("");
    setSelectedTimeSlot("");
    setSelectedEntry("");
    setFilteredEntries([]);
    onCloseAction();
  };

  if (!isOpen) return null;
  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Class"
      description="Filter and select from available timetable entries"
      showActions={false}
    >
      <div className="p-0 sm:p-0 w-full h-full sm:max-w-4xl sm:h-auto max-h-screen overflow-y-auto flex flex-col">
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* 2x3 Grid for all filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
            {/* Academic Year and Semester Type are filtered in the background using zustand, not shown to user */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section
              </label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">All Sections</option>
                {sections.map((section) => (
                  <option key={section} value={section}>
                    Section {section}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Semester Number
              </label>
              <select
                value={selectedSemesterNumber}
                onChange={(e) => setSelectedSemesterNumber(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <option key={num} value={num}>
                    {num}
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
                      <div className="grid grid-cols-2 md:grid-cols-7 gap-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-900">
                            Semester No:
                          </span>
                          <div>{entry.semester ?? "-"}</div>
                        </div>
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
                        <div className="col-span-2">
                          <span className="font-medium text-gray-900">
                            Schedule:
                          </span>
                          <div>
                            {Array.isArray(entry.timings) &&
                            entry.timings.length > 0
                              ? entry.timings
                                  .map((t) => `${t.day} (${t.time_slot})`)
                                  .join(", ")
                              : "-"}
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-gray-900">
                            Notes:
                          </span>
                          <div>{entry.notes || "-"}</div>
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
    </Dialog>
  );
}
