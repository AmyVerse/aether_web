"use client";

import AdminDashboard from "@/components/admin/dashboard";
import TeacherDashboard from "@/components/teacher/dashboard";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const teacherName = "Dr. Snehal";

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const lecturesData: Record<string, { subject: string; time: string }[]> = {
  Monday: [
    { subject: "Data Science", time: "09:00 - 10:00" },
    { subject: "Application Programming", time: "10:15 - 11:15" },
  ],
  Tuesday: [{ subject: "Data Science", time: "10:15 - 11:15" }],
  Wednesday: [
    { subject: "Data Science", time: "09:00 - 10:00" },
    { subject: "Computer Programming", time: "10:15 - 11:15" },
  ],
  Thursday: [],
  Friday: [{ subject: "Computer Science", time: "09:00 - 10:00" }],
};

const upcomingClasses = [
  { subject: "Data Science", time: "Today, 09:00 - 10:00" },
  { subject: "Application Programming", time: "Today, 10:15 - 11:15" },
];

function slugify(str: string) {
  return str.toLowerCase().replace(/\s+/g, "-");
}

const TABS = [
  { key: "test", label: "Test" },
  { key: "teacher", label: "Teacher" },
  { key: "admin", label: "Admin" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"test" | "teacher" | "admin">(
    "test"
  );

  const handleLectureClick = (subject: string) => {
    router.push(`/optimistic/${slugify(subject)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      {/* Top Bar with Logout and Tabs */}
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() =>
                setActiveTab(tab.key as "test" | "teacher" | "admin")
              }
              className={`px-4 py-2 rounded-t font-semibold transition-colors ${
                activeTab === tab.key
                  ? "bg-gray-800 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="bg-red-500 text-white px-4 py-2 rounded font-semibold hover:bg-red-600 transition"
        >
          Sign Out
        </button>
      </div>

      {/* Tab Content */}
      <div className="max-w-5xl mx-auto">
        {activeTab === "test" && (
          <>
            {/* Greeting */}
            <section className="mb-8">
              <h1 className="text-3xl font-semibold text-gray-900 mb-1">
                Good morning, {teacherName} 👋
              </h1>
              <p className="text-gray-600 text-base">
                Here’s your schedule for the week.
              </p>
            </section>

            {/* Upcoming Classes */}
            <section className="mb-10">
              <h2 className="text-xl font-semibold text-gray-800 mb-3">
                Upcoming Classes
              </h2>
              <div className="space-y-3">
                {upcomingClasses.map((cls, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm flex justify-between items-center"
                  >
                    <button
                      className="font-medium text-gray-900 hover:underline"
                      onClick={() => handleLectureClick(cls.subject)}
                    >
                      {cls.subject}
                    </button>
                    <span className="text-gray-500 text-sm">{cls.time}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Weekly Schedule */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex flex-col"
                >
                  <h3 className="text-lg font-semibold text-blue-700 mb-4">
                    {day}
                  </h3>

                  {lecturesData[day].length === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-gray-400 italic">
                      No classes
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {lecturesData[day].map((lec, idx) => (
                        <button
                          key={idx}
                          className="w-full text-left bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md px-4 py-2 transition-colors duration-200"
                          onClick={() => handleLectureClick(lec.subject)}
                        >
                          <div className="font-medium text-gray-800">
                            {lec.subject}
                          </div>
                          <div className="text-sm text-gray-500">
                            {lec.time}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </section>
          </>
        )}
        {activeTab === "teacher" && <TeacherDashboard />}
        {activeTab === "admin" && <AdminDashboard />}
      </div>
    </div>
  );
}
