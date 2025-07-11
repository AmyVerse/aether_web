"use client";
import ClassDetailView from "@/components/teacher/class-detail-view";
import Head from "next/head";
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
     <>
      <Head>
        <title>Class Details | Aether</title>
      </Head>
    <div className="h-screen">
      {classId && <ClassDetailView classId={classId} />}
      </div>
      </>
  );
}
