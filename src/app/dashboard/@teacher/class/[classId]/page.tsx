import ClassDetailView from "@/components/teacher/class-detail-view";

interface PageProps {
  params: Promise<{
    classId: string;
  }>;
}

export default async function DashboardClassDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <ClassDetailView classId={resolvedParams.classId} />;
}
