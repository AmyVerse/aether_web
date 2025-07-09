import TeacherStats from "@/components/teacher/teacher-stats";
import ClassesList from "@/components/teacher/classes-list";
import Head from "next/head";

export default function ClassesPage() {
  return (
    <>
      <Head>
        <title>Classes | Aether</title>
      </Head>
      <div className="min-h-screen">
        {/* Page Title - Header-like appearance */}
        <div className="bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 lg:px-8 py-4">
          <h1 className="text-3xl font-semibold font-[poppins] text-gray-900">
            Classes
          </h1>
          <p className="text-sm font-[manrope] text-gray-600 mt-2">
            Manage and view all your assigned classes
          </p>
        </div>

        {/* Stats */}
        <TeacherStats />

        {/* Classes List */}
        <ClassesList />
      </div>
    </>
  );
}
