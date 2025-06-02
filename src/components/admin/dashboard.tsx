"use client";

import { useEffect, useState } from "react";
import { FaCheck, FaPencilAlt } from "react-icons/fa"; // update import

type SessionType = "Lecture" | "Lab" | "Tutorial" | "Extras";
type DayOfWeek = number; // 0=Sun, 1=Mon, ..., 6=Sat

interface RecurringClassForm {
  teacher_id: string;
  subject_id: string;
  group_id: string;
  days_of_week: DayOfWeek[];
  start_time: string;
  end_time: string;
  session_type: SessionType | "";
  semester_start_date: string; // YYYY-MM-DD
  semester_end_date: string; // YYYY-MM-DD
}

function formatDateDisplay(dateStr: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default function RecurringScheduleForm() {
  const [form, setForm] = useState<RecurringClassForm>({
    teacher_id: "",
    subject_id: "",
    group_id: "",
    days_of_week: [],
    start_time: "",
    end_time: "",
    session_type: "",
    semester_start_date: "",
    semester_end_date: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [semesterDates, setSemesterDates] = useState<{
    start: string;
    end: string;
  }>({
    start: "",
    end: "",
  });
  const [editingSemester, setEditingSemester] = useState(false);
  const [teachers, setTeachers] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<
    { id: string; code: string; name: string }[]
  >([]);
  const [groups, setGroups] = useState<
    {
      id: string;
      section: string;
      branch: string;
      name: string;
      semester: string | number;
    }[]
  >([]);

  // Fetch teachers, subjects, and groups on component mount
  useEffect(() => {
    fetch("/api/admin/teachers")
      .then((res) => res.json())
      .then((data) => setTeachers(data.teachers || []));
    fetch("/api/admin/subjects")
      .then((res) => res.json())
      .then((data) => setSubjects(data.subjects || []));
    fetch("/api/admin/groups")
      .then((res) => res.json())
      .then((data) => setGroups(data.groups || []));
  }, []);

  // When semesterDates change, update form fields
  const handleSemesterDateChange = (field: "start" | "end", value: string) => {
    setSemesterDates((prev) => ({ ...prev, [field]: value }));
    setForm((prev) => ({
      ...prev,
      semester_start_date: field === "start" ? value : prev.semester_start_date,
      semester_end_date: field === "end" ? value : prev.semester_end_date,
    }));
  };

  const handleCheckboxChange = (day: DayOfWeek) => {
    setForm((prev) => {
      const updatedDays = prev.days_of_week.includes(day)
        ? prev.days_of_week.filter((d) => d !== day)
        : [...prev.days_of_week, day];
      return { ...prev, days_of_week: updatedDays };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/admin/setup-recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Recurring class scheduled successfully.");
      } else {
        setMessage(data.error || "Error submitting form.");
      }
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const isDateInvalid =
    !!semesterDates.start &&
    !!semesterDates.end &&
    new Date(semesterDates.end) < new Date(semesterDates.start);

  return (
    <div className="flex gap-8 items-start">
      {/* Left: Add Class Button & Form */}
      <div className="flex-1">
        <button
          onClick={() => setShowForm((v) => !v)}
          className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {showForm ? "Hide Add Class Form" : "Add Class"}
        </button>
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="max-w-xl mx-auto space-y-4 p-4 border rounded-md shadow bg-white"
          >
            <h2 className="text-xl font-bold mb-2">Schedule Recurring Class</h2>

            <select
              value={form.teacher_id}
              onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
              className="input"
              required
            >
              <option value="">Select Teacher</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <select
              value={form.subject_id}
              onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
              className="input"
              required
            >
              <option value="">Select Subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>

            <select
              value={form.group_id}
              onChange={(e) => setForm({ ...form, group_id: e.target.value })}
              className="input"
              required
            >
              <option value="">Select Group</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.branch} ({g.name}) - Semester {g.semester}
                </option>
              ))}
            </select>

            <div className="space-y-1">
              <label className="font-semibold">Days of the Week:</label>
              <div className="flex flex-wrap gap-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                  (day, i) => (
                    <label key={i} className="flex items-center space-x-1">
                      <input
                        type="checkbox"
                        checked={form.days_of_week.includes(i)}
                        onChange={() => handleCheckboxChange(i)}
                      />
                      <span>{day}</span>
                    </label>
                  )
                )}
              </div>
            </div>

            <input
              type="time"
              value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              className="input"
              required
            />
            <input
              type="time"
              value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              className="input"
            />

            <select
              value={form.session_type}
              onChange={(e) =>
                setForm({
                  ...form,
                  session_type: e.target.value as SessionType,
                })
              }
              className="input"
              required
            >
              <option value="">Select Session Type</option>
              <option value="Lecture">Lecture</option>
              <option value="Lab">Lab</option>
              <option value="Tutorial">Tutorial</option>
              <option value="Extras">Extras</option>
            </select>

            <button
              type="submit"
              disabled={loading || isDateInvalid}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Scheduling..." : "Schedule"}
            </button>

            {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
          </form>
        )}
      </div>

      {/* Right: Semester Info and Date Pickers */}
      <div className="flex flex-col items-start bg-white p-6 rounded shadow min-w-[300px]">
        <div className="flex items-center gap-2 font-bold text-lg mb-4">
          Jan-May Semester 2025
          <button
            type="button"
            aria-label={
              editingSemester
                ? "Done editing semester dates"
                : "Edit semester dates"
            }
            className="ml-2 text-gray-500 hover:text-blue-600"
            onClick={() => setEditingSemester((v) => !v)}
          >
            {editingSemester ? <FaCheck /> : <FaPencilAlt />}
          </button>
        </div>
        <div className="mb-2">
          <span className="font-medium">Semester Start:</span>{" "}
          <span className="text-gray-900">
            {semesterDates.start ? (
              formatDateDisplay(semesterDates.start)
            ) : (
              <span className="text-gray-400">Not set</span>
            )}
          </span>
        </div>
        <div className="mb-2">
          <span className="font-medium">Semester End:</span>{" "}
          <span className="text-gray-900">
            {semesterDates.end ? (
              formatDateDisplay(semesterDates.end)
            ) : (
              <span className="text-gray-400">Not set</span>
            )}
          </span>
        </div>
        {editingSemester && (
          <div className="w-full mt-2">
            <label className="mb-1 font-medium block">Edit Start Date:</label>
            <input
              type="date"
              value={semesterDates.start}
              onChange={(e) =>
                handleSemesterDateChange("start", e.target.value)
              }
              className="input mb-2 w-full"
            />
            <label className="mb-1 font-medium block">Edit End Date:</label>
            <input
              type="date"
              value={semesterDates.end}
              onChange={(e) => handleSemesterDateChange("end", e.target.value)}
              className="input w-full"
            />
            {isDateInvalid && (
              <div className="text-red-600 text-sm mt-2">
                End date must be after start date.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
