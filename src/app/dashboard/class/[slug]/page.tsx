"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";

interface StudentAttendance {
  student_id: string;
  name: string;
  roll_number: string;
  attendance_status: "Present" | "Absent";
}

export default function AttendancePage() {
  const { slug } = useParams();
  const sessionId =
    typeof slug === "string" ? slug : Array.isArray(slug) ? slug[0] : "";
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Track locally changed statuses for submit
  const [, setChangedStatus] = useState<Record<string, "Present" | "Absent">>(
    {}
  );

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
            attendance_status: s.attendance_status || "Present", // i like this one
          }))
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
          : s
      )
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

  // Submit only changed statuses to DB (example, not implemented)
  const handleSubmitStatus = async () => {
    setSubmitting(true);
    try {
      await fetch(`/api/attendance/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          students: students.map((student) => ({
            student_id: student.student_id,
            attendance_status: student.attendance_status,
          })),
        }),
      });
      alert("Statuses updated in database!");
    } catch {
      alert("Failed to update statuses.");
    } finally {
      setSubmitting(false);
    }
  };

  // Dashboard stats
  const total = students.length;
  const present = students.filter(
    (u) => u.attendance_status === "Present"
  ).length;
  const absent = students.filter(
    (u) => u.attendance_status === "Absent"
  ).length;

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Attendance Viewer</h2>
      <p className="mb-4">
        <b>Session ID:</b> {sessionId}
      </p>

      <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-100 border border-blue-200 rounded-lg p-5 flex flex-col items-center shadow">
          <span className="text-2xl font-bold text-blue-700">{total}</span>
          <span className="text-gray-700 mt-1">Total Students</span>
        </div>
        <div className="bg-green-100 border border-green-200 rounded-lg p-5 flex flex-col items-center shadow">
          <span className="text-2xl font-bold text-green-700">{present}</span>
          <span className="text-gray-700 mt-1">Present</span>
        </div>
        <div className="bg-red-100 border border-red-200 rounded-lg p-5 flex flex-col items-center shadow">
          <span className="text-2xl font-bold text-red-700">{absent}</span>
          <span className="text-gray-700 mt-1">Absent</span>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="mb-3 text-md font-bold text-black text-left">
        Click cards or cross to toggle present/absent status
      </div>

      <ul className="space-y-3 mb-6">
        {students.map((student) => (
          <li
            key={student.student_id}
            className={`flex items-center justify-between border rounded-lg shadow-sm hover:shadow-md transition cursor-pointer px-4 py-3
              ${
                student.attendance_status === "Present"
                  ? "bg-green-50 border-green-400"
                  : "bg-red-50 border-red-400"
              }`}
            onClick={() => handleToggleStatus(student.student_id)}
          >
            <div>
              <p className="font-semibold text-lg">{student.roll_number}</p>
              <p className="text-gray-700">{student.name}</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`inline-block w-20 text-center py-1 rounded-full font-semibold text-sm
                  ${
                    student.attendance_status === "Present"
                      ? "bg-green-200 text-green-800"
                      : "bg-red-200 text-red-800"
                  }`}
              >
                {student.attendance_status}
              </span>
              <button
                className={`ml-2 p-2 rounded-full border-2 transition
                  ${
                    student.attendance_status === "Present"
                      ? "border-green-400 text-green-700 hover:bg-green-100"
                      : "border-red-400 text-red-700 hover:bg-red-100"
                  }`}
                title="Toggle Status"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleStatus(student.student_id);
                }}
              >
                <FaTimes />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mb-4 flex justify-center gap-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center justify-center"
          onClick={handleSubmitStatus}
          disabled={submitting}
        >
          {submitting ? (
            <>
              <svg
                className="animate-spin h-5 w-5 mr-2 inline-block"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Submitting...
            </>
          ) : (
            "Submit Attendance Status"
          )}
        </button>
      </div>
    </div>
  );
}
