"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ContentLoader from "@/components/ui/content-loader";
import {
  useInvalidateRelatedCache,
  useTeacherClassesCache,
} from "@/hooks/useDataCache";
import { useCachedSession } from "@/hooks/useSessionCache";
import { useToast } from "@/hooks/useToast";
import { useSessionStore } from "@/store/useSessionStore";
import { useEffect, useState } from "react";
import {
  FaBookOpen,
  FaClock,
  FaEye,
  FaMapMarkerAlt,
  FaPlus,
} from "react-icons/fa";
import AddClassModal from "./add-class-modal";

interface TeacherClass {
  id: string;
  allocation_type: string;
  assigned_at: string;
  is_active: boolean;
  notes?: string;
  entry_details: {
    subject_name: string;
    subject_code: string;
    subject_short_name?: string;
    branch: string;
    section: string;
    room_number: string;
    academic_year: string;
    semester_type: string;
    semester?: number;
    room_type?: string;
    // For regular classes
    entry_id?: string;
    allocation_id?: string;
    day_half?: string;
    entry_notes?: string;
    entry_color?: string;
    // For lab entries
    lab_id?: string;
    day?: string;
    start_time?: string;
    end_time?: string;
    duration_hours?: number;
    lab_notes?: string;
    lab_color?: string;
  };
  timings: { id?: string; day: string; time_slot: string }[];
}

interface ProcessedClass extends TeacherClass {
  subject_name: string;
  subject_code: string;
  branch: string;
  section: string;
  room_number: string;
  subject_display: string;
  dayTimePairs: { day: string; time_slot: string }[];
  class_location: string;
  class_group: string | null;
}

interface TeacherClassesResponse {
  success: boolean;
  data: TeacherClass[];
}

interface MyClassesProps {
  fullView?: boolean;
}

