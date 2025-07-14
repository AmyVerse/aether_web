import Combobox from "@/components/ui/combobox";
import Dialog from "@/components/ui/dialog";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useTeacherClassesCache } from "@/hooks/useDataCache";
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

  // Cache hooks
  const { invalidateTeacherClasses } = useTeacherClassesCache();
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedSemesterType, setSelectedSemesterType] = useState("");
  const [selectedSemesterNumber, setSelectedSemesterNumber] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [sections, setSections] = useState<string[]>([]);

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
      // Fetch timetable entries and rooms in parallel
      const [entriesResponse, roomsResponse] = await Promise.all([
        fetch("/api/utils/timetable/entries"),
        fetch("/api/rooms"),
      ]);

      const entriesData = await entriesResponse.json();
      const roomsData = await roomsResponse.json();

      if (entriesData.success) {
        const entries = entriesData.data;

        // Create room lookup map
        const roomMap = new Map();
        if (roomsData.success) {
          roomsData.data.forEach((room: any) => {
            roomMap.set(room.id, room.room_number);
          });
        }

        // Add room_number to entries
        const enrichedEntries = entries.map((entry: any) => ({
          ...entry,
          room_number: roomMap.get(entry.room_id) || "Unknown",
        }));

        // Extract unique values for filters
        const uniqueSubjects = Array.from(
          new Map(
            entries.map((e: any) => [
              e.subject_id,
              {
                id: e.subject_id,
                course_name: e.subject_name || "",
                course_code: e.subject_code || "",
              },
            ]),
          ).values(),
        ).filter((s: any) => s.course_name);

        const uniqueBranches = [
          ...new Set(entries.map((e: any) => e.branch).filter(Boolean)),
        ];
        const uniqueSections = [
          ...new Set(entries.map((e: any) => e.section).filter(Boolean)),
        ];

        setSubjects(uniqueSubjects as Subject[]);
        setBranches(uniqueBranches as string[]);
        setSections(uniqueSections as string[]);
        setAllEntries(enrichedEntries);
        setFilteredEntries(enrichedEntries);
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
        // Invalidate teacher classes cache to trigger refresh
        invalidateTeacherClasses();
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

  const handleConfirm = () => {
    if (!selectedEntry) {
      showError("Please select a timetable entry");
      return;
    }
    handleSubmit();
  };

  if (!isOpen) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Add New Class"
      description="Filter and select from available timetable entries"
      size="full"
      showActions={true}
      confirmText={submitting ? "Adding..." : "Add Class"}
      cancelText="Cancel"
      onConfirm={handleConfirm}
      confirmVariant="default"
    >
      {/* Filters Layout - Subject takes 2x space, others 1x each */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Subject - Full width on mobile, 2x width on desktop */}
        <div className="flex-[2] lg:flex-[2]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Subject
          </label>
          <Combobox
            options={[
              { value: "", label: "All Subjects" },
              ...subjects.map((subject) => ({
                value: subject.id,
                label: `${subject.course_code} - ${subject.course_name}`,
              })),
            ]}
            value={selectedSubject}
            onChange={setSelectedSubject}
            placeholder="Search or select subject..."
            className="bg-blue-50 hover:bg-blue-100 focus-within:bg-white transition-colors rounded-lg"
          />
        </div>

        {/* Branch, Section, Semester - Equal width row on mobile, 1x width each on desktop */}
        <div className="flex flex-row gap-4 lg:flex-[3] lg:gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch
            </label>
            <Combobox
              options={[
                { value: "", label: "All Branches" },
                ...branches.map((branch) => ({
                  value: branch,
                  label: branch,
                })),
              ]}
              value={selectedBranch}
              onChange={setSelectedBranch}
              placeholder="Search branch..."
              className="bg-green-50 hover:bg-green-100 focus-within:bg-white transition-colors rounded-lg"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section
            </label>
            <Combobox
              options={[
                { value: "", label: "All Sections" },
                ...sections.map((section) => ({
                  value: section,
                  label: `Section ${section}`,
                })),
              ]}
              value={selectedSection}
              onChange={setSelectedSection}
              placeholder="Search section..."
              className="bg-purple-50 hover:bg-purple-100 focus-within:bg-white transition-colors rounded-lg"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semester
            </label>
            <Combobox
              options={[
                { value: "", label: "All Semesters" },
                ...(semesterType === "odd"
                  ? [1, 3, 5, 7]
                  : semesterType === "even"
                    ? [2, 4, 6, 8]
                    : [1, 2, 3, 4, 5, 6, 7, 8]
                ).map((num) => ({
                  value: String(num),
                  label: `Sem ${num}`,
                })),
              ]}
              value={selectedSemesterNumber}
              onChange={setSelectedSemesterNumber}
              placeholder="Search sem..."
              className="bg-orange-50 hover:bg-orange-100 focus-within:bg-white transition-colors rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Available Timetable Entries */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Available Timetable Entries ({filteredEntries.length} found)
        </label>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner size="lg" color="text-blue-600" className="mr-2" />
            <span className="text-gray-600">Loading timetable entries...</span>
          </div>
        ) : filteredEntries.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">
              No timetable entries found for the selected criteria
            </p>
          </div>
        ) : (
          <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2">
            {filteredEntries.map((entry) => (
              <label
                key={entry.id}
                className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
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
                  className="mr-3 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-900">Sem:</span>
                      <span className="text-gray-700">
                        {entry.semester ?? "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-900">
                        Subject:
                      </span>
                      <span className="text-gray-700">
                        {entry.subject_code}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-900">Branch:</span>
                      <span className="text-gray-700">
                        {entry.branch}-{entry.section}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-900">Room:</span>
                      <span className="text-gray-700">{entry.room_number}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-gray-900">
                        Schedule:
                      </span>
                      <span className="text-gray-700">
                        {Array.isArray(entry.timings) &&
                        entry.timings.length > 0
                          ? entry.timings
                              .map((t) => `${t.day}(${t.time_slot})`)
                              .join(", ")
                          : "-"}
                      </span>
                    </div>
                    {entry.notes && (
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-gray-900">
                          Notes:
                        </span>
                        <span className="text-gray-700 truncate">
                          {entry.notes}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
    </Dialog>
  );
}
