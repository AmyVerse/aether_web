"use client";

import AttendancePage from "@/components/teacher/attendance-page";
import { useEffect, useState } from "react";

interface PageProps {
  params: Promise<{
    classId: string;
    sessionId: string;
  }>;
}

export default function TeacherSessionAttendancePage({ params }: PageProps) {
  const [sessionId, setSessionId] = useState<string>("");

  useEffect(() => {
    const loadParams = async () => {
      const { sessionId: resolvedSessionId } = await params;
      setSessionId(resolvedSessionId);
    };
    loadParams();
  }, [params]);

  // Only render AttendancePage when we have sessionId
  if (!sessionId) {
    return null; // Let AttendancePage handle the loading state
  }

  return (
    <div className="h-screen">
      <AttendancePage sessionId={sessionId} />
    </div>
  );
}
