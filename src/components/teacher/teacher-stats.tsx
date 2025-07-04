"use client";

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
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      </div>
    </div>
  );
}

export default function TeacherStats() {
  // TODO: Replace with actual data from API
  const stats = {
    totalStudents: 156,
    activeClasses: 8,
    todayClasses: 4,
    weeklyHours: 18,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Students"
        value={stats.totalStudents}
        icon={<FaUsers className="text-blue-600 text-xl" />}
        color="bg-blue-50"
        description="Across all classes"
      />
      <StatCard
        title="Active Classes"
        value={stats.activeClasses}
        icon={<FaChalkboardTeacher className="text-green-600 text-xl" />}
        color="bg-green-50"
        description="This semester"
      />
      <StatCard
        title="Today's Classes"
        value={stats.todayClasses}
        icon={<FaCalendarCheck className="text-purple-600 text-xl" />}
        color="bg-purple-50"
        description="Scheduled for today"
      />
      <StatCard
        title="Weekly Hours"
        value={stats.weeklyHours}
        icon={<FaClock className="text-orange-600 text-xl" />}
        color="bg-orange-50"
        description="Teaching hours"
      />
    </div>
  );
}
