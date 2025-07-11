"use client";

import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useSessionsCache } from "@/hooks/useDataCache";
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

  // Cache hooks
  const { fetchSessionStudents } = useSessionsCache();

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
      const data = (await fetchSessionStudents(sessionId)) as any;

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
        // For any non-success response, assume session exists but no students
        // Create a minimal session object so we can show the "add students" UI
        setSessionDetails({
          id: sessionId,
          teacher_class_id: "", // We'll get this from the class page navigation
          date: new Date().toISOString().split("T")[0], // Today's date as fallback
          start_time: "00:00",
          status: "Scheduled",
        });
        setStudents([]); // Empty students array - will show "add students" UI
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
      // Send a single PATCH request with all changed students
      const response = await fetch(
        `/api/teacher/sessions/${sessionId}/students`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            updates: changedStudents.map((studentData) => ({
              student_id: studentData.student.id,
              attendance_status: studentData.attendance.status,
            })),
          }),
        },
      );

      if (response.ok) {
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
      // Collect all students to update
      const changedStudents = students.map((studentData) => ({
        student_id: studentData.student.id,
        attendance_status: studentData.attendance.status,
      }));

      // Send a single PATCH request with all students
      const response = await fetch(
        `/api/teacher/sessions/${sessionId}/students`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates: changedStudents }),
        },
      );

      if (response.ok) {
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
    // Try to extract classId from the current URL path
    // URL format: /dashboard/class/[classId]/session/[sessionId]
    const pathParts = window.location.pathname.split("/");
    const classIdIndex = pathParts.indexOf("class") + 1;
    const classId = pathParts[classIdIndex];

    if (classId && classId !== "session") {
      router.push(`/dashboard/class/${classId}`);
    } else {
      router.push(`/dashboard/class`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <LoadingSpinner size="lg" color="text-blue-600" />
          <span className="text-gray-600">Loading session details...</span>
        </div>
      </div>
    );
  }

  // If no session details, show error
  if (!sessionDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Failed to load session details</p>
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
      {/* Header Section - Matching Class Description Style */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 lg:px-8 py-4">
        {/* Back to Classes button on its own line */}
        <div className="mb-2">
          <button
            onClick={goBack}
            className="flex items-center bg-gray-100/50 gap-2 px-3 py-2 text-sm border border-gray-300 hover:border-gray-400 hover:bg-gray-200/50 rounded-lg transition-colors"
          >
            <FaArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Classes</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <h1 className="text-3xl font-semibold font-[poppins] text-gray-900">
            Session Attendance
          </h1>
          <div className="flex items-center gap-2">
            {/* Status indicators */}
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
            <Button
              onClick={saveAttendance}
              disabled={autoSaving || !hasChanges}
              variant="primary"
              className="px-3 py-1.5 text-sm ml-2"
            >
              {autoSaving ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FaSave className="w-3 h-3 mr-1" />
                  <span>Save</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Session Labels - Matching class description style */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="font-mono bg-gray-100/80 px-3 py-1.5 rounded-md font-medium text-sm">
            Session ID: {sessionId}
          </span>
          <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md font-medium text-sm">
            {new Date(sessionDetails.date).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <span className="bg-violet-50 text-violet-700 px-3 py-1.5 rounded-md font-medium text-sm flex items-center gap-1">
            <FaClock className="w-3 h-3" />
            {sessionDetails.start_time}
          </span>
          <span
            className={`px-3 py-1.5 rounded-md font-medium text-sm ${
              sessionDetails.status === "Completed"
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {sessionDetails.status}
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-3 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
        <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
          {/* Stats Grid - Minimal */}
          <div className="bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-sm border border-gray-100/60">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex sm:flex-row">
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center bg-green-50 p-2 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {presentCount}
                  </p>
                  <p className="text-xs text-green-700">Present</p>
                </div>
                <div className="text-center bg-red-50 p-2 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">
                    {absentCount}
                  </p>
                  <p className="text-xs text-red-700">Absent</p>
                </div>
                <div className="text-center bg-orange-50 p-2 rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">
                    {leaveCount}
                  </p>
                  <p className="text-xs text-orange-700">Leave</p>
                </div>
                <div className="text-center bg-blue-50 p-2 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {students.length}
                  </p>
                  <p className="text-xs text-blue-700">Total</p>
                </div>
              </div>

              {/* Actions on the right */}
              <div className="flex items-center gap-2">
                <Button
                  onClick={markAllPresent}
                  variant="outline"
                  className="text-sm bg-green-600 border-green-600 hover:bg-green-600/20"
                >
                  All Present
                </Button>
                <Button
                  onClick={markAllAbsent}
                  variant="outline"
                  className="text-sm bg-red-600 border-red-600 hover:bg-red-700/20"
                >
                  All Absent
                </Button>
              </div>
            </div>
          </div>

          {/* Students Grid */}
          <div className="bg-white/95 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-sm border border-gray-100/60">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                Student Attendance
              </h2>
              <div className="text-sm text-gray-600 bg-gray-100/80 px-3 py-1.5 rounded-lg">
                {students.length} students
              </div>
            </div>

            {/* Responsive Grid Layout for Students */}
            <div className="max-w-6xl mx-auto">
              {students.length === 0 ? (
                <div className="text-center py-12">
                  <FaUser className="text-gray-300 text-4xl mx-auto mb-4" />
                  <h3 className="text-gray-500 text-lg font-medium mb-2">
                    No students enrolled
                  </h3>
                  <p className="text-gray-400 text-sm mb-6">
                    This class doesn't have any students enrolled yet. Add
                    students to the class to start taking attendance.
                  </p>
                  <button
                    onClick={() => {
                      // Extract classId from current URL path
                      // URL format: /dashboard/class/[classId]/session/[sessionId]
                      const pathParts = window.location.pathname.split("/");
                      const classIdIndex = pathParts.indexOf("class") + 1;
                      const classId = pathParts[classIdIndex];

                      if (classId && classId !== "session") {
                        window.location.href = `/dashboard/class/${classId}`;
                      } else {
                        window.location.href = `/dashboard/class`;
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Go to Class to Add Students
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(() => {
                    // Sort students by roll number for consistent ordering
                    const sortedStudents = [...students].sort((a, b) =>
                      a.student.roll_number.localeCompare(
                        b.student.roll_number,
                      ),
                    );

                    const midPoint = Math.ceil(sortedStudents.length / 2);
                    const leftColumn = sortedStudents.slice(0, midPoint);
                    const rightColumn = sortedStudents.slice(midPoint);

                    return (
                      <>
                        {/* Left Column */}
                        <div className="space-y-2.5">
                          {leftColumn.map((studentData) => (
                            <div
                              key={studentData.student.id}
                              onClick={() =>
                                toggleAttendance(studentData.student.id)
                              }
                              className={`relative flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                                studentData.attendance.status === "Present"
                                  ? "border-green-300/60 bg-green-50/80 hover:bg-green-100/80"
                                  : studentData.attendance.status === "Leave"
                                    ? "border-orange-300/60 bg-orange-50/80 hover:bg-orange-100/80"
                                    : "border-red-300/60 bg-red-50/80 hover:bg-red-100/80"
                              } `}
                            >
                              {/* Student info - Left partition design */}
                              <div className="flex items-center gap-3">
                                {/* Left partition - Last 3 digits */}
                                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg border border-gray-200/60">
                                  <div className="text-2xl font-semibold text-gray-900 font-[poppins]">
                                    {studentData.student.roll_number.slice(-3)}
                                  </div>
                                </div>

                                {/* Vertical divider line */}
                                <div className="w-px h-10 bg-gray-300/80"></div>

                                {/* Right side - Full info */}
                                <div className="flex-1">
                                  {/* Student name */}
                                  <div className="text-base text-gray-900 font-medium mb-0.5">
                                    {studentData.student.name}
                                  </div>
                                  {/* Full roll number */}
                                  <div className="text-xs text-gray-600 font-mono">
                                    {studentData.student.roll_number}
                                  </div>
                                </div>
                              </div>

                              {/* Status indicator and buttons - Right side */}
                              <div className="flex items-center gap-3">
                                {/* Status icon */}
                                <div
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    studentData.attendance.status === "Present"
                                      ? "bg-green-100/80 border border-green-200/60"
                                      : studentData.attendance.status ===
                                          "Leave"
                                        ? "bg-orange-100/80 border border-orange-200/60"
                                        : "bg-red-100/80 border border-red-200/60"
                                  }`}
                                >
                                  {studentData.attendance.status ===
                                  "Present" ? (
                                    <FaCheck className="text-green-600 w-4 h-4" />
                                  ) : studentData.attendance.status ===
                                    "Leave" ? (
                                    <FaUser className="text-orange-600 w-4 h-4" />
                                  ) : (
                                    <FaTimes className="text-red-600 w-4 h-4" />
                                  )}
                                </div>

                                {/* Only L button */}
                                <div className="flex gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateAttendance(
                                        studentData.student.id,
                                        "Leave",
                                      );
                                    }}
                                    className={`py-1.5 px-3 text-xs font-medium rounded-lg transition-all duration-200 ${
                                      studentData.attendance.status === "Leave"
                                        ? "bg-orange-600 text-white shadow-sm"
                                        : "bg-gray-200/80 text-gray-600 hover:bg-orange-100/80 border border-orange-200/40"
                                    }`}
                                  >
                                    L
                                  </button>
                                </div>
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

                        {/* Right Column */}
                        <div className="space-y-2.5">
                          {rightColumn.map((studentData) => (
                            <div
                              key={studentData.student.id}
                              onClick={() =>
                                toggleAttendance(studentData.student.id)
                              }
                              className={`relative flex items-center justify-between p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                                studentData.attendance.status === "Present"
                                  ? "border-green-300/60 bg-green-50/80 hover:bg-green-100/80"
                                  : studentData.attendance.status === "Leave"
                                    ? "border-orange-300/60 bg-orange-50/80 hover:bg-orange-100/80"
                                    : "border-red-300/60 bg-red-50/80 hover:bg-red-100/80"
                              } `}
                            >
                              {/* Student info - Left partition design */}
                              <div className="flex items-center gap-3">
                                {/* Left partition - Last 3 digits */}
                                <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg border border-gray-200/60">
                                  <div className="text-2xl font-semibold text-gray-900 font-[poppins]">
                                    {studentData.student.roll_number.slice(-3)}
                                  </div>
                                </div>

                                {/* Vertical divider line */}
                                <div className="w-px h-10 bg-gray-300/80"></div>

                                {/* Right side - Full info */}
                                <div className="flex-1">
                                  {/* Student name */}
                                  <div className="text-base text-gray-900 font-medium mb-0.5">
                                    {studentData.student.name}
                                  </div>
                                  {/* Full roll number */}
                                  <div className="text-xs text-gray-600 font-mono">
                                    {studentData.student.roll_number}
                                  </div>
                                </div>
                              </div>

                              {/* Status indicator and buttons - Right side */}
                              <div className="flex items-center gap-3">
                                {/* Status icon */}
                                <div
                                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                    studentData.attendance.status === "Present"
                                      ? "bg-green-100/80 border border-green-200/60"
                                      : studentData.attendance.status ===
                                          "Leave"
                                        ? "bg-orange-100/80 border border-orange-200/60"
                                        : "bg-red-100/80 border border-red-200/60"
                                  }`}
                                >
                                  {studentData.attendance.status ===
                                  "Present" ? (
                                    <FaCheck className="text-green-600 w-4 h-4" />
                                  ) : studentData.attendance.status ===
                                    "Leave" ? (
                                    <FaUser className="text-orange-600 w-4 h-4" />
                                  ) : (
                                    <FaTimes className="text-red-600 w-4 h-4" />
                                  )}
                                </div>

                                {/* Only L button */}
                                <div className="flex gap-1">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      updateAttendance(
                                        studentData.student.id,
                                        "Leave",
                                      );
                                    }}
                                    className={`py-1.5 px-3 text-xs font-medium rounded-lg transition-all duration-200 ${
                                      studentData.attendance.status === "Leave"
                                        ? "bg-orange-600 text-white shadow-sm"
                                        : "bg-gray-200/80 text-gray-600 hover:bg-orange-100/80 border border-orange-200/40"
                                    }`}
                                  >
                                    L
                                  </button>
                                </div>
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
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Save button at bottom */}
        <div className="flex justify-center mt-6">
          <Button
            onClick={saveAttendance}
            disabled={autoSaving || !hasChanges}
            variant="primary"
            className="px-4 py-2 text-base"
          >
            {autoSaving ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FaSave className="w-4 h-4 mr-1" />
                <span>Save</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* spacer */}
      <div className="h-20 sm:h-24 md:h-32 lg:h-40"></div>
    </div>
  );
}
