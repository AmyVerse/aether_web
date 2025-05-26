"use client";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";

type User = {
  id: number;
  name: string;
  age: number;
  email: string;
};

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      const res = await fetch("/api");
      const data = await res.json();
      setUsers(data);
      setLoading(false);
    }

    fetchUsers();
  }, []);

  // Handle form submit
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await fetch("/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        age: Number(age),
        email,
      }),
    });
    setName("");
    setAge("");
    setEmail("");
    setSubmitting(false);

    // Refresh user list
    setLoading(true);
    const res = await fetch("/api");
    const data = await res.json();
    setUsers(data);
    setLoading(false);
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Users</h1>
        <Link href="/optimistic" className="text-blue-600 hover:underline">
          Go to optimistic
        </Link>
      </div>
      <form
        onSubmit={handleSubmit}
        className="mb-6 bg-white p-4 rounded shadow flex flex-col gap-3"
      >
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
          placeholder="Email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          disabled={submitting}
        >
          {submitting ? "Sending..." : "Send"}
        </button>
      </form>
      <ul className="space-y-2">
        {users.map((user) => (
          <li
            key={user.id}
            className="border p-3 rounded shadow-sm hover:shadow-md transition bg-white flex items-center justify-between"
          >
            <div>
              <p>
                <strong>Name:</strong> {user.name}
              </p>
              <p>
                <strong>Age:</strong> {user.age}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
            </div>
            <button
              className="ml-4 text-red-600 hover:text-red-800"
              title="Delete"
              onClick={async () => {
                try {
                  const res = await fetch(`/api/${user.id}`, {
                    method: "DELETE",
                  });
                  if (!res.ok) throw new Error("Delete failed");

                  setLoading(true);
                  const refreshed = await fetch("/api");
                  const data = await refreshed.json();
                  setUsers(data);
                  setLoading(false);
                } catch (err) {
                  console.error(err);
                  alert("Failed to delete user.");
                }
              }}
            >
              <FaTrash className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
