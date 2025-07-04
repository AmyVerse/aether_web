"use client";

import { useRouter } from "next/navigation";
import { FaExclamationTriangle } from "react-icons/fa";

export default function NotFound() {
  const router = useRouter();

  const handleGoHome = () => {
    router.push("/");
  };

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen flex justify-center font-[manrope] bg-gray-100">
      <div className="text-center mt-32">
        <FaExclamationTriangle className="text-4xl text-gray-500 mb-4 mx-auto" />
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          404 - Page Not Found
        </h1>
        <p className="text-gray-700 text-lg font-medium mb-8">
          Sorry, the page you are looking for has vanished into the digital
          void.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={handleGoBack}
            className="border-2 border-black text-black px-6 py-2 rounded-lg font-medium"
          >
            Go Back
          </button>
          <button
            onClick={handleGoHome}
            className="bg-gray-700 text-white border-2 border-black px-6 py-2 rounded-lg hover:bg-gray-900 transition font-medium"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
