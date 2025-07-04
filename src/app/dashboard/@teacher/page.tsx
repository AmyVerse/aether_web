"use client";
import UpcomingClasses from "@/components/dashboard/upcoming-classes";
import DashboardLayout from "@/components/layout/dashboard-layout";
import MyClasses from "@/components/teacher/my-classes";
import TeacherSalutation from "@/components/teacher/teacher-salutation";
import TeacherStats from "@/components/teacher/teacher-stats";

export default function TeacherDashboard() {
  return (
    <DashboardLayout
      title="Teacher Dashboard"
      subtitle="Manage your classes and students"
    >
      <div className="space-y-6">
        {/* Salutation */}
        <TeacherSalutation />

        {/* Stats Row */}
        <TeacherStats />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <MyClasses />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Additional widgets can go here */}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
