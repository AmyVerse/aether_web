"use client";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";
import MyClasses from "@/components/teacher/my-classes";
import TeacherSalutation from "@/components/teacher/teacher-salutation";
import TeacherStats from "@/components/teacher/teacher-stats";
import { useState } from "react";

export default function TeacherDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden z-0">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 h-full z-0">
        <Header
          pageTitle="Dashboard"
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 overflow-auto z-0">
          <div className="space-y-4 sm:space-y-6 z-0 relative">
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
        </main>
      </div>
    </div>
  );
}
