"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const roleRedirects: Record<string, { path: string; label: string }> = {
  teacher: { path: "/teacher/dashboard", label: "Teacher Dashboard" },
  student: { path: "/student/dashboard", label: "Student Dashboard" },
  admin: { path: "/admin/dashboard", label: "Admin Dashboard" },
  editor: { path: "/editor/dashboard", label: "Editor Dashboard" },
};

export default function RedirectingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [countdown, setCountdown] = useState(3);

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
    let count = 3;
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

  return (
    <div className="min-h-screen flex items-center justify-center font-[manrope] bg-gray-100">
      <div className="text-center">
        <p className="text-gray-700 text-xl font-medium mb-4">
          Unauthorized Access
        </p>
        <p className="text-lg text-gray-500 mb-2">
          Redirecting to {destinationLabel} in {countdown}
        </p>
      </div>
    </div>
  );
}
