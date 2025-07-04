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
  teacher_class_id: string;
  date: string;
  start_time: string;
  end_time?: string;
  status: string;
  notes?: string;
}

interface Student {
  id: string;
  name: string;
  roll_number: string;
  email: string;
}

interface Attendance {
  id?: string;
  status: "Present" | "Absent" | "Leave";
  recorded_at?: string;
}

interface StudentWithAttendance {
  student: Student;
  attendance: Attendance;
  hasChanged?: boolean;
}

interface AttendancePageProps {
  sessionId: string;
}

export default function AttendancePage({ sessionId }: AttendancePageProps) {
  const [sessionDetails, setSessionDetails] = useState<SessionDetails | null>(
    null,
  );
  const [students, setStudents] = useState<StudentWithAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { showSuccess, showError } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchStudentsAndSession();
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

  const fetchStudentsAndSession = async () => {
    try {
      const response = await fetch(
        `/api/teacher/sessions/${sessionId}/students`,
      );
      const data = await response.json();

      if (data.success) {
        setSessionDetails(data.data.session);
        setStudents(
          data.data.students.map((studentData: any) => ({
            student: studentData.student,
            attendance: studentData.attendance,
            hasChanged: false,
          })),
        );
      } else {
        showError("Failed to fetch session details");
      }
    } catch (error) {
      showError("An error occurred while fetching session details");
    } finally {
      setLoading(false);
    }
  };

  const updateAttendance = (
    studentId: string,
    status: "Present" | "Absent" | "Leave",
  ) => {
    setStudents((prev) =>
      prev.map((studentData) =>
        studentData.student.id === studentId
          ? {
              ...studentData,
              attendance: { ...studentData.attendance, status },
              hasChanged: true,
            }
          : studentData,
      ),
    );
  };

  const toggleAttendance = (studentId: string) => {
    setStudents((prev) =>
      prev.map((studentData) => {
        if (studentData.student.id === studentId) {
          const newStatus =
            studentData.attendance.status === "Present" ? "Absent" : "Present";
          return {
            ...studentData,
            attendance: { ...studentData.attendance, status: newStatus },
            hasChanged: true,
          };
        }
        return studentData;
      }),
    );
  };

  const markAllPresent = () => {
    setStudents((prev) =>
      prev.map((studentData) => ({
        ...studentData,
        attendance: { ...studentData.attendance, status: "Present" as const },
        hasChanged: true,
      })),
    );
  };

  const markAllAbsent = () => {
    setStudents((prev) =>
      prev.map((studentData) => ({
        ...studentData,
        attendance: { ...studentData.attendance, status: "Absent" as const },
        hasChanged: true,
      })),
    );
  };

  const autoSaveAttendance = async () => {
    const changedStudents = students.filter((s) => s.hasChanged);
    if (changedStudents.length === 0) return;

    setAutoSaving(true);
    try {
      // Save each changed student individually using the new API
      const promises = changedStudents.map(async (studentData) => {
        const response = await fetch(
          `/api/teacher/sessions/${sessionId}/students`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              student_id: studentData.student.id,
              attendance_status: studentData.attendance.status,
            }),
          },
        );
        return response;
      });

      const responses = await Promise.all(promises);
      const allSuccessful = responses.every((response) => response.ok);

      if (allSuccessful) {
        setStudents((prev) =>
          prev.map((studentData) => ({ ...studentData, hasChanged: false })),
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
      // Save each student individually using the new API
      const promises = students.map(async (studentData) => {
        const response = await fetch(
          `/api/teacher/sessions/${sessionId}/students`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              student_id: studentData.student.id,
              attendance_status: studentData.attendance.status,
            }),
          },
        );
        return response;
      });

      const responses = await Promise.all(promises);
      const allSuccessful = responses.every((response) => response.ok);

      if (allSuccessful) {
        showSuccess("Attendance saved successfully!");
        setStudents((prev) =>
          prev.map((studentData) => ({ ...studentData, hasChanged: false })),
        );
        setLastSaved(new Date());
        fetchStudentsAndSession(); // Refresh to get recorded_at timestamps
      } else {
        showError("Failed to save some attendance records");
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
    (s) => s.attendance.status === "Present",
  ).length;
  const absentCount = students.filter(
    (s) => s.attendance.status === "Absent",
  ).length;
  const leaveCount = students.filter(
    (s) => s.attendance.status === "Leave",
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
                  Session Attendance
                </h1>
                <p className="text-gray-600">Session ID: {sessionId}</p>
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
            {students.map((studentData) => (
              <div
                key={studentData.student.id}
                onClick={() => toggleAttendance(studentData.student.id)}
                className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  studentData.attendance.status === "Present"
                    ? "border-green-500 bg-green-50 hover:bg-green-100"
                    : "border-red-500 bg-red-50 hover:bg-red-100"
                } ${studentData.hasChanged ? "ring-2 ring-orange-300" : ""}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      studentData.attendance.status === "Present"
                        ? "bg-green-100"
                        : "bg-red-100"
                    }`}
                  >
                    {studentData.attendance.status === "Present" ? (
                      <FaCheck className="text-green-600" />
                    ) : (
                      <FaTimes className="text-red-600" />
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      studentData.attendance.status === "Present"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {studentData.attendance.status}
                  </span>
                </div>

                <div>
                  <p className="font-medium text-gray-900 mb-1">
                    {studentData.student.name}
                  </p>
                  <p className="text-sm text-gray-500 mb-1">
                    {studentData.student.roll_number}
                  </p>
                  <p className="text-xs text-gray-400">
                    {studentData.student.email}
                  </p>
                  {studentData.attendance.recorded_at && (
                    <p className="text-xs text-gray-400 mt-2">
                      Recorded:{" "}
                      {new Date(
                        studentData.attendance.recorded_at,
                      ).toLocaleTimeString()}
                    </p>
                  )}
                </div>

                {/* Additional status buttons */}
                <div className="mt-3 flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateAttendance(studentData.student.id, "Present");
                    }}
                    className={`flex-1 py-1 px-2 text-xs rounded ${
                      studentData.attendance.status === "Present"
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-600 hover:bg-green-100"
                    }`}
                  >
                    Present
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateAttendance(studentData.student.id, "Absent");
                    }}
                    className={`flex-1 py-1 px-2 text-xs rounded ${
                      studentData.attendance.status === "Absent"
                        ? "bg-red-600 text-white"
                        : "bg-gray-200 text-gray-600 hover:bg-red-100"
                    }`}
                  >
                    Absent
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateAttendance(studentData.student.id, "Leave");
                    }}
                    className={`flex-1 py-1 px-2 text-xs rounded ${
                      studentData.attendance.status === "Leave"
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
