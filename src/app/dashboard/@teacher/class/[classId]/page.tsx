"use client";
import ClassDetailView from "@/components/teacher/class-detail-view";
import { useEffect, useState } from "react";

interface PageProps {
  params: Promise<{
    classId: string;
  }>;
}

export default function ClassDetailPage({ params }: PageProps) {
  const [classData, setClassData] = useState<{
    id: string;
    subject_name: string;
  } | null>(null);
  const [classId, setClassId] = useState<string>("");

  useEffect(() => {
    params.then((resolvedParams) => {
      setClassId(resolvedParams.classId);
      // Fetch class data for header
      fetchClassData(resolvedParams.classId);
    });
  }, [params]);

  const fetchClassData = async (id: string) => {
    try {
      const response = await fetch(`/api/teacher/classes/${id}`);
      const data = await response.json();
      if (data.success) {
        setClassData({
          id: data.data.id,
          subject_name: data.data.subject_name,
        });
      }
    } catch (error) {
      console.error("Failed to fetch class data:", error);
    }
  };

  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
      {classId && <ClassDetailView classId={classId} />}
    </div>
  );
}
