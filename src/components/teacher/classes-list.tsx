"use client";

import { Button } from "@/components/ui/button";
import ContentLoader from "@/components/ui/content-loader";
import {
  useClassDetailsCache,
  useSessionsCache,
  useTeacherClassesCache,
} from "@/hooks/useDataCache";
import { useCachedSession } from "@/hooks/useSessionCache";
import { useToast } from "@/hooks/useToast";
import { useSessionStore } from "@/store/useSessionStore";
import { useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaChevronDown,
  FaChevronRight,
  FaClock,
  FaEye,
  FaHistory,
  FaMapMarkerAlt,
  FaPlus,
  FaUsers,
} from "react-icons/fa";
import AddClassModal from "./add-class-modal";

interface TeacherClass {
  id: string;
  timetable_entry_id?: string;
  subject_name: string;
  subject_code: string;
  branch: string;
  section: string;
  room_number: string;
  notes?: string;
  timings?: { day: string; time_slot: string }[];
  student_count?: number;
  session_count?: number;
}

interface ProcessedClass {
  id: string;
  subject_display: string;
  class_location: string;
  class_group: string | null;
  class_type_label?: string;
  student_count?: number;
  session_count?: number;
  timing_day: string;
  timing_time: string;
  time_sort: number;
}

interface TeacherClassesResponse {
  success: boolean;
  data: TeacherClass[];
}

