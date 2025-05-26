"use client";
import { useParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";

// Utility to convert slug back to readable subject
function unslugify(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

type User = {
  id: number;
  name: string;
  age: number;
  rollnumber: string;
  status: boolean; // true for present (green), false for absent (red)
};

export default function UsersPage() {
  const { slug } = useParams<{ slug: string }>();
  const subject = unslugify(slug);

  const [users, setUsers] = useState<User[]>([]);

  // Form state
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [rollnumber, setRollnumber] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Track locally changed statuses for submit
  const [changedStatus, setChangedStatus] = useState<Record<number, boolean>>(
    {}
  );

  // Fetch users from API
  useEffect(() => {
    async function fetchUsers() {
      const res = await fetch("/api");
      const data = await res.json();
      setUsers(data);
    }
    fetchUsers();
  }, []);

  // Optimistic Add
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Create a temp user with a negative id for UI
    const tempId = Math.min(0, ...users.map((u) => u.id)) - 1;
    const optimisticUser: User = {
      id: tempId,
      name,
      age: Number(age),
      rollnumber,
      status: Math.random() > 0.3 ? true : false, // Random for demo
    };
    setUsers([optimisticUser, ...users]);
    setName("");
    setAge("");
    setRollnumber("");

    // Actually send to API
    try {
      const res = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: optimisticUser.name,
          age: optimisticUser.age,
          rollnumber: optimisticUser.rollnumber,
        }),
      });
      const saved = await res.json();
      // Replace temp user with real user from DB
      setUsers((prev) =>
        prev.map((u) =>
          u.id === tempId ? { ...saved, status: optimisticUser.status } : u
        )
      );
    } catch {
      // On error, remove temp user
      setUsers((prev) => prev.filter((u) => u.id !== tempId));
      alert("Failed to add user.");
    }
    setSubmitting(false);
  };

  // Optimistic Delete
  const handleDelete = async (id: number) => {
    // Remove from UI instantly
    const prevUsers = users;
    setUsers(users.filter((u) => u.id !== id));
    try {
      await fetch(`/api/${id}`, { method: "DELETE" });
    } catch {
      // On error, restore previous users
      setUsers(prevUsers);
      alert("Failed to delete user.");
    }
  };

  // Toggle present/absent status optimistically and track changes
  const handleToggleStatus = (id: number) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? {
              ...u,
              status: !u.status,
            }
          : u
      )
    );
    setChangedStatus((prev) => ({
      ...prev,
      [id]: !users.find((u) => u.id === id)?.status,
    }));
  };

  // Submit only changed statuses to DB
  const handleSubmitStatus = async () => {
    try {
      const changedUsers = users.filter(
        (user) => changedStatus[user.id] !== undefined
      );
      await Promise.all(
        changedUsers.map((user) =>
          fetch(`/api/${user.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: user.status,
            }),
          })
        )
      );
      setChangedStatus({});
      alert("Statuses updated in database!");
    } catch {
      alert("Failed to update statuses.");
    }
  };

  // Dashboard stats
  const total = users.length;
  const present = users.filter((u) => u.status === true).length;
  const absent = users.filter((u) => u.status === false).length;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        {subject} - Students Attendance
      </h1>
      <div className="text-gray-600 mb-6">
        {new Date().toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>

      {/* Dashboard Card */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-blue-100 border border-blue-200 rounded-lg p-5 flex flex-col items-center shadow">
          <span className="text-3xl font-bold text-blue-700">{total}</span>
          <span className="text-gray-700 mt-1">Total Students</span>
        </div>
        <div className="bg-green-100 border border-green-200 rounded-lg p-5 flex flex-col items-center shadow">
          <span className="text-3xl font-bold text-green-700">{present}</span>
          <span className="text-gray-700 mt-1">Present</span>
        </div>
        <div className="bg-red-100 border border-red-200 rounded-lg p-5 flex flex-col items-center shadow">
          <span className="text-3xl font-bold text-red-700">{absent}</span>
          <span className="text-gray-700 mt-1">Absent</span>
        </div>
      </div>

      {/* Instruction */}
      <div className="mb-3 text-md font-bold text-black text-left">
        Click cards to toggle present/absent status
      </div>

      {/* Students List */}
      <ul className="space-y-3 mb-6">
        {users.map((user) => (
          <li
            key={user.id}
            className={`border p-3 rounded shadow-sm hover:shadow-md transition flex items-center justify-between cursor-pointer
              ${
                user.status
                  ? "bg-green-50 border-green-300"
                  : "bg-red-50 border-red-300"
              }`}
            onClick={() => handleToggleStatus(user.id)}
          >
            <div>
              <p>
                <strong className="text-md">{user.rollnumber}</strong>
              </p>
              <p>{user.name}</p>
            </div>
            {/* <button
              className="ml-4 text-red-600 hover:text-red-800"
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(user.id);
              }}
            >
              <FaTrash className="h-4 w-4" />
            </button> */}
          </li>
        ))}
      </ul>

      {/* Submit Status and Export Buttons */}
      <div className="mb-4 flex justify-center gap-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={handleSubmitStatus}
        >
          Submit Attendance Status
        </button>
        <button
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
          onClick={() => {
            // Export as Excel (CSV format, Excel compatible)
            const today = new Date().toLocaleDateString();
            const header = [["Roll Number", "Name", today]];
            const rows = users.map((u) => [
              u.rollnumber,
              u.name,
              u.status ? 1 : 0,
            ]);
            const csvContent =
              header.map((row) => row.join(",")).join("\n") +
              "\n" +
              rows.map((row) => row.join(",")).join("\n");
            const blob = new Blob([csvContent], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${subject}-attendance-${today.replace(
              /\//g,
              "-"
            )}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          Export
        </button>
      </div>

      {/* Divider */}
      <hr className="my-16 border-t-2 border-gray-200" />

      {/* Add Student Form */}
      <div className="bg-white p-6 rounded shadow flex flex-col gap-4 max-w-4xl mx-auto mt-8">
        <h2 className="text-lg font-semibold mb-2">Add Student (trial)</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            className="border rounded px-3 py-2"
            placeholder="Name"
            value={name}
            required
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Age"
            type="number"
            value={age}
            required
            onChange={(e) => setAge(e.target.value)}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Roll Number"
            value={rollnumber}
            required
            onChange={(e) => setRollnumber(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            disabled={submitting}
          >
            {submitting ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
