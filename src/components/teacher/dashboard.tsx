"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";

interface Session {
  id: string;
  subject_name: string;
  group_name: string;
  type: string | null;
  date: string;
  start_time: string;
  end_time: string | null;
  status: string;
  reason: string | null;
  branch: string;
  semester: string;
}

export default function TeacherSessionsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get teacherId from session.user.userid
  const teacherId = session?.user?.userid;

  useEffect(() => {
    if (!teacherId) return;
    const fetchSessions = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/teacher/${teacherId}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to fetch sessions");
          setSessions([]);
        } else {
          setSessions(data.sessions);
        }
      } catch {
        setError("Network error");
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, [teacherId]);

  function handleTakeAttendance(session: Session) {
    router.push(`/dashboard/class/${session.id}`);
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2 text-gray-800">
        Teacher&apos;s Class Sessions
      </h1>
      {teacherId && (
        <p className="mb-6 text-gray-600 text-sm">
          <span className="font-medium">Teacher ID:</span> {teacherId}
        </p>
      )}

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="bg-white rounded-xl shadow-md p-6 flex flex-col border border-gray-100 relative group cursor-pointer transition hover:shadow-lg"
            onClick={() => handleTakeAttendance(session)}
            tabIndex={0}
            role="button"
          >
            <div className="mb-2">
              <span className="text-lg font-bold text-gray-900">
                {session.subject_name}
              </span>
            </div>
            <div className="mb-1 text-gray-600">
              <span className="font-medium">Semester:</span> {session.semester}
            </div>
            <div className="mb-4 text-gray-600">
              <span className="font-medium">Branch:</span> {session.branch}
            </div>
            <div className="flex-1"></div>
            <div className="flex flex-col gap-1 mt-2">
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    session.status === "Scheduled"
                      ? "bg-green-100 text-green-700"
                      : session.status === "Completed"
                      ? "bg-blue-100 text-blue-700"
                      : session.status === "Cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {session.status}
                </span>
              </div>
              <div className="flex items-center mt-5 text-xs text-gray-500">
                <span>{new Date(session.date).toLocaleDateString()}</span>
              </div>
            </div>
            {/* Take Attendance Arrow */}
            <div className="absolute bottom-4 right-4">
              <span className="flex items-center gap-1 text-green-700 font-semibold group-hover:underline">
                Take Attendance <FaArrowRight className="ml-1" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {sessions.length === 0 && !loading && !error && (
        <p className="text-gray-500 text-center mt-10">No sessions found.</p>
      )}
      {loading && <p className="text-gray-500 text-center mt-10">Loading...</p>}
    </div>
  );
}
