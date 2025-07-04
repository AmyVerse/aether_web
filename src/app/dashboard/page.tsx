"use client";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaExclamationTriangle, FaUserCog } from "react-icons/fa";

export default function DashboardPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const runSetup = async () => {
      if (status === "authenticated" && session?.user?.email) {
        const res = await fetch("/api/update-profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user.email }),
        });
        const data = await res.json();

        if (data.success) {
          // Update session with new role
          await update();
          setProcessing(false);

          // Refresh to trigger server-side layout re-render with new role
          router.refresh();
        } else {
          setProcessing(false);
          setError(
            "We couldn't verify your details in our database. Please request access from the administrator or contact admin if you believe there is a mistake.",
          );
        }
      }
    };
    runSetup();
  }, [status, session, update, router]);

  const handleGoBack = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen flex justify-center font-[manrope] bg-gray-100">
      <div className="text-center mt-32">
        {error ? (
          <>
            <FaExclamationTriangle className="text-4xl text-red-500 mb-6 mx-auto" />
            <h1 className="text-3xl font-bold mb-6 text-gray-800">
              Access Verification Failed
            </h1>
            <div className="max-w-lg mx-auto mb-8">
              <p className="text-gray-700 text-lg font-medium mb-4 leading-relaxed">
                We couldn&apos;t verify your details in our database.
              </p>
              <div className="border-l-4 border-blue-500 bg-blue-50 p-4 mb-6 text-left">
                <p className="text-blue-800 font-medium mb-2">
                  What you can do:
                </p>
                <ul className="text-blue-700 space-y-1 text-sm">
                  <li>• Request access from the administrator</li>
                  <li>• Contact admin if you believe there is a mistake</li>
                  <li>• Try signing in with a different account</li>
                </ul>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <button
                onClick={handleGoBack}
                className="bg-gray-800 text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition font-medium"
              >
                Sign Out
              </button>
              <button
                onClick={() =>
                  window.open(
                    "mailto:admin@example.com?subject=Access Request - Aether Web",
                    "_blank",
                  )
                }
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Contact Admin
              </button>
            </div>
          </>
        ) : processing ? (
          <>
            <FaUserCog className="text-4xl text-blue-500 mb-6 mx-auto" />
            <h1 className="text-3xl font-bold mb-6 text-gray-800">
              Setting up your account...
            </h1>
            <div className="max-w-md mx-auto mb-6">
              <p className="text-gray-700 text-lg font-medium mb-3 leading-relaxed">
                We&apos;re fetching your details and preparing your dashboard.
              </p>
              <p className="text-gray-600 text-sm">
                This will only happen once. Please wait a moment.
              </p>
            </div>
            <div className="flex justify-center">
              <svg
                className="animate-spin h-6 w-6 text-gray-600"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
