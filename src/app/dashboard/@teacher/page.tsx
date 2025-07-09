"use client";

import MyClasses from "@/components/teacher/my-classes";
import TeacherSalutation from "@/components/teacher/teacher-salutation";
import TeacherUpcomingClasses from "@/components/teacher/upcoming-classes";
import { useSessionStore } from "@/store/useSessionStore";
import Head from "next/head";

export default function TeacherDashboard() {
  const academicYear = useSessionStore((s) => s.academicYear);
  const setAcademicYear = useSessionStore((s) => s.setAcademicYear);
  const semesterType = useSessionStore((s) => s.semesterType);
  const setSemesterType = useSessionStore((s) => s.setSemesterType);

  return (
    <>
      <Head>
        <title>Dashboard | Aether</title>
      </Head>
      <div>
        {/* Page Title - Header-like appearance */}
        <div className="bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-3xl font-semibold font-[poppins] text-gray-900">
              Dashboard
            </h1>
            <p className="text-sm font-[manrope] text-gray-600 mt-1">
              Welcome to your teaching dashboard
            </p>
          </div>
          {/* Academic Year & Semester Filter */}
          <div className="flex items-center gap-4 mt-2 sm:mt-0">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Academic Year:
              </label>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="px-2 py-1 border border-gray-300 rounded bg-gray-50 text-sm w-32"
              >
                {/* Generate 3 years: previous, current, next in 2024-2025 format */}
                {(() => {
                  const now = new Date();
                  const y = now.getFullYear();
                  const years = [
                    `${y - 1}-${y}`,
                    `${y}-${y + 1}`,
                    `${y + 1}-${y + 2}`,
                  ];
                  return years.map((yy) => (
                    <option key={yy} value={yy}>
                      {yy}
                    </option>
                  ));
                })()}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">
                Semester:
              </label>
              <select
                value={semesterType}
                onChange={(e) =>
                  setSemesterType(e.target.value as "odd" | "even")
                }
                className="px-2 py-1 border border-gray-300 rounded bg-gray-50 text-sm w-16"
              >
                <option value="odd">Odd</option>
                <option value="even">Even</option>
              </select>
            </div>
          </div>
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
