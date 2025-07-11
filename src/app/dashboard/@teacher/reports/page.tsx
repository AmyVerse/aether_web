"use client";
import { Button } from "@/components/ui/button"; // Adjust if using a custom Button
import { useCachedSession } from "@/hooks/useSessionCache";
import Papa from "papaparse";
import { useEffect, useRef, useState } from "react";
import { FaFileCsv, FaFileExcel } from "react-icons/fa";

interface SessionCol {
  id: string;
  date: string;
}
interface StudentRow {
  student_id: string;
  name: string;
  roll_number: string;
  [sessionId: string]: number | null | string;
}

export default function AttendanceReportPage() {
  const [report, setReport] = useState<any>({});
  const [classMeta, setClassMeta] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const { userRoleId } = useCachedSession();
  const reportRef = useRef<HTMLDivElement>(null);

  const teacherId = userRoleId;

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/teacher/reports?teacherId=${teacherId}`).then((res) =>
        res.json(),
      ),
      fetch(`/api/teacher/classes?teacherId=${teacherId}`).then((res) =>
        res.json(),
      ),
    ])
      .then(([reportData, classData]) => {
        if (reportData.success) setReport(reportData.data);
        else setError(reportData.error || "Failed to load report");

        if (classData.success) {
          const meta: any = {};
          for (const c of classData.data) {
            meta[c.id] = {
              branch: c.branch,
              section: c.section,
              semester: c.semester,
              subject_name: c.subject_name,
            };
          }
          setClassMeta(meta);
        }
      })
      .catch(() => setError("Failed to load report"))
      .finally(() => setLoading(false));
  }, [teacherId]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollButton(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-x-hidden">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-3xl font-semibold font-[poppins] text-gray-900">
          Attendance Reports
        </h1>
        <p className="text-sm font-[manrope] text-gray-600 mt-2">
          View and generate attendance reports for your classes.
        </p>
      </div>

      <div className="p-4 sm:p-6 space-y-6 overflow-x-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            Loading report...
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">{error}</div>
        ) : Object.keys(report).length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No classes found.
          </div>
        ) : (
          <>
            {/* Report Content */}
            <div ref={reportRef} className="space-y-10">
              {Object.entries(report).map(([classId, classReport]: any) => {
                const meta = classMeta[classId] || {};

                // Individual class CSV export
                const exportClassToCSV = () => {
                  const rows: any[] = [];
                  const header = [
                    `Subject: ${meta?.subject_name || "N/A"} | Branch: ${meta?.branch} | Section: ${meta?.section} | Semester: ${meta?.semester}`,
                  ];
                  // Format date to dd/mm/yyyy
                  const formatDate = (dateStr: string) => {
                    const d = new Date(dateStr);
                    if (isNaN(d.getTime())) return dateStr;
                    const day = String(d.getDate()).padStart(2, "0");
                    const month = String(d.getMonth() + 1).padStart(2, "0");
                    const year = d.getFullYear();
                    return `${day}/${month}/${year}`;
                  };
                  const subHeader = [
                    "Roll No",
                    "Name",
                    ...classReport.sessions.map((s: any) => formatDate(s.date)),
                  ];
                  rows.push(header);
                  rows.push(subHeader);
                  classReport.students.forEach((student: StudentRow) => {
                    const row = [
                      student.roll_number,
                      student.name,
                      ...classReport.sessions.map((s: SessionCol) =>
                        student[s.id] === 1
                          ? "1"
                          : student[s.id] === 0
                            ? "0"
                            : "-",
                      ),
                    ];
                    rows.push(row);
                  });
                  const csv = Papa.unparse(rows, { quotes: false });
                  const blob = new Blob([csv], {
                    type: "text/csv;charset=utf-8;",
                  });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url;
                  link.setAttribute(
                    "download",
                    `attendance_report_${meta?.branch}_${meta?.section}_Sem_${meta?.semester}.csv`,
                  );
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                };

                return (
                  <div key={classId} className="space-y-4 overflow-hidden">
                    {/* Header Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                      <div className="flex justify-between gap-2 items-center">
                        <h2 className="text-xl font-semibold text-blue-700">
                          {meta.subject_name ? (
                            <>
                              {meta.subject_name} : {meta.branch} {meta.section}{" "}
                              (Sem {meta.semester})
                            </>
                          ) : (
                            <>Class: {classId}</>
                          )}
                        </h2>
                        <Button
                          onClick={exportClassToCSV}
                          className="bg-blue-600 text-white sm:text-sm text-xs flex items-center"
                          width="w-fit"
                          height="h-4"
                          variant="primary"
                        >
                          <FaFileExcel className="mr-2" /> Export
                        </Button>
                      </div>
                    </div>

                    {/* Table Section */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                      <div className="overflow-auto sm:w-[calc(100vw-19rem)] w-[calc(100vw-4rem)]">
                        <div className="overflow-x-scroll w-full">
                          <table className="w-full border-collapse text-xs sm:text-sm">
                            <thead>
                              <tr>
                                <th className="border px-2 py-1 bg-gray-100 whitespace-nowrap">
                                  Roll No
                                </th>
                                <th className="border px-2 py-1 bg-gray-100 whitespace-nowrap">
                                  Name
                                </th>
                                {classReport.sessions.map((s: SessionCol) => (
                                  <th
                                    key={s.id}
                                    className="border px-2 py-1 bg-gray-50 whitespace-nowrap text-center min-w-[80px]"
                                  >
                                    {(() => {
                                      const d = new Date(s.date);
                                      if (isNaN(d.getTime())) return s.date;
                                      const day = String(d.getDate()).padStart(
                                        2,
                                        "0",
                                      );
                                      const month = String(
                                        d.getMonth() + 1,
                                      ).padStart(2, "0");
                                      const year = d.getFullYear();
                                      return `${day}/${month}/${year}`;
                                    })()}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {classReport.students.map(
                                (student: StudentRow) => (
                                  <tr key={student.student_id}>
                                    <td className="border px-2 py-1 font-mono whitespace-nowrap">
                                      {student.roll_number}
                                    </td>
                                    <td className="border px-2 py-1 whitespace-nowrap">
                                      {student.name}
                                    </td>
                                    {classReport.sessions.map(
                                      (s: SessionCol) => (
                                        <td
                                          key={s.id}
                                          className="border px-2 py-1 text-center whitespace-nowrap min-w-[80px]"
                                        >
                                          {student[s.id] === 1 ? (
                                            <span className="text-green-600 font-bold">
                                              1
                                            </span>
                                          ) : student[s.id] === 0 ? (
                                            <span className="text-red-600 font-bold">
                                              0
                                            </span>
                                          ) : (
                                            <span className="text-gray-400">
                                              -
                                            </span>
                                          )}
                                        </td>
                                      ),
                                    )}
                                  </tr>
                                ),
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* spacer */}
      <div className="h-20 sm:h-24 md:h-32 lg:h-40"></div>
    </div>
  );
}