export default function MyClasses({ fullView = false }: MyClassesProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [classes, setClasses] = useState<ProcessedClass[]>([]);
  const [loading, setLoading] = useState(true);
  const { sessionData } = useCachedSession();
  const { showError, showSuccess } = useToast();
  const { invalidateAfterClassOperation, invalidateAfterSessionOperation } =
    useInvalidateRelatedCache();

  // Fetch teacher's classes from API
  const academicYear = useSessionStore((s) => s.academicYear);
  const semesterType = useSessionStore((s) => s.semesterType);
  const { fetchTeacherClasses, lastRefresh } = useTeacherClassesCache();

  useEffect(() => {
    fetchTeacherClassesData();
  }, [sessionData, academicYear, semesterType, lastRefresh]);

  const addClassModal = (
    <AddClassModal
      isOpen={isAddModalOpen}
      onCloseAction={() => {
        setIsAddModalOpen(false);
        handleClassAdded();
      }}
    />
  );

  const fetchTeacherClassesData = async () => {
    if (!sessionData?.user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // Use cached fetch
      const result = (await fetchTeacherClasses(
        academicYear,
        semesterType,
      )) as TeacherClassesResponse;

      if (result?.success) {
        // Club timings for each class
        const processedClasses = result.data.map(
          (classItem: TeacherClass): ProcessedClass => {
            const entryDetails = classItem.entry_details;

            // For labs, create timing from embedded day/time info
            let timings = classItem.timings;
            if (
              classItem.allocation_type === "lab" &&
              entryDetails.day &&
              entryDetails.start_time &&
              entryDetails.end_time
            ) {
              timings = [
                {
                  day: entryDetails.day,
                  time_slot: `${entryDetails.start_time}-${entryDetails.end_time}`,
                },
              ];
            }

            return {
              ...classItem,
              subject_name: entryDetails.subject_name,
              subject_code: entryDetails.subject_code,
              branch: entryDetails.branch,
              section: entryDetails.section,
              room_number: entryDetails.room_number,
              timings: timings,
              subject_display: entryDetails.subject_name,
              notes:
                entryDetails.entry_notes ||
                entryDetails.lab_notes ||
                classItem.notes,
              dayTimePairs: timings,
              class_location: entryDetails.room_number,
              class_group:
                entryDetails.branch && entryDetails.section
                  ? `${entryDetails.branch} : ${entryDetails.section}`
                  : null,
            };
          },
        );
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

  const handleClassAdded = () => {
    // Invalidate related cache and refresh the classes list
    invalidateAfterClassOperation();
  };

  const handleViewDetails = (classId: string) => {
    // Navigate to specific class detail using nanoid
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
          notes: "Session created from classes overview",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        showSuccess("Session created successfully!");

        // Invalidate session cache for this class
        invalidateAfterSessionOperation(classId);

        // Redirect to attendance page
        window.location.href = `/dashboard/class/${classId}/session/${data.data.id}`;
      } else {
        const error = await response.json();
        showError(error.error || "Failed to create session");
      }
    } catch (error) {
      showError("An error occurred while creating session");
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FaBookOpen className="w-5 h-5 text-green-600" />
            My Classes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ContentLoader />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {addClassModal}
      <div>
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4 sm:gap-0">
              <CardTitle className="text-lg flex items-center gap-2">
                <FaBookOpen className="w-5 h-5 text-green-600" />
                My Classes
                <span className="text-sm font-normal text-gray-500">
                  • {classes.length}{" "}
                  {classes.length === 1 ? "class" : "classes"}
                </span>
              </CardTitle>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => (window.location.href = "/dashboard/class")}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  <FaEye className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">View All</span>
                  <span className="sm:hidden">All</span>
                </button>
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
          </CardHeader>
          <CardContent>
            <div className="w-full max-sm:max-max-h-[40rem] max-sm:overflow-y-scroll">
              {classes.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {classes.map((classItem) => (
                    <div
                      key={classItem.id}
                      className="flex flex-col justify-between p-4 rounded-xl border border-gray-300 bg-white hover:border-gray-400 hover:shadow-md transition-all duration-200 min-h-[200px]"
                    >
                      <div className="flex-1">
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold text-gray-900 text-lg">
                              {classItem.subject_display}
                            </h4>
                            <div
                              className={`px-2 py-1 rounded-md text-xs font-medium ${
                                classItem.allocation_type === "lab"
                                  ? "bg-purple-100 text-purple-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {classItem.allocation_type.toUpperCase()}
                            </div>
                          </div>
                          <div className="mb-2 space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-medium text-gray-700">
                                Semester:
                              </span>
                              <span className="text-gray-600">
                                {classItem.entry_details.semester || "N/A"}
                              </span> |
                              <span className="font-medium text-gray-700">
                                Class:
                              </span>
                              <span className="text-gray-600">
                                {classItem.branch}-{classItem.section}
                              </span>
                            </div>
                          </div>
                          {/* Day/Time pairs */}
                          {classItem.dayTimePairs &&
                            classItem.dayTimePairs.length > 0 && (
                              <div className="mb-2 flex flex-col gap-1 text-sm text-gray-700 font-medium">
                                {classItem.dayTimePairs.map((pair, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-2"
                                  >
                                    <FaClock className="w-3 h-3" />
                                    <span>
                                      {pair.day}:{" "}
                                      <span className="text-gray-500">
                                        {pair.time_slot}
                                      </span>
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          <div className="space-y-1 text-sm text-gray-500">
                            {/* Removed old time_slots display, now shown as day/time pairs above */}
                            <div className="flex items-center gap-1.5">
                              <FaMapMarkerAlt className="w-3.5 h-3.5" />
                              <span>{classItem.class_location}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-col sm:flex-row">
                        <button
                          onClick={() => handleViewDetails(classItem.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 text-sm font-medium rounded-lg transition-colors duration-200"
                        >
                          <FaEye className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">View Details</span>
                          <span className="sm:hidden">View</span>
                        </button>
                        <button
                          onClick={() => handleCreateSession(classItem.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                        >
                          <FaPlus className="w-3.5 h-3.5" />
                          Session
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 w-full">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Classes Assigned
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Get started by adding your first class to begin teaching.
                  </p>
                  <Button
                    onClick={() => setIsAddModalOpen(true)}
                    variant="outline"
                  >
                    <FaPlus className="mr-2" />
                    Add Your First Class
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
