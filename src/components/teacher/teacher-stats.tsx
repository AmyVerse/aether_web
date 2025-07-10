"use client";

import { useSessionStore } from "@/store/useSessionStore";
import { useEffect, useState } from "react";
import {
  FaCalendarCheck,
  FaChalkboardTeacher,
  FaClock,
  FaUsers,
} from "react-icons/fa";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  description?: string;
}

function StatCard({ title, value, icon, color, description }: StatCardProps) {
  return (
    <div className="p-2 sm:p-4">
      <div className="flex bg-white p-2 sm:p-4 items-center rounded-lg border border-gray-300 hover:shadow-md transition-shadow">
        <div className="flex-1">
          <p className="text-gray-600 text-xs sm:text-sm font-medium truncate">
            {title}
          </p>
          <p className="text-2xl sm:text-2xl font-bold text-gray-900 mt-1">
            {value}
          </p>
          {description && (
            <p className="text-xs text-gray-500 mt-1 truncate">{description}</p>
          )}
        </div>
        <div className={`p-2 sm:p-3 rounded-lg ${color} flex-shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function TeacherStats() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeClasses: 0,
    todayClasses: 0,
  });
  const [loading, setLoading] = useState(true);
  const academicYear = useSessionStore((s) => s.academicYear);
  const semesterType = useSessionStore((s) => s.semesterType);

  useEffect(() => {
    fetchStats();
  }, [academicYear, semesterType]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Pass academicYear and semesterType as query params
      const params = new URLSearchParams();
      if (academicYear) params.append("academicYear", academicYear);
      if (semesterType) params.append("semesterType", semesterType);

      const teacherClassesResponse = await fetch(
        `/api/teacher/classes?${params.toString()}`,
      );
      let teacherClasses: any[] = [];
      if (teacherClassesResponse.ok) {
        const teacherData = await teacherClassesResponse.json();
        if (teacherData.success) {
          teacherClasses = teacherData.data;
        }
      }
      // Today's classes for teacher (support multiple timings per class)
      const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
      let todayClassesCount = 0;
      for (const c of teacherClasses) {
        if (Array.isArray(c.timings) && c.timings.length > 0) {
          if (c.timings.some((t: { day: string }) => t.day === today)) {
            todayClassesCount++;
          }
        } else if (c.day === today) {
          todayClassesCount++;
        }
      }
      // Total students across all teacher's classes
      let totalStudents = 0;
      for (const c of teacherClasses) {
        if (typeof c.student_count === "number") {
          totalStudents += c.student_count;
        } else {
          try {
            const res = await fetch(`/api/teacher/classes/${c.id}/students`);
            if (res.ok) {
              const data = await res.json();
              if (data.success) totalStudents += data.data.length;
            }
          } catch {}
        }
      }
      setStats({
        totalStudents,
        activeClasses: teacherClasses.length,
        todayClasses: todayClassesCount,
      });
    } catch (error) {
      console.error("Failed to fetch teacher stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <StatCard
        title="Total Students"
        value={loading ? "..." : stats.totalStudents}
        icon={<FaUsers className="text-blue-600 text-lg sm:text-xl" />}
        color="bg-blue-50"
        description="Across all classes"
      />
      <StatCard
        title="Active Classes"
        value={loading ? "..." : stats.activeClasses}
        icon={
          <FaChalkboardTeacher className="text-green-600 text-lg sm:text-xl" />
        }
        color="bg-green-50"
        description="This semester"
      />
      <StatCard
        title="Today's Classes"
        value={loading ? "..." : stats.todayClasses}
        icon={
          <FaCalendarCheck className="text-purple-600 text-lg sm:text-xl" />
        }
        color="bg-purple-50"
        description="Scheduled for today"
      />
      {/* Placeholder for last stat */}
      <StatCard
        title="Placeholder"
        value={"-"}
        icon={<FaClock className="text-orange-600 text-lg sm:text-xl" />}
        color="bg-orange-50"
        description="Placeholder stat"
      />
    </div>
  );
}
