"use client";
import MyClasses from "@/components/teacher/my-classes";

export default function ClassesPage() {
  return (
    <div className="p-3 sm:p-4 md:p-6 lg:p-8">
      <MyClasses fullView={true} />
    </div>
  );
}
