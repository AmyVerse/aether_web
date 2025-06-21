"use client";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardSetup() {
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
          //update
          const updatedSession = await update();
          const role = updatedSession?.user?.role;
          setProcessing(false);

          switch (role) {
            case "admin":
              router.push("/dashboard/admin");
              break;
            case "student":
              router.push("/dashboard/student");
              break;
            case "teacher":
              router.push("/dashboard/teacher");
              break;
            case "editor":
              router.push("/dashboard/editor");
              break;
            default:
              router.push("/");
              break;
          }
        } else {
          setProcessing(false);
          setError(
            "We couldn't verify your details in our database. Please request access from the administrator. You will be redirected to the landing page.",
          );
          setTimeout(() => {
            signOut({ callbackUrl: "/" });
          }, 4000);
        }
      }
    };
    runSetup();
  }, [status, session, update, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        {error ? (
          <>
            <h2 className="text-xl font-bold mb-2 text-red-600">
              Access Error
            </h2>
            <p>{error}</p>
          </>
        ) : processing ? (
          <>
            <h2 className="text-xl font-bold mb-2">Fetching your details…</h2>
            <p>This will only happen once. Please wait.</p>
            <div className="mt-4 flex justify-center">
              <svg
                className="animate-spin h-8 w-8 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
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
