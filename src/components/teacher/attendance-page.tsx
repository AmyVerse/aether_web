"use client";

import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaArrowLeft,
  FaCheck,
  FaClock,
  FaSave,
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center z-0">
        <div className="flex items-center gap-3">
          <LoadingSpinner size="lg" color="text-blue-600" />
          <span className="text-gray-600">Loading session details...</span>
        </div>
      </div>
    );
  }

  if (!sessionDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center z-0">
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
    <div className="min-h-screen bg-gray-50 z-0">
      <div className="max-w-6xl mx-auto p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        {/* Back Button - Above everything */}
        <div className="flex items-center">
          <Button
            onClick={goBack}
            variant="outline"
            className="flex items-center gap-2 px-3 py-2 text-sm border-gray-200/60 hover:border-gray-300/80 hover:bg-gray-100/80"
          >
            <FaArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Classes</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>

        {/* Header */}
        <div className="bg-white/95 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100/60 z-0">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Session Attendance
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FaClock className="text-blue-600 flex-shrink-0" />
                  <span>
                    {new Date(sessionDetails.date).toLocaleDateString()} at{" "}
                    {sessionDetails.start_time}
                  </span>
                </div>
                <div className="hidden sm:block text-gray-300">•</div>
                <div className="font-mono text-xs sm:text-sm bg-gray-100/80 px-2 py-1 rounded-md">
                  Session ID: {sessionId}
                </div>
              </div>
            </div>

            {/* Status indicators */}
            <div className="flex flex-col items-end gap-2">
              {lastSaved && (
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <FaCheck className="w-3 h-3" />
                  Last saved: {lastSaved.toLocaleTimeString()}
                </p>
              )}
              {autoSaving && (
                <p className="text-xs text-blue-600 flex items-center gap-2">
                  <LoadingSpinner size="sm" />
                  Auto-saving...
                </p>
              )}
              {hasChanges && (
                <span className="text-xs text-orange-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                  Unsaved changes
                </span>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-green-50/80 border border-green-200/60 p-3 sm:p-4 rounded-xl">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FaUserCheck className="text-green-600 w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-green-700 font-medium">
                    Present
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-green-600">
                    {presentCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50/80 border border-red-200/60 p-3 sm:p-4 rounded-xl">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <FaUserTimes className="text-red-600 w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-red-700 font-medium">
                    Absent
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-red-600">
                    {absentCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50/80 border border-orange-200/60 p-3 sm:p-4 rounded-xl">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <FaUser className="text-orange-600 w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-orange-700 font-medium">
                    On Leave
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-orange-600">
                    {leaveCount}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50/80 border border-blue-200/60 p-3 sm:p-4 rounded-xl">
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FaUser className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-blue-700 font-medium">
                    Total
                  </p>
                  <p className="text-lg sm:text-xl font-bold text-blue-600">
                    {students.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/95 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100/60 z-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Quick Actions
            </h2>
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <Button
              onClick={markAllPresent}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 px-4 py-2.5 text-sm font-medium"
            >
              <FaCheck className="w-4 h-4" />
              <span>Mark All Present</span>
            </Button>
            <Button
              onClick={markAllAbsent}
              className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2 px-4 py-2.5 text-sm font-medium"
            >
              <FaTimes className="w-4 h-4" />
              <span>Mark All Absent</span>
            </Button>
            <div className="sm:ml-auto">
              <Button
                onClick={saveAttendance}
                disabled={autoSaving || !hasChanges}
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 px-4 py-2.5 text-sm font-medium w-full sm:w-auto"
              >
                {autoSaving ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FaSave className="w-4 h-4" />
                    <span>Save Attendance</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Students Grid */}
        <div className="bg-white/95 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100/60 z-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Student Attendance
            </h2>
            <div className="text-sm text-gray-600 bg-gray-100/80 px-3 py-1.5 rounded-lg">
              {students.length} students
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {students.map((studentData) => (
              <div
                key={studentData.student.id}
                onClick={() => toggleAttendance(studentData.student.id)}
                className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 hover:shadow-md ${
                  studentData.attendance.status === "Present"
                    ? "border-green-300/60 bg-green-50/80 hover:bg-green-100/80"
                    : studentData.attendance.status === "Leave"
                      ? "border-orange-300/60 bg-orange-50/80 hover:bg-orange-100/80"
                      : "border-red-300/60 bg-red-50/80 hover:bg-red-100/80"
                } ${studentData.hasChanged ? "ring-2 ring-blue-300/60 shadow-lg" : ""}`}
              >
                {/* Status indicator */}
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${
                      studentData.attendance.status === "Present"
                        ? "bg-green-100/80 border border-green-200/60"
                        : studentData.attendance.status === "Leave"
                          ? "bg-orange-100/80 border border-orange-200/60"
                          : "bg-red-100/80 border border-red-200/60"
                    }`}
                  >
                    {studentData.attendance.status === "Present" ? (
                      <FaCheck className="text-green-600 w-4 h-4" />
                    ) : studentData.attendance.status === "Leave" ? (
                      <FaUser className="text-orange-600 w-4 h-4" />
                    ) : (
                      <FaTimes className="text-red-600 w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${
                      studentData.attendance.status === "Present"
                        ? "bg-green-100/80 text-green-800 border-green-200/60"
                        : studentData.attendance.status === "Leave"
                          ? "bg-orange-100/80 text-orange-800 border-orange-200/60"
                          : "bg-red-100/80 text-red-800 border-red-200/60"
                    }`}
                  >
                    {studentData.attendance.status}
                  </span>
                </div>

                {/* Student info */}
                <div className="space-y-1 mb-3">
                  <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                    {studentData.student.name}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 font-mono bg-gray-100/60 px-2 py-0.5 rounded">
                    {studentData.student.roll_number}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {studentData.student.email}
                  </p>
                  {studentData.attendance.recorded_at && (
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <FaClock className="w-3 h-3" />
                      {new Date(
                        studentData.attendance.recorded_at,
                      ).toLocaleTimeString()}
                    </p>
                  )}
                </div>

                {/* Status buttons */}
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateAttendance(studentData.student.id, "Present");
                    }}
                    className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                      studentData.attendance.status === "Present"
                        ? "bg-green-600 text-white shadow-sm"
                        : "bg-gray-200/80 text-gray-600 hover:bg-green-100/80 border border-green-200/40"
                    }`}
                  >
                    Present
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateAttendance(studentData.student.id, "Absent");
                    }}
                    className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                      studentData.attendance.status === "Absent"
                        ? "bg-red-600 text-white shadow-sm"
                        : "bg-gray-200/80 text-gray-600 hover:bg-red-100/80 border border-red-200/40"
                    }`}
                  >
                    Absent
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateAttendance(studentData.student.id, "Leave");
                    }}
                    className={`py-1.5 px-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                      studentData.attendance.status === "Leave"
                        ? "bg-orange-600 text-white shadow-sm"
                        : "bg-gray-200/80 text-gray-600 hover:bg-orange-100/80 border border-orange-200/40"
                    }`}
                  >
                    Leave
                  </button>
                </div>

                {/* Change indicator */}
                {studentData.hasChanged && (
                  <div className="absolute top-2 right-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
