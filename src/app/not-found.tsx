"use client";

import { useRouter } from "next/navigation";
import { FaExclamationTriangle } from "react-icons/fa";

export default function NotFound() {
  const router = useRouter();

  // Dummy role for UI-only (replace with actual logic if needed)
  const getRole = () => {
    // You can set a role here for testing, e.g. "teacher", "student", "admin"
    return ""; // or "teacher" or "student" or "admin"
  };

  const handleRedirect = () => {
    const role = getRole();
    if (role === "teacher") {
      router.push("/teacher/dashboard");
    } else if (role === "student") {
      router.push("/student/dashboard");
    } else if (role === "admin") {
      router.push("/admin/dashboard");
    } else {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex justify-center font-[manrope] bg-gray-100">
      <div className="text-center mt-32">
        <FaExclamationTriangle className="text-4xl text-gray-500 mb-4 mx-auto" />
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          404 - Page Not Found
        </h1>
        <p className="text-gray-700 text-lg font-medium mb-2">
          Sorry, the page you are looking for has vanished into the digital
          void.
        </p>
        <button
          onClick={handleRedirect}
          className="inline-block mt-6 bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray transition"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
