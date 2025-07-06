"use client";
import MyClasses from "@/components/teacher/my-classes";
import TeacherSalutation from "@/components/teacher/teacher-salutation";
import TeacherStats from "@/components/teacher/teacher-stats";

export default function TeacherDashboard() {
  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="space-y-4 sm:space-y-6 relative">
        {/* Salutation */}
        <TeacherSalutation />

        {/* Stats Row */}
        <TeacherStats />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
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
    </div>
  );
}
