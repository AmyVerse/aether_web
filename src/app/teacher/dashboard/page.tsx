"use client";

import { signOut } from "next-auth/react"; // or "@auth/react" for Auth.js v5

export default function TeacherDashboard() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">Teacher Dashboard</h1>
      <p className="text-lg">Welcome to your dashboard!</p>
      <button
        onClick={() => signOut()}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Sign Out
      </button>
      <button className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" onClick={() => (window.location.href = "/")}>Home</button>
    </div>
  );
}
