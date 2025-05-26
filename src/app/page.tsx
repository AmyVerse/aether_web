"use client";
import { useRouter } from "next/navigation";

export default function WelcomePage() {
  const router = useRouter();

  const handleEnter = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300 px-2">
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-10 flex flex-col items-center w-full max-w-xs sm:max-w-md">
        <h1 className="text-3xl font-bold mb-4 text-blue-700 text-center">
          Welcome to Aether Web
        </h1>
        <p className="text-gray-700 mb-8 text-center">
          Manage your classes, students, and attendance with ease.
          <br />
          Click below to enter your dashboard.
        </p>
        <button
          onClick={handleEnter}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition w-full"
        >
          Enter Dashboard
        </button>
      </div>
    </div>
  );
}