const DAYS_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function ClassesList() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [classes, setClasses] = useState<ProcessedClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(
    new Set(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]),
  );
  const { sessionData } = useCachedSession();
  const { showError, showSuccess } = useToast();

  const academicYear = useSessionStore((s) => s.academicYear);
  const semesterType = useSessionStore((s) => s.semesterType);

  // Cache hooks
  const { fetchTeacherClasses: fetchCachedTeacherClasses, lastRefresh } =
    useTeacherClassesCache();
  const { fetchClassStudents } = useClassDetailsCache();
  const { fetchClassSessions, invalidateSessions } = useSessionsCache();

  useEffect(() => {
    fetchTeacherClasses();
  }, [sessionData, academicYear, semesterType, lastRefresh]);

  const fetchTeacherClasses = async () => {
    if (!sessionData?.user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Use cached teacher classes data
      const result = (await fetchCachedTeacherClasses(
        academicYear,
        semesterType,
      )) as any;

      if (result.success) {
        // For each class, create a ProcessedClass for each timing
        const processedClasses: ProcessedClass[] = [];
        for (const classItem of result.data) {
          if (Array.isArray(classItem.timings)) {
            for (const timing of classItem.timings) {
              const [startTime] = timing.time_slot.split("-");
              const [hour, minute] = startTime.split(":").map(Number);
              const period = hour >= 12 ? "PM" : "AM";
              const displayHour =
                hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
              const formattedTime = `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
              const timeSortValue = hour * 60 + minute;
              // Fetch real-time student count and session count using cached data
              let studentCount = 0;
              let sessionCount = 0;
              try {
                const studentsData = (await fetchClassStudents(
                  classItem.id,
                )) as any;
                if (studentsData.success) {
                  studentCount = studentsData.data.length;
                }
                const sessionsData = (await fetchClassSessions(
                  classItem.id,
                )) as any;
                if (sessionsData.success) {
                  sessionCount = sessionsData.data.length;
                }
              } catch (error) {
                console.error(
                  `Error fetching data for class ${classItem.id}:`,
                  error,
                );
              }
              processedClasses.push({
                id: classItem.id,
                subject_display: classItem.subject_name,
                class_location: classItem.room_number,
                class_group:
                  classItem.branch && classItem.section
                    ? `${classItem.branch} - ${classItem.section}`
                    : null,
                class_type_label: classItem.notes || "",
                student_count: studentCount,
                session_count: sessionCount,
                timing_day: timing.day,
                timing_time: formattedTime,
                time_sort: timeSortValue,
              });
            }
          }
        }
        setClasses(processedClasses);
      } else {
        throw new Error("API returned error");
      }
    } catch (err) {
      console.error("Error fetching teacher classes:", err);
      showError(err instanceof Error ? err.message : "Failed to load classes");
    } finally {
      setLoading(false);
    }
  };

  const toggleDay = (day: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(day)) {
      newExpanded.delete(day);
    } else {
      newExpanded.add(day);
    }
    setExpandedDays(newExpanded);
  };

  const handleViewDetails = (classId: string) => {
    window.location.href = `/dashboard/class/${classId}`;
  };

  const handleCreateSession = async (classId: string) => {
    const today = new Date().toISOString().split("T")[0];
    const currentTime = new Date().toTimeString().split(" ")[0].substring(0, 5);

    try {
      const response = await fetch(`/api/teacher/classes/${classId}/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: today,
          start_time: currentTime,
          notes: "Session created from classes list",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess("Session created successfully!");
        // Invalidate sessions cache after creating new session
        invalidateSessions(classId);
        window.location.href = `/dashboard/class/${classId}/session/${data.data.id}`;
      } else {
        const error = await response.json();
        showError(error.error || "Failed to create session");
      }
    } catch (error) {
      showError("An error occurred while creating session");
    }
  };

  const handleClassAdded = () => {
    fetchTeacherClasses();
  };

  const addClassModal = (
    <AddClassModal
      isOpen={isAddModalOpen}
      onCloseAction={() => {
        setIsAddModalOpen(false);
        handleClassAdded();
      }}
    />
  );

  // Group classes by day
  const classesByDay = DAYS_ORDER.reduce(
    (acc, day) => {
      acc[day] = classes
        .filter((cls) => cls.timing_day === day)
        .sort((a, b) => a.time_sort - b.time_sort);
      return acc;
    },
    {} as Record<string, ProcessedClass[]>,
  );

  if (loading) {
    return (
      <div className="p-2 sm:p-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                My Classes Schedule
              </h2>
            </div>
          </div>
          <div className="p-4">
            <ContentLoader />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {addClassModal}
      <div className="p-2 sm:p-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4 sm:gap-0">
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">
                  My Classes Schedule
                </h2>
                <span className="text-sm font-normal text-gray-500">
                  • {classes.length}{" "}
                  {classes.length === 1 ? "class" : "classes"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => {
                    const allDays = new Set(DAYS_ORDER);
                    setExpandedDays(
                      expandedDays.size === DAYS_ORDER.length
                        ? new Set()
                        : allDays,
                    );
                  }}
                  variant="outline"
                  className="text-sm px-3 py-2"
                >
                  {expandedDays.size === DAYS_ORDER.length
                    ? "Collapse All"
                    : "Expand All"}
                </Button>
                <Button
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 text-sm flex-1 sm:flex-initial"
                >
                  <FaPlus className="w-3.5 h-3.5 mr-2" />
                  <span className="hidden sm:inline">Add Class</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4">
            <div className="space-y-3">
              {DAYS_ORDER.map((day) => {
                const dayClasses = classesByDay[day];
                const isExpanded = expandedDays.has(day);

                if (dayClasses.length === 0) return null;

                return (
                  <div
                    key={day}
                    className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggleDay(day)}
                      className={`w-full p-4 flex items-center justify-between transition-all duration-200 ${
                        isExpanded
                          ? "bg-gray-100 hover:bg-gray-100 border-b border-gray-200"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isExpanded ? (
                          <FaChevronDown
                            className={`w-4 h-4 ${isExpanded ? "text-gray-600" : "text-gray-600"}`}
                          />
                        ) : (
                          <FaChevronRight
                            className={`w-4 h-4 ${isExpanded ? "text-gray-600" : "text-gray-600"}`}
                          />
                        )}
                        <h3
                          className={`text-lg font-semibold ${isExpanded ? "text-blue-900" : "text-gray-900"}`}
                        >
                          {day}
                        </h3>
                        <span
                          className={`text-sm px-3 py-1 rounded-full ${
                            isExpanded
                              ? "bg-blue-100 text-blue-700"
                              : "bg-white text-gray-500"
                          }`}
                        >
                          {dayClasses.length}{" "}
                          {dayClasses.length === 1 ? "Class" : "Classes"}
                        </span>
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-4 bg-white">
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                          {dayClasses.map((classItem) => (
                            <div
                              key={classItem.id}
                              className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50 bg-white hover:border-gray-300 hover:shadow-md transition-all duration-300 group"
                            >
                              <div className="mb-5">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="font-semibold text-gray-900 text-base group-hover:text-blue-600 transition-colors">
                                    {classItem.subject_display}
                                  </h4>
                                  <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                                    {classItem.class_type_label}
                                  </span>
                                </div>

                                {classItem.class_group && (
                                  <p className="text-base text-gray-600 font-medium mb-3">
                                    {classItem.class_group}
                                  </p>
                                )}

                                <div className="space-y-2 grid-flow-col columns-2 text-base text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <FaClock className="w-3.5 h-3.5 text-green-600" />
                                    <span className="font-medium">
                                      {classItem.timing_time}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <FaMapMarkerAlt className="w-3.5 h-3.5 text-red-600" />
                                    <span>{classItem.class_location}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <FaUsers className="w-3.5 h-3.5 text-purple-600" />
                                    <span>
                                      {classItem.student_count} students
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <FaHistory className="w-3.5 h-3.5 text-gray-600" />
                                    <span>
                                      {classItem.session_count} sessions
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      handleViewDetails(classItem.id)
                                    }
                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 text-sm font-medium rounded-lg transition-colors duration-200"
                                  >
                                    <FaEye className="w-3 h-3" />
                                    Details
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleCreateSession(classItem.id)
                                    }
                                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                                  >
                                    <FaPlus className="w-3 h-3" />
                                    Session
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {classes.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Classes Assigned
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Contact your administrator to get classes assigned to you.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
