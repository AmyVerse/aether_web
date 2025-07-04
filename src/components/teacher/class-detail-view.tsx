"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaPlus,
  FaSpinner,
  FaTimes,
  FaUser,
  FaUsers,
} from "react-icons/fa";

interface ClassDetails {
  id: string;
  subject_name: string;
  subject_code: string;
  branch: string;
  section: string;
  day: string;
  time_slot: string;
  room_number: string;
  academic_year: string;
  semester_type: string;
  notes?: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  roll_number: string;
  batch_year: number;
}

interface ClassStudent {
  id: string;
  student: Student;
  enrolled_at: string;
  is_active: boolean;
  notes?: string;
}

interface ClassSession {
  id: string;
  date: string;
  start_time: string;
  end_time?: string;
  status: "Scheduled" | "Completed" | "Cancelled" | "Rescheduled";
  notes?: string;
  created_at: string;
}

interface ClassDetailViewProps {
  classId: string;
  onBackAction?: () => void;
}

export default function ClassDetailView({
  classId,
  onBackAction,
}: ClassDetailViewProps) {
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [classStudents, setClassStudents] = useState<ClassStudent[]>([]);
  const [classSessions, setClassSessions] = useState<ClassSession[]>([]);
  const [availableStudents, setAvailableStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [showAddStudents, setShowAddStudents] = useState(false);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const { showSuccess, showError } = useToast();

  const handleBack = () => {
    if (onBackAction) {
      onBackAction();
    } else {
      window.location.href = "/dashboard";
    }
  };

  useEffect(() => {
    fetchClassDetails();
    fetchClassStudents();
    fetchClassSessions();
  }, [classId]);

  const fetchClassDetails = async () => {
    try {
      const response = await fetch(`/api/teacher/classes/${classId}`);
      const data = await response.json();

      if (data.success) {
        setClassDetails(data.data);
      } else {
        showError("Failed to fetch class details");
      }
    } catch (error) {
      showError("An error occurred while fetching class details");
    } finally {
      setLoading(false);
    }
  };
  const fetchClassStudents = async () => {
    try {
      const response = await fetch(`/api/teacher/classes/${classId}/students`);
      const data = await response.json();

      if (data.success) {
        setClassStudents(data.data);
      } else {
        showError("Failed to fetch class students");
      }
    } catch (error) {
      showError("An error occurred while fetching students");
    }
  };

  const fetchClassSessions = async () => {
    try {
      const response = await fetch(`/api/teacher/classes/${classId}/sessions`);
      const data = await response.json();

      if (data.success) {
        setClassSessions(data.data);
      } else {
        showError("Failed to fetch class sessions");
      }
    } catch (error) {
      showError("An error occurred while fetching sessions");
    }
  };

  const fetchAvailableStudents = async () => {
    setStudentsLoading(true);
    try {
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
        fetchClassStudents();
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
        fetchClassStudents();
      } else {
        const error = await response.json();
        showError(error.error || "Failed to remove student");
      }
    } catch (error) {
      showError("An error occurred while removing student");
    }
  };

  const handleCreateSession = async () => {
    const today = new Date().toISOString().split("T")[0];
    const currentTime = new Date().toTimeString().split(" ")[0].substring(0, 5);

    try {
      const response = await fetch(`/api/teacher/classes/${classId}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: today,
          start_time: currentTime,
          notes: "Session created from class detail view",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess("Session created successfully!");
        // Redirect to attendance page
        window.location.href = `/class/${data.data.id}`;
      } else {
        const error = await response.json();
        showError(error.error || "Failed to create session");
      }
    } catch (error) {
      showError("An error occurred while creating session");
    }
  };

  const handleViewSession = (sessionId: string) => {
    window.location.href = `/dashboard/class/${classId}/session/${sessionId}`;
  };

  const openAddStudentsModal = () => {
    setShowAddStudents(true);
    fetchAvailableStudents();
  };

  const closeAddStudentsModal = () => {
    setShowAddStudents(false);
    setSelectedStudents([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FaSpinner className="animate-spin text-blue-700 text-xl mr-2" />
        <span className="text-gray-600">Loading class details...</span>
      </div>
    );
  }

  if (!classDetails) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Class not found</p>
        <Button onClick={handleBack} variant="outline" className="mt-4">
          <FaArrowLeft className="mr-2" />
          Back to Classes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={handleBack} variant="outline" size="sm">
            <FaArrowLeft className="mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {classDetails.subject_name}
            </h1>
            <p className="text-gray-600">
              {classDetails.subject_code} • {classDetails.branch} - Section{" "}
              {classDetails.section}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={openAddStudentsModal}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <FaPlus className="mr-2" />
            Add Students
          </Button>
          <Button
            onClick={handleCreateSession}
            className="bg-blue-900 hover:bg-blue-700 text-white"
          >
            Create Session
          </Button>
        </div>
      </div>

      {/* Class Info */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Class Information
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <FaCalendarAlt className="text-blue-600" />
            <div>
              <p className="text-sm text-gray-500">Day</p>
              <p className="font-medium">{classDetails.day}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FaClock className="text-green-600" />
            <div>
              <p className="text-sm text-gray-500">Time</p>
              <p className="font-medium">{classDetails.time_slot}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FaMapMarkerAlt className="text-red-600" />
            <div>
              <p className="text-sm text-gray-500">Room</p>
              <p className="font-medium">{classDetails.room_number}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <FaUsers className="text-purple-600" />
            <div>
              <p className="text-sm text-gray-500">Students</p>
              <p className="font-medium">{classStudents.length}</p>
            </div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Academic Year</p>
              <p className="font-medium">{classDetails.academic_year}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Semester</p>
              <p className="font-medium">
                {classDetails.semester_type.charAt(0).toUpperCase() +
                  classDetails.semester_type.slice(1)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Enrolled Students ({classStudents.length})
          </h2>
        </div>

        {classStudents.length === 0 ? (
          <div className="text-center py-8">
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
          <div className="space-y-3">
            {classStudents.map((classStudent) => (
              <div
                key={classStudent.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
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
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    Enrolled{" "}
                    {new Date(classStudent.enrolled_at).toLocaleDateString()}
                  </span>
                  <Button
                    onClick={() => handleRemoveStudent(classStudent.id)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sessions List */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Class Sessions ({classSessions.length})
          </h2>
          <Button
            onClick={handleCreateSession}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <FaPlus className="mr-2" />
            Create New Session
          </Button>
        </div>

        {classSessions.length === 0 ? (
          <div className="text-center py-8">
            <FaCalendarAlt className="text-gray-300 text-4xl mx-auto mb-4" />
            <h3 className="text-gray-500 text-lg font-medium mb-2">
              No sessions created
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              Create your first session to start taking attendance
            </p>
            <Button onClick={handleCreateSession} variant="outline">
              <FaPlus className="mr-2" />
              Create Session
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {classSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => handleViewSession(session.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FaCalendarAlt className="text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Session on {new Date(session.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {session.start_time}{" "}
                      {session.end_time && `- ${session.end_time}`} •{" "}
                      {session.status}
                    </p>
                    {session.notes && (
                      <p className="text-xs text-gray-400 mt-1">
                        {session.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      session.status === "Scheduled"
                        ? "bg-blue-100 text-blue-800"
                        : session.status === "Completed"
                          ? "bg-green-100 text-green-800"
                          : session.status === "Cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {session.status}
                  </span>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewSession(session.id);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Take Attendance
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Students Modal */}
      {showAddStudents && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Add Students
                </h2>
                <p className="text-gray-600 text-sm">
                  Select students to add to this class
                </p>
              </div>
              <button
                onClick={closeAddStudentsModal}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100"
              >
                <FaTimes />
              </button>
            </div>

            <div className="p-6">
              {studentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <FaSpinner className="animate-spin text-blue-600 text-xl mr-2" />
                  <span className="text-gray-600">Loading students...</span>
                </div>
              ) : availableStudents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No available students found</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {availableStudents.map((student) => (
                    <label
                      key={student.id}
                      className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedStudents([
                              ...selectedStudents,
                              student.id,
                            ]);
                          } else {
                            setSelectedStudents(
                              selectedStudents.filter(
                                (id) => id !== student.id,
                              ),
                            );
                          }
                        }}
                        className="mr-3"
                      />
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <FaUser className="text-gray-600 text-sm" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {student.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {student.roll_number} • {student.email}
                          </p>
                        </div>
                      </div>
                    </label>
                  ))}
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
                    <FaSpinner className="animate-spin mr-2" />
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
    </div>
  );
}
