"use client";

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
    <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-300 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="min-w-0 flex-1">
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
    weeklyHours: 18, // Keep this static as requested
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeacherStats();
  }, []);

  const fetchTeacherStats = async () => {
    try {
      setLoading(true);

      // Fetch total students
      const studentsResponse = await fetch("/api/teacher/dashboard", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (studentsResponse.ok) {
        const data = await studentsResponse.json();

        // Count total students across all classes
        const totalStudents =
          data.classes?.reduce((total: number, classData: any) => {
            return total + (classData.student_count || 0);
          }, 0) || 0;

        // Count active classes
        const activeClasses = data.classes?.length || 0;

        // Count today's classes
        const today = new Date().toISOString().split("T")[0];
        const todayClasses =
          data.sessions?.filter((session: any) => {
            const sessionDate = new Date(session.date)
              .toISOString()
              .split("T")[0];
            return sessionDate === today;
          }).length || 0;

        setStats({
          totalStudents,
          activeClasses,
          todayClasses,
          weeklyHours: 18, // Keep static
        });
      }
    } catch (error) {
      console.error("Failed to fetch teacher stats:", error);
      // Keep default values on error
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
      <StatCard
        title="Weekly Hours"
        value={stats.weeklyHours}
        icon={<FaClock className="text-orange-600 text-lg sm:text-xl" />}
        color="bg-orange-50"
        description="Teaching hours"
      />
    </div>
  );
}
