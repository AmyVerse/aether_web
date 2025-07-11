"use client";

import { Button } from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";
import LoadingSpinner from "@/components/ui/loading-spinner";
import {
  useClassDetailsCache,
  useInvalidateRelatedCache,
} from "@/hooks/useDataCache";
import { useToast } from "@/hooks/useToast";
import { useSessionStore } from "@/store/useSessionStore";
import { useState } from "react";
import { FaPlus, FaUser } from "react-icons/fa";

interface Student {
  id: string;
  name: string;
  email: string;
  roll_number: string;
  batch_year: number;
  branch?: string;
}

interface ClassStudent {
  id: string;
  student: Student;
  enrolled_at: string;
  is_active: boolean;
  notes?: string;
}

interface ClassStudentsProps {
  classId: string;
  classStudents: ClassStudent[];
  onStudentsChangeAction: () => void;
}

export default function ClassStudents({
  classId,
  classStudents,
  onStudentsChangeAction,
}: ClassStudentsProps) {
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [classBranch, setClassBranch] = useState<string>("");
  const [classSem, setClassSem] = useState<string>("");
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [showAddStudents, setShowAddStudents] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [rollNumberFilter, setRollNumberFilter] = useState("");
  const { showSuccess, showError } = useToast();
  const { invalidateAfterStudentOperation } = useInvalidateRelatedCache();

  // Get academic session data from Zustand store
  const academicYear = useSessionStore((s) => s.academicYear);
  const semesterType = useSessionStore((s) => s.semesterType);

  // Use caching hooks
  const { fetchAvailableStudents: fetchAvailableStudentsFromCache } =
    useClassDetailsCache();

  const fetchAvailableStudents = async () => {
    setStudentsLoading(true);
    try {
      // Fetch class details to get branch information (using cache)
      const classResponse = await fetch(`/api/teacher/classes/${classId}`);
      const classData = await classResponse.json();

      if (classData.success) {
        setClassBranch(classData.data.branch || "");
        setClassSem(classData.data.semester || 0);
      }

      // Fetch available students (using cache)
      const data = (await fetchAvailableStudentsFromCache(classId)) as any;

      if (data?.success) {
        setAvailableStudents(data.data);
      } else {
        showError("Failed to fetch available students");
      }
    } catch (error) {
      showError("An error occurred while fetching available students");
    } finally {
      setStudentsLoading(false);
    }
  };

  const handleAddStudents = async () => {
    if (selectedStudents.length === 0) {
      showError("Please select at least one student");
      return;
    }

    if (submitting) return; // Prevent multiple submissions

    setSubmitting(true);
    try {
      const response = await fetch(`/api/teacher/classes/${classId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_ids: selectedStudents }),
      });

      if (response.ok) {
        showSuccess(
          `${selectedStudents.length} student(s) added successfully!`,
        );
        setShowAddStudents(false);
        setSelectedStudents([]);

        // Invalidate cache and refresh
        invalidateAfterStudentOperation(classId);
        onStudentsChangeAction();
      } else {
        const error = await response.json();
        showError(error.error || "Failed to add students");
      }
    } catch (error) {
      showError("An error occurred while adding students");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveStudent = async (studentId: string) => {
    try {
      const response = await fetch(
        `/api/teacher/classes/${classId}/students/${studentId}`,
        {
          method: "DELETE",
        },
      );

      if (response.ok) {
        showSuccess("Student removed successfully!");
        onStudentsChangeAction();
      } else {
        const error = await response.json();
        showError(error.error || "Failed to remove student");
      }
    } catch (error) {
      showError("An error occurred while removing student");
    }
  };

  const openAddStudentsModal = () => {
    setShowAddStudents(true);
    fetchAvailableStudents();
  };

  const closeAddStudentsModal = () => {
    setShowAddStudents(false);
    setSelectedStudents([]);
    setRollNumberFilter("");
  };

  // Extract branch code from roll number
  const extractBranchFromRollNumber = (rollNumber: string): string => {
    if (!rollNumber || rollNumber.length < 10) return "";

    const branchCode = rollNumber.substring(4, 7).toLowerCase(); // Extract characters 2-4
    const branchMapping: { [key: string]: string } = {
      cse: "cse",
      eci: "ece-iot",
      csd: "cse-ds",
      ece: "ece",
      csh: "cse-hcigt",
      csa: "cse-aiml",
    };

    return branchMapping[branchCode] || branchCode; // Return mapped name or original code if not found
  };

  // Extract semester from roll number based on academic session and semester type
  const extractSemFromRollNumber = (rollNumber: string): string => {
    if (!rollNumber || rollNumber.length < 4 || !academicYear || !semesterType)
      return "";

    const rollYear = rollNumber.substring(2, 4); // Extract YY from roll number (positions 2-3)
    const academicStartYear = parseInt(
      academicYear.split("-")[0].substring(2, 4),
    ); // Get 25 from "2025-2026"

    // Calculate which semester the student should be in
    for (let i = 0; i < 4; i++) {
      const year = (academicStartYear - i).toString().padStart(2, "0"); // Ensure 2 digits with leading zero

      if (year === rollYear) {
        if (semesterType === "odd") {
          // Odd semesters: 1st, 3rd, 5th, 7th
          return (i * 2 + 1).toString();
        } else if (semesterType === "even") {
          // Even semesters: 2nd, 4th, 6th, 8th
          return (i * 2 + 2).toString();
        }
      }
    }

    return ""; // Return empty string if no match found
  };

  // Categorize students based on branch and year matching
  const suggestedStudents = availableStudents.filter((student) => {
    if (!student.roll_number) return false;

    // Check branch matching
    const rollBranch = extractBranchFromRollNumber(student.roll_number);
    const branchMatches =
      rollBranch.toLowerCase() === classBranch.toLowerCase();

    // Check year matching based on academic session and semester type
    const rollSem = extractSemFromRollNumber(student.roll_number);
    const yearMatches = rollSem === classSem.toString();

    return branchMatches && yearMatches;
  });

  const otherStudents = availableStudents.filter(
    (student) => !suggestedStudents.includes(student),
  );

  // Filter all students based on roll number input
  const filteredStudents = availableStudents.filter((student) =>
    student.roll_number.toLowerCase().includes(rollNumberFilter.toLowerCase()),
  );

  // Component for rendering student item
  const StudentItem = ({ student }: { student: Student }) => (
    <label
      key={student.id}
      className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
        selectedStudents.includes(student.id)
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:bg-gray-50"
      }`}
    >
      <input
        type="checkbox"
        checked={selectedStudents.includes(student.id)}
        onChange={(e) => {
          if (e.target.checked) {
            setSelectedStudents([...selectedStudents, student.id]);
          } else {
            setSelectedStudents(
              selectedStudents.filter((id) => id !== student.id),
            );
          }
        }}
        className="mr-3 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />
      <div className="flex items-center gap-3 flex-1">
        <div className="w-6 h-6 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
          <FaUser className="text-blue-600 text-sm" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 truncate">{student.name}</p>
          <div className="flex flex-wrap text-sm">
            <span className="font-mono text-gray-700">
              {student.roll_number}
            </span>
          </div>
        </div>
      </div>
    </label>
  );

  return (
    <>
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-300">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FaUser className="text-purple-600" />
            Enrolled Students ({classStudents.length})
          </h2>
          <Button
            onClick={openAddStudentsModal}
            className="flex items-center gap-2 bg-black text-white"
          >
            <FaPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Students</span>
            <span className="sm:hidden">Students</span>
          </Button>
        </div>

        {classStudents.length === 0 ? (
          <div className="text-center py-12">
            <FaUser className="text-gray-300 text-4xl mx-auto mb-4" />
            <h3 className="text-gray-500 text-lg font-medium mb-2">
              No students enrolled
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Start by adding students to this class
            </p>
            <Button onClick={openAddStudentsModal} variant="outline">
              <FaPlus className="mr-2" />
              Add Students
            </Button>
          </div>
        ) : (
          <div className="space-y-2 max-h-[40rem] sm:max-h-[30rem] overflow-y-scroll">
            {classStudents.map((classStudent) => (
              <div
                key={classStudent.id}
                className="flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <FaUser className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {classStudent.student.roll_number}
                    </p>
                    <p className="text-sm text-gray-500">
                      {classStudent.student.name}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* <div className="text-right">
                    <p className="text-xs text-gray-500">Enrolled</p>
                    <p className="text-xs font-medium text-gray-700">
                      {new Date(classStudent.enrolled_at).toLocaleDateString()}
                    </p>
                  </div> */}
                  <Button
                    onClick={() => handleRemoveStudent(classStudent.id)}
                    variant="outline"
                    className="text-red-600 hover:bg-red-50 hover:border-red-200"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Students Modal - Improved Design */}
      <Dialog
        isOpen={showAddStudents}
        onClose={closeAddStudentsModal}
        title="Add Students to Class"
        description="Select students to enroll in this class"
        size="full"
        showActions={true}
        confirmText={
          submitting
            ? "Adding..."
            : `Add ${selectedStudents.length} Student${selectedStudents.length !== 1 ? "s" : ""}`
        }
        cancelText="Cancel"
        onConfirm={handleAddStudents}
        confirmVariant="default"
      >
        {studentsLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" color="text-blue-600" className="mr-2" />
            <span className="text-gray-600">Loading students...</span>
          </div>
        ) : availableStudents.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FaUser className="text-gray-300 text-4xl mx-auto mb-4" />
            <p className="text-gray-500">No available students found</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Selection Summary */}
            {selectedStudents.length >= 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-2">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-green-800">
                    <span className="font-semibold">
                      {selectedStudents.length}
                    </span>{" "}
                    student{selectedStudents.length !== 1 ? "s" : ""} selected
                  </div>
                  <button
                    onClick={() => setSelectedStudents([])}
                    className="text-xs text-green-700 hover:text-green-900 underline"
                  >
                    Clear selection
                  </button>
                </div>
              </div>
            )}

            {/* Suggested Students Section */}
            {classBranch && suggestedStudents.length >= 0 && (
              <div>
                <div className="flex items-center justify-start gap-3 mb-3">
                  <label className="text-sm font-medium text-gray-700">
                    Suggested Students ({suggestedStudents.length} found)
                  </label>
                  <button
                    onClick={() => {
                      const suggestedIds = suggestedStudents.map((s) => s.id);
                      const uniqueIds = [
                        ...new Set([...selectedStudents, ...suggestedIds]),
                      ];
                      setSelectedStudents(uniqueIds);
                    }}
                    className="text-xs text-blue-700 hover:text-blue-900 underline"
                  >
                    Select all suggested
                  </button>
                </div>
                <div className="space-y-3 max-h-52 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-blue-50/30">
                  {suggestedStudents.map((student) => (
                    <StudentItem key={student.id} student={student} />
                  ))}
                </div>
              </div>
            )}

            {/* All Students Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 max-sm:flex-col max-sm:items-start max-sm:gap-1 max-sm:w-full">
                  <label className="text-sm font-medium text-gray-700">
                    All Available Students ({filteredStudents.length} found)
                  </label>
                  <button
                    onClick={() => {
                      const allIds = filteredStudents.map((s) => s.id);
                      setSelectedStudents(allIds);
                    }}
                    className="text-xs text-blue-700 hover:text-blue-900 underline"
                  >
                    Select all
                  </button>
                </div>

                {/* Roll Number Filter Input */}
                <input
                  type="text"
                  placeholder="Filter (e.g., bt22cse, etc.)"
                  value={rollNumberFilter}
                  onChange={(e) => setRollNumberFilter(e.target.value)}
                  className="w-64 max-sm:w-44 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {filteredStudents.map((student) => (
                  <StudentItem key={student.id} student={student} />
                ))}
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
