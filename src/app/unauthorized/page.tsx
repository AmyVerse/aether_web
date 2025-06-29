"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaLock } from "react-icons/fa";

const roleRedirects: Record<string, { path: string; label: string }> = {
  teacher: { path: "/dashboard/teacher", label: "Teacher Dashboard" },
  student: { path: "/dashboard/student", label: "Student Dashboard" },
  admin: { path: "/dashboard/admin", label: "Admin Dashboard" },
  editor: { path: "/dashboard/editor", label: "Editor Dashboard" },
};

export default function UnauthorizedPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [countdown, setCountdown] = useState(5);

  // Determine redirect path and label based on user's role
  let redirectPath = "/";
  let destinationLabel = "Landing Page";

  if (status === "authenticated" && session?.user?.role) {
    const match = roleRedirects[session.user.role];
    if (match) {
      redirectPath = match.path;
      destinationLabel = match.label;
    }
  }

  useEffect(() => {
    let count = 5;
    setCountdown(count);
    const interval = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count === 0) {
        clearInterval(interval);
        router.replace(redirectPath);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [router, redirectPath]);

  const handleRedirect = () => {
    router.replace(redirectPath);
  };

  return (
    <div className="min-h-screen flex justify-center font-[manrope] bg-gray-100">
      <div className="text-center mt-32">
        <FaLock className="text-4xl text-orange-500 mb-6 mx-auto" />
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Unauthorized Access
        </h1>
        <div className="max-w-md mx-auto mb-8">
          <p className="text-gray-700 text-lg font-medium mb-4 leading-relaxed">
            You don&apos;t have permission to access this page.
          </p>
          <div className="border-l-4 border-amber-500 bg-amber-50 p-4 mb-6 text-left">
            <p className="text-amber-800 font-medium mb-2">Access Denied:</p>
            <p className="text-amber-700 text-sm">
              Your current role doesn&apos;t allow access to this resource. You&apos;ll be
              redirected to your appropriate dashboard.
            </p>
          </div>
          <p className="text-gray-600 text-sm">
            Automatically redirecting to{" "}
            <span className="font-semibold text-gray-800">
              {destinationLabel}
            </span>{" "}
            in <span className="font-semibold text-gray-800">{countdown}</span>{" "}
            seconds...
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={handleRedirect}
            className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition font-medium"
          >
            Go to {destinationLabel}
          </button>
          <button
            onClick={() =>
              window.open(
                "mailto:admin@example.com?subject=Access Request - Page Access Issue",
                "_blank",
              )
            }
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition font-medium"
          >
            Contact Admin
          </button>
        </div>
      </div>
    </div>
  );
}
