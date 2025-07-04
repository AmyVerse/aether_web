"use client";
import CalendarWidget from "@/components/dashboard/calendar-widget";
import ProfileCard from "@/components/dashboard/profile-card";
import UpcomingClasses from "@/components/dashboard/upcoming-classes";
import DashboardLayout from "@/components/layout/dashboard-layout";

export default function AdminDashboard() {
  return (
    <DashboardLayout
      title="Admin Dashboard"
      subtitle="Manage the entire institution"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
          <UpcomingClasses />
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <ProfileCard />
          <CalendarWidget />
        </div>
      </div>
    </DashboardLayout>
  );
}
