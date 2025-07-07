"use client";

import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/useToast";
import { useState } from "react";
import { FaPlus, FaTimes, FaUser } from "react-icons/fa";

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
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [showAddStudents, setShowAddStudents] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { showSuccess, showError } = useToast();

  const fetchAvailableStudents = async () => {
    setStudentsLoading(true);
    try {
      // Fetch class details to get branch information
      const classResponse = await fetch(`/api/teacher/classes/${classId}`);
      const classData = await classResponse.json();

      if (classData.success) {
        setClassBranch(classData.data.branch || "");
      }

      // Fetch available students
      const response = await fetch(
        `/api/teacher/classes/${classId}/available-students`,
      );
      const data = await response.json();

      if (data.success) {
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
  };

  // Categorize students
  const suggestedStudents = availableStudents.filter(
    (student) =>
      student.branch &&
      student.branch.toLowerCase() === classBranch.toLowerCase(),
  );

  const otherStudents = availableStudents.filter(
    (student) =>
      !student.branch ||
      student.branch.toLowerCase() !== classBranch.toLowerCase(),
  );

  // Component for rendering student item
  const StudentItem = ({ student }: { student: Student }) => (
    <label
      key={student.id}
      className="flex items-center p-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
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
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
          <FaUser className="text-blue-600 text-sm" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{student.name}</p>
          <p className="text-sm text-gray-500">
            {student.roll_number} • {student.email}
          </p>
          <p className="text-xs text-gray-400">
            Batch: {student.batch_year}
            {student.branch && ` • ${student.branch}`}
          </p>
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
            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
          >
            <FaPlus className="w-4 h-4" />
            Add Students
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
          <div className="space-y-2">
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
                      {classStudent.student.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {classStudent.student.roll_number} •{" "}
                      {classStudent.student.email}
                    </p>
                    <p className="text-xs text-gray-400">
                      Batch: {classStudent.student.batch_year}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Enrolled</p>
                    <p className="text-xs font-medium text-gray-700">
                      {new Date(classStudent.enrolled_at).toLocaleDateString()}
                    </p>
                  </div>
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

      {/* Add Students Modal */}
      {showAddStudents && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Add Students
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Select students to add to this class
                </p>
              </div>
              <button
                onClick={closeAddStudentsModal}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {studentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <LoadingSpinner
                    size="lg"
                    color="text-blue-600"
                    className="mr-2"
                  />
                  <span className="text-gray-600">Loading students...</span>
                </div>
              ) : availableStudents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No available students found</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Suggested Students Section */}
                  {classBranch && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        Suggested Students ({classBranch})
                        <span className="text-xs text-gray-500 font-normal">
                          ({suggestedStudents.length})
                        </span>
                      </h3>
                      {suggestedStudents.length === 0 ? (
                        <div className="text-center py-4 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-500">
                            No students found from {classBranch} branch
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {suggestedStudents.map((student) => (
                            <StudentItem key={student.id} student={student} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* All Students Section */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                      All Students
                      <span className="text-xs text-gray-500 font-normal">
                        ({availableStudents.length})
                      </span>
                    </h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {availableStudents.map((student) => (
                        <StudentItem key={student.id} student={student} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={closeAddStudentsModal}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddStudents}
                disabled={selectedStudents.length === 0 || submitting}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Adding...
                  </>
                ) : (
                  `Add ${selectedStudents.length} Student${selectedStudents.length !== 1 ? "s" : ""}`
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
