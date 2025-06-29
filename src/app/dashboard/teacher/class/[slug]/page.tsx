"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/useToast";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaCheck, FaTimes, FaUser } from "react-icons/fa";

interface StudentAttendance {
  student_id: string;
  name: string;
  roll_number: string;
  attendance_status: "Present" | "Absent";
}

export default function AttendancePage() {
  const { slug } = useParams();
  const { showSuccess, showError } = useToast();
  const sessionId =
    typeof slug === "string" ? slug : Array.isArray(slug) ? slug[0] : "";
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Track locally changed statuses for submit
  const [changedStatus, setChangedStatus] = useState<
    Record<string, "Present" | "Absent">
  >({});

  const fetchAttendance = async () => {
    if (!sessionId) {
      setError("Session ID not found in URL");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/attendance/${sessionId}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to fetch attendance");
      } else {
        setStudents(
          data.students.map((s: StudentAttendance) => ({
            ...s,
            attendance_status: s.attendance_status || "Present",
          })),
        );
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  // Toggle present/absent status optimistically and track changes
  const handleToggleStatus = (student_id: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.student_id === student_id
          ? {
              ...s,
              attendance_status:
                s.attendance_status === "Present" ? "Absent" : "Present",
            }
          : s,
      ),
    );
    setChangedStatus((prev) => ({
      ...prev,
      [student_id]:
        students.find((s) => s.student_id === student_id)?.attendance_status ===
        "Present"
          ? "Absent"
          : "Present",
    }));
  };

  // Submit only changed statuses to DB
  const handleSubmitStatus = async () => {
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch(`/api/attendance/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          students: students.map((student) => ({
            student_id: student.student_id,
            attendance_status: student.attendance_status,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update attendance");
      }

      // Clear changed status after successful submit
      setChangedStatus({});
      showSuccess("Attendance updated successfully!");
    } catch (error) {
      showError("Failed to update attendance. Please try again.");
      console.error("Attendance update error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Dashboard stats
  const total = students.length;
  const present = students.filter(
    (u) => u.attendance_status === "Present",
  ).length;
  const absent = students.filter(
    (u) => u.attendance_status === "Absent",
  ).length;

  return (
    <DashboardLayout
      title="Class Attendance"
      subtitle={`Session ID: ${sessionId}`}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="text-center">
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{total}</div>
            <div className="text-gray-600 flex items-center gap-2">
              <FaUser className="text-blue-500" />
              Total Students
            </div>
          </div>
        </Card>

        <Card className="text-center">
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {present}
            </div>
            <div className="text-gray-600 flex items-center gap-2">
              <FaCheck className="text-green-500" />
              Present
            </div>
          </div>
        </Card>

        <Card className="text-center">
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-red-600 mb-2">{absent}</div>
            <div className="text-gray-600 flex items-center gap-2">
              <FaTimes className="text-red-500" />
              Absent
            </div>
          </div>
        </Card>
      </div>

      {/* Loading and Error States */}
      {loading && (
        <Card className="text-center">
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            Loading attendance data...
          </div>
        </Card>
      )}

      {error && (
        <Card className="mb-6">
          <div className="text-red-600 text-center">{error}</div>
        </Card>
      )}

      {/* Attendance List */}
      {!loading && students.length > 0 && (
        <Card>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Student Attendance</h3>
            <p className="text-sm text-gray-600">
              Click on students to toggle attendance status
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {students.map((student) => (
              <div
                key={student.student_id}
                className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                  student.attendance_status === "Present"
                    ? "bg-green-50 border-green-200 hover:bg-green-100"
                    : "bg-red-50 border-red-200 hover:bg-red-100"
                }`}
                onClick={() => handleToggleStatus(student.student_id)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                      student.attendance_status === "Present"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  >
                    {student.attendance_status === "Present" ? (
                      <FaCheck />
                    ) : (
                      <FaTimes />
                    )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {student.roll_number}
                    </div>
                    <div className="text-gray-600">{student.name}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      student.attendance_status === "Present"
                        ? "success"
                        : "destructive"
                    }
                  >
                    {student.attendance_status}
                  </Badge>

                  <Button
                    variant="ghost"
                    size="sm"
                    className={`p-2 ${
                      student.attendance_status === "Present"
                        ? "text-green-600 hover:bg-green-100"
                        : "text-red-600 hover:bg-red-100"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleStatus(student.student_id);
                    }}
                  >
                    <FaTimes />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleSubmitStatus}
              disabled={submitting || Object.keys(changedStatus).length === 0}
              className="px-6"
            >
              {submitting ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                  Submitting...
                </>
              ) : (
                "Submit Attendance"
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!loading && students.length === 0 && !error && (
        <Card className="text-center">
          <div className="text-gray-500">
            <FaUser className="text-4xl mx-auto mb-4 text-gray-300" />
            <p>No students found for this session.</p>
          </div>
        </Card>
      )}
    </DashboardLayout>
  );
}
