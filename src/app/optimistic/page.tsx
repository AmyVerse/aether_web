"use client";
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

  // Fetch users from API
  useEffect(() => {
    async function fetchUsers() {
      const res = await fetch("/api");
      const data = await res.json();
      setUsers(data);
      setLoading(false);
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
      email,
    };
    setUsers([optimisticUser, ...users]);
    setName("");
    setAge("");
    setEmail("");

    // Actually send to API
    try {
      const res = await fetch("/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: optimisticUser.name,
          age: optimisticUser.age,
          email: optimisticUser.email,
        }),
      });
      const saved = await res.json();
      // Replace temp user with real user from DB
      setUsers((prev) => prev.map((u) => (u.id === tempId ? saved : u)));
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

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Users</h1>
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
          type="email"
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
              onClick={() => handleDelete(user.id)}
            >
              <FaTrash className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
