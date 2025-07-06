"use client";

import AttendancePage from "@/components/teacher/attendance-page";
import ContentLoader from "@/components/ui/content-loader";
import { useEffect, useState } from "react";

interface PageProps {
  params: Promise<{
    classId: string;
    sessionId: string;
  }>;
}

interface SessionData {
  id: string;
  teacher_class_id: string;
  date: string;
  start_time: string;
  end_time?: string;
  status: string;
  notes?: string;
}

interface ClassData {
  id: string;
  subject_name: string;
  subject_code: string;
  short_name: string;
}

// Function to fetch session and class data via API
async function fetchSessionData(
  sessionId: string,
  classId: string,
): Promise<{
  session: SessionData;
  class: ClassData;
} | null> {
  try {
    const response = await fetch(
      `/api/teacher/classes/${classId}/sessions/${sessionId}`,
    );
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error("Failed to fetch session data");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching session data:", error);
    return null;
  }
}

export default function TeacherSessionAttendancePage({ params }: PageProps) {
  const [classId, setClassId] = useState<string>("");
  const [sessionId, setSessionId] = useState<string>("");
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const { classId: resolvedClassId, sessionId: resolvedSessionId } =
          await params;
        setClassId(resolvedClassId);
        setSessionId(resolvedSessionId);

        // Fetch session and class data
        const data = await fetchSessionData(resolvedSessionId, resolvedClassId);
        if (!data) {
          setError("Session or class not found");
          return;
        }

        setSessionData(data.session);
        setClassData(data.class);
      } catch (err) {
        setError("Failed to load session data");
        console.error("Error loading session data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [params]);

  if (error) {
    return (
      <div className="p-3 sm:p-4 md:p-6">
        <div className="text-center py-8 sm:py-12">
          <h3 className="text-base sm:text-lg font-medium mb-2">Error</h3>
          <p className="text-muted-foreground text-sm sm:text-base">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6">
      {loading ? (
        <ContentLoader message="Loading session..." />
      ) : sessionId ? (
        <AttendancePage sessionId={sessionId} />
      ) : null}
    </div>
  );
}
