"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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

export default function DashboardPage() {
  const router = useRouter();
  const { status } = useSession();

  const handleLectureClick = (subject: string) => {
    router.push(`/optimistic/${slugify(subject)}`);
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return null; // block rendering while session is loading or about to redirect
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      {/* Top Bar with Logout */}
      <div className="max-w-5xl mx-auto flex justify-end mb-4">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="bg-gray-800 text-white px-4 py-2 rounded"
        >
          Sign Out
        </button>
      </div>

      {/* Greeting */}
      <section className="max-w-5xl mx-auto mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-1">
          Good morning, {teacherName} 👋
        </h1>
        <p className="text-gray-600 text-base">
          Here’s your schedule for the week.
        </p>
      </section>

      {/* Upcoming Classes */}
      <section className="max-w-5xl mx-auto mb-10">
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
      <section className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {weekDays.map((day) => (
          <div
            key={day}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 flex flex-col"
          >
            <h3 className="text-lg font-semibold text-blue-700 mb-4">{day}</h3>

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
                    <div className="text-sm text-gray-500">{lec.time}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}
