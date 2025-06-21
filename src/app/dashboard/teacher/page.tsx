"use client";

import Sidebar from "@/components/sidebar";
import TopHeader from "@/components/topHeader";
import ProgressBanner from "@/components/progressBar";
import ProfileCard from "@/components/profile-card";
import CalendarWidget from "@/components/calendarWidget";
import UpcomingClasses from "@/components/upcomingClasses";
import { useSession } from "next-auth/react";
import WorkingHours from "@/components/teacher/workingHours";
import GroupChats from "@/components/teacher/groupChat";
import StudentTests from "@/components/teacher/studentTest";

export default function DashboardPage() {
  const session = useSession();
  const image = session?.data?.user?.image;
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <main className="flex-1 p-8">
        <TopHeader userName="Anna" userAvatar={image || "/"} />
        <div className="grid grid-cols-12 gap-6 mt-2">
          <div className="col-span-8">
            <ProgressBanner />
            <div className="flex gap-6">
              <WorkingHours />
              <GroupChats />
            </div>
            <StudentTests />
          </div>
          <div className="col-span-4 flex flex-col gap-6">
            <div className="flex gap-4">
              <ProfileCard
                name="Anna Wilson"
                email="annawilson@email.com"
                rank={14}
                classes={7}
                imageUrl={image || "/"}
                onEditProfile={() => alert("Edit profile clicked!")}
              />
            </div>
            <CalendarWidget />
            <UpcomingClasses />
          </div>
        </div>
      </main>
    </div>
  );
}
