"use client";
import MyClasses from "@/components/teacher/my-classes";
import TeacherSalutation from "@/components/teacher/teacher-salutation";
import TeacherUpcomingClasses from "@/components/teacher/upcoming-classes";
import Head from "next/head";

export default function TeacherDashboard() {
  return (
    <>
      <Head>
        <title>Dashboard | Aether</title>
      </Head>
      <div>
        {/* Page Title - Header-like appearance */}
        <div className="bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-semibold font-[poppins] text-gray-900">
            Dashboard
          </h1>
          <p className="text-sm font-[manrope] text-gray-600 mt-1">
            Welcome to your teaching dashboard
          </p>
        </div>

        {/* Main Content */}
        <div className="p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="space-y-4 sm:space-y-6">
            {/* Salutation */}
            <TeacherSalutation />

            {/* Today's Classes */}
            <TeacherUpcomingClasses />

            {/* My Classes */}
            <MyClasses />
          </div>
        </div>
      </div>
    </>
  );
}
