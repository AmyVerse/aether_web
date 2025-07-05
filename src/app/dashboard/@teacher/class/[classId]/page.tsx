"use client";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import ClassDetailView from "@/components/teacher/class-detail-view";
import { useEffect, useState } from "react";

interface PageProps {
  params: Promise<{
    classId: string;
  }>;
}

export default function ClassDetailPage({ params }: PageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          pageTitle="Class Details"
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-auto">
          {classId && <ClassDetailView classId={classId} />}
        </main>
      </div>
    </div>
  );
}
