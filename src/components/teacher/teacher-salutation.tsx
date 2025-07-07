"use client";

import { useCachedSession } from "@/hooks/useSessionCache";
import { FaCloudSun, FaMoon, FaSun } from "react-icons/fa";

export default function TeacherSalutation() {
  const { userName } = useCachedSession();
  const fullName = userName || "Teacher";
  const firstName = fullName.split(" ")[0]; // Get only the first name

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12)
      return {
        text: "Good Morning",
        icon: <FaSun className="text-yellow-500" />,
      };
    if (hour < 17)
      return {
        text: "Good Afternoon",
        icon: <FaCloudSun className="text-orange-500" />,
      };
    return { text: "Good Evening", icon: <FaMoon className="text-gray-500"/> };
  };

  const greeting = getGreeting();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-gradient-to-r from-indigo-50 via-white to-purple-50 p-6 rounded-xl border border-indigo-100/50 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {greeting.icon}
            <p className="text-md text-indigo-600 font-medium">
              {greeting.text}
            </p>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent mb-2">
            Prof. {firstName}
          </h1>
          <p className="text-gray-600 sm:hidden block text-sm font-medium">
            {today}
          </p>
        </div>
        <div className="hidden md:block">
          <div className="text-right">
            <p className="text-gray-600 text-sm font-medium">{today}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
