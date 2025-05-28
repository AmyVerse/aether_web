"use client";

import { useState } from "react";

export default function RecurringScheduleForm() {
  const [form, setForm] = useState({
    teacher_id: "",
    subject_id: "",
    group_id: "",
    days_of_week: [] as number[],
    start_time: "",
    end_time: "",
    session_type: "",
    semester_start_date: "",
    semester_end_date: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleCheckboxChange = (day: number) => {
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
      const res = await fetch("/app/api/admin/setup-recurring", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
      setMessage("Recurring class scheduled successfully.");
      setForm({
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
      } else {
      setMessage(data.error || "Error submitting form.");
      }
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto space-y-4 p-4 border rounded-md shadow"
    >
      <h2 className="text-xl font-bold mb-2">Schedule Recurring Class</h2>

      <input
        type="text"
        placeholder="Teacher ID"
        value={form.teacher_id}
        onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
        className="input"
        required
      />
      <input
        type="text"
        placeholder="Subject ID"
        value={form.subject_id}
        onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
        className="input"
        required
      />
      <input
        type="text"
        placeholder="Group ID"
        value={form.group_id}
        onChange={(e) => setForm({ ...form, group_id: e.target.value })}
        className="input"
        required
      />

      <div className="space-y-1">
        <label className="font-semibold">Days of the Week:</label>
        <div className="flex flex-wrap gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, i) => (
            <label key={i} className="flex items-center space-x-1">
              <input
                type="checkbox"
                checked={form.days_of_week.includes(i)}
                onChange={() => handleCheckboxChange(i)}
              />
              <span>{day}</span>
            </label>
          ))}
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
        onChange={(e) => setForm({ ...form, session_type: e.target.value })}
        className="input"
        required
      >
        <option value="">Select Session Type</option>
        <option value="Lecture">Lecture</option>
        <option value="Practical">Practical</option>
        <option value="Tutorial">Tutorial</option>
      </select>

      <input
        type="date"
        value={form.semester_start_date}
        onChange={(e) =>
          setForm({ ...form, semester_start_date: e.target.value })
        }
        className="input"
        required
      />
      <input
        type="date"
        value={form.semester_end_date}
        onChange={(e) =>
          setForm({ ...form, semester_end_date: e.target.value })
        }
        className="input"
        required
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Scheduling..." : "Schedule"}
      </button>

      {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
    </form>
  );
}
