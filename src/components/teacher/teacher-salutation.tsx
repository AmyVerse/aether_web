"use client";

import { useSession } from "next-auth/react";
import { FaCloudSun, FaMoon, FaSun } from "react-icons/fa";

export default function TeacherSalutation() {
  const { data: session } = useSession();
  const teacherName = session?.user?.name || "Teacher";

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
    return { text: "Good Evening", icon: <FaMoon className="text-blue-500" /> };
  };

  const greeting = getGreeting();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white p-6 rounded-xl shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {greeting.icon}
            <h1 className="text-2xl font-bold">
              {greeting.text}, {teacherName}!
            </h1>
          </div>
          <p className="text-blue-100 text-lg">
            Ready to inspire minds today? Here's your overview for {today}
          </p>
        </div>
        <div className="hidden md:block">
          <div className="text-right">
            <div className="text-3xl font-bold">
              {new Date().toLocaleDateString("en-US", { day: "numeric" })}
            </div>
            <div className="text-blue-200">
              {new Date().toLocaleDateString("en-US", { month: "short" })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
