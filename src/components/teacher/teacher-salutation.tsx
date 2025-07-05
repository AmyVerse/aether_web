"use client";

import { useSession } from "next-auth/react";
import { FaCloudSun, FaMoon, FaSun } from "react-icons/fa";

export default function TeacherSalutation() {
  const { data: session } = useSession();
  const fullName = session?.user?.name || "Teacher";
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
    return { text: "Good Evening", icon: <FaMoon className="text-white" /> };
  };

  const greeting = getGreeting();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="bg-gradient-to-tl from-gray-600 to-gray-800 text-white p-6 rounded-xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            {greeting.icon}
            <h1 className="text-2xl font-bold">
              {greeting.text}, Prof. {firstName}!
            </h1>
          </div>
          <p className="text-blue-100 sm:hidden block text-lg">{today}</p>
        </div>
        <div className="hidden md:block">
          <div className="text-right">
            <p className="text-blue-100 text-lg">{today}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
