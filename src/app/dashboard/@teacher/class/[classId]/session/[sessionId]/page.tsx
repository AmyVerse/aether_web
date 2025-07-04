import AttendancePage from "@/components/teacher/attendance-page";

interface PageProps {
  params: Promise<{
    classId: string;
    sessionId: string;
  }>;
}

export default async function TeacherSessionAttendancePage({
  params,
}: PageProps) {
  const resolvedParams = await params;
  return <AttendancePage sessionId={resolvedParams.sessionId} />;
}
