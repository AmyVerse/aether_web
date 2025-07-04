"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaCheck,
  FaClock,
  FaSave,
  FaSpinner,
  FaTimes,
  FaUser,
  FaUserCheck,
  FaUserTimes,
} from "react-icons/fa";

interface SessionDetails {
  id: string;
  date: string;
  start_time: string;
  end_time?: string;
  status: string;
  notes?: string;
  class_details: {
    subject_name: string;
    subject_code: string;
    branch: string;
    section: string;
  };
}

interface StudentAttendance {
  student_id: string;
  student_name: string;
  roll_number: string;
  email: string;
  attendance_status: "Present" | "Absent" | "Leave";
  recorded_at?: string;
  hasChanged?: boolean;
}

interface AttendancePageProps {
  sessionId: string;
}

export default function AttendancePage({ sessionId }: AttendancePageProps) {
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(
    null,
  );
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { showSuccess, showError } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchSessionDetails();
    fetchStudents();
  }, [sessionId]);

  // Auto-save every 30 seconds if there are changes
  useEffect(() => {
    const hasChanges = students.some((s) => s.hasChanged);
    if (hasChanges) {
      const interval = setInterval(() => {
        autoSaveAttendance();
      }, 30000); // 30 seconds

      return () => clearInterval(interval);
    }
  }, [students]);

  const fetchSessionDetails = async () => {
    try {
      const response = await fetch(`/api/teacher/sessions/${sessionId}`);
      const data = await response.json();

      if (data.success) {
        setSessionDetails(data.session);
      } else {
        showError("Failed to fetch session details");
      }
    } catch (error) {
      showError("An error occurred while fetching session details");
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch(
        `/api/teacher/sessions/${sessionId}/students`,
      );
      const data = await response.json();

      if (data.success) {
        setStudents(
          data.students.map((student: StudentAttendance) => ({
            ...student,
            hasChanged: false,
          })),
        );
      } else {
        showError("Failed to fetch students");
      }
    } catch (error) {
      showError("An error occurred while fetching students");
    } finally {
      setLoading(false);
    }
  };

  const updateAttendance = (
    studentId: string,
    status: "Present" | "Absent" | "Leave",
  ) => {
    setStudents((prev) =>
      prev.map((student) =>
        student.student_id === studentId
          ? { ...student, attendance_status: status, hasChanged: true }
          : student,
      ),
    );
  };

  const toggleAttendance = (studentId: string) => {
    setStudents((prev) =>
      prev.map((student) => {
        if (student.student_id === studentId) {
          const newStatus =
            student.attendance_status === "Present" ? "Absent" : "Present";
          return { ...student, attendance_status: newStatus, hasChanged: true };
        }
        return student;
      }),
    );
  };

  const markAllPresent = () => {
    setStudents((prev) =>
      prev.map((student) => ({
        ...student,
        attendance_status: "Present" as const,
        hasChanged: true,
      })),
    );
  };

  const markAllAbsent = () => {
    setStudents((prev) =>
      prev.map((student) => ({
        ...student,
        attendance_status: "Absent" as const,
        hasChanged: true,
      })),
    );
  };

  const autoSaveAttendance = async () => {
    const changedStudents = students.filter((s) => s.hasChanged);
    if (changedStudents.length === 0) return;

    setAutoSaving(true);
    try {
      const response = await fetch(`/api/attendance/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendance: students.map((s) => ({
            student_id: s.student_id,
            attendance_status: s.attendance_status,
          })),
        }),
      });

      if (response.ok) {
        setStudents((prev) =>
          prev.map((student) => ({ ...student, hasChanged: false })),
        );
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error("Auto-save failed:", error);
    } finally {
      setAutoSaving(false);
    }
  };

  const saveAttendance = async () => {
    setAutoSaving(true);
    try {
      const response = await fetch(`/api/attendance/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendance: students.map((s) => ({
            student_id: s.student_id,
            attendance_status: s.attendance_status,
          })),
        }),
      });

      if (response.ok) {
        showSuccess("Attendance saved successfully!");
        setStudents((prev) =>
          prev.map((student) => ({ ...student, hasChanged: false })),
        );
        setLastSaved(new Date());
        fetchStudents(); // Refresh to get recorded_at timestamps
      } else {
        const error = await response.json();
        showError(error.error || "Failed to save attendance");
      }
    } catch (error) {
      showError("An error occurred while saving attendance");
    } finally {
      setAutoSaving(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <FaSpinner className="animate-spin text-blue-600 text-xl" />
          <span className="text-gray-600">Loading session details...</span>
        </div>
      </div>
    );
  }

  if (!sessionDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Session not found</p>
          <Button onClick={goBack} variant="outline">
            <FaArrowLeft className="mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const presentCount = students.filter(
    (s) => s.attendance_status === "Present",
  ).length;
  const absentCount = students.filter(
    (s) => s.attendance_status === "Absent",
  ).length;
  const leaveCount = students.filter(
    (s) => s.attendance_status === "Leave",
  ).length;
  const hasChanges = students.some((s) => s.hasChanged);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button onClick={goBack} variant="outline" size="sm">
                <FaArrowLeft className="mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {sessionDetails.class_details.subject_name}
                </h1>
                <p className="text-gray-600">
                  {sessionDetails.class_details.subject_code} •{" "}
                  {sessionDetails.class_details.branch} - Section{" "}
                  {sessionDetails.class_details.section}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Session ID</p>
              <p className="font-mono text-lg font-medium">{sessionId}</p>
              {lastSaved && (
                <p className="text-xs text-green-600">
                  Last saved: {lastSaved.toLocaleTimeString()}
                </p>
              )}
              {autoSaving && (
                <p className="text-xs text-blue-600 flex items-center gap-1">
                  <FaSpinner className="animate-spin" />
                  Auto-saving...
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <FaClock className="text-blue-600" />
              <div>
                <p className="text-sm text-gray-500">Date & Time</p>
                <p className="font-medium">
                  {new Date(sessionDetails.date).toLocaleDateString()} at{" "}
                  {sessionDetails.start_time}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaUserCheck className="text-green-600" />
              <div>
                <p className="text-sm text-gray-500">Present</p>
                <p className="font-medium text-green-600">{presentCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaUserTimes className="text-red-600" />
              <div>
                <p className="text-sm text-gray-500">Absent</p>
                <p className="font-medium text-red-600">{absentCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaUser className="text-orange-600" />
              <div>
                <p className="text-sm text-gray-500">On Leave</p>
                <p className="font-medium text-orange-600">{leaveCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Quick Actions
            </h2>
            {hasChanges && (
              <span className="text-sm text-orange-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                Unsaved changes
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={markAllPresent}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <FaCheck className="mr-2" />
              Mark All Present
            </Button>
            <Button
              onClick={markAllAbsent}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <FaTimes className="mr-2" />
              Mark All Absent
            </Button>
            <Button
              onClick={saveAttendance}
              disabled={autoSaving || !hasChanges}
              className="bg-blue-600 hover:bg-blue-700 text-white ml-auto"
            >
              {autoSaving ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  Save Attendance
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Students Grid */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            Student Attendance ({students.length} students)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <div
                key={student.student_id}
                onClick={() => toggleAttendance(student.student_id)}
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  student.attendance_status === "Present"
                    ? "border-green-500 bg-green-50 hover:bg-green-100"
                    : "border-red-500 bg-red-50 hover:bg-red-100"
                } ${student.hasChanged ? "ring-2 ring-orange-300" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      student.attendance_status === "Present"
                        ? "bg-green-100"
                        : "bg-red-100"
                    }`}
                  >
                    {student.attendance_status === "Present" ? (
                      <FaCheck className="text-green-600" />
                    ) : (
                      <FaTimes className="text-red-600" />
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      student.attendance_status === "Present"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {student.attendance_status}
                  </span>
                </div>

                <div>
                  <p className="font-medium text-gray-900 mb-1">
                    {student.student_name}
                  </p>
                  <p className="text-sm text-gray-500 mb-1">
                    {student.roll_number}
                  </p>
                  <p className="text-xs text-gray-400">{student.email}</p>
                  {student.recorded_at && (
                    <p className="text-xs text-gray-400 mt-2">
                      Recorded:{" "}
                      {new Date(student.recorded_at).toLocaleTimeString()}
                    </p>
                  )}
                </div>

                {/* Additional status buttons */}
                <div className="mt-3 flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateAttendance(student.student_id, "Present");
                    }}
                    className={`flex-1 py-1 px-2 text-xs rounded ${
                      student.attendance_status === "Present"
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-600 hover:bg-green-100"
                    }`}
                  >
                    Present
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateAttendance(student.student_id, "Absent");
                    }}
                    className={`flex-1 py-1 px-2 text-xs rounded ${
                      student.attendance_status === "Absent"
                        ? "bg-red-600 text-white"
                        : "bg-gray-200 text-gray-600 hover:bg-red-100"
                    }`}
                  >
                    Absent
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateAttendance(student.student_id, "Leave");
                    }}
                    className={`flex-1 py-1 px-2 text-xs rounded ${
                      student.attendance_status === "Leave"
                        ? "bg-orange-600 text-white"
                        : "bg-gray-200 text-gray-600 hover:bg-orange-100"
                    }`}
                  >
                    Leave
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
