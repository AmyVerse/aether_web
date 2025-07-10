"use client";

import { Button } from "@/components/ui/button";
import ClassDescription from "@/components/ui/class-detail/class-description";
import ClassSessions from "@/components/ui/class-detail/class-sessions";
import ClassStudents from "@/components/ui/class-detail/class-students";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/useToast";
import { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";

interface ClassDetails {
  id: string;
  subject_name: string;
  subject_code: string;
  branch: string;
  section: string;
  day?: string; // fallback for legacy
  time_slot?: string; // fallback for legacy
  room_number: string;
  academic_year: string;
  semester_type: string;
  notes?: string;
  timings?: { day: string; time_slot: string }[]; // normalized timings
}

interface Student {
  id: string;
  name: string;
  email: string;
  roll_number: string;
  batch_year: number;
}

interface ClassStudent {
  id: string;
  student: Student;
  enrolled_at: string;
  is_active: boolean;
  notes?: string;
}

interface ClassSession {
  id: string;
  date: string;
  start_time: string;
  end_time?: string;
  status: "Scheduled" | "Completed";
  notes?: string;
  created_at: string;
}

interface ClassDetailViewProps {
  classId: string;
  onBackAction?: () => void;
}

export default function ClassDetailView({
  classId,
  onBackAction,
}: ClassDetailViewProps) {
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [classStudents, setClassStudents] = useState<ClassStudent[]>([]);
  const [classSessions, setClassSessions] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { showSuccess, showError } = useToast();

  const handleBack = () => {
    if (onBackAction) {
      onBackAction();
    } else {
      window.location.href = "/dashboard/class";
    }
  };

  useEffect(() => {
    fetchClassDetails();
    fetchClassStudents();
    fetchClassSessions();
  }, [classId]);

  const fetchClassDetails = async () => {
    try {
      const response = await fetch(`/api/teacher/classes/${classId}`);
      const data = await response.json();

      if (data.success) {
        setClassDetails(data.data);
      } else {
        showError("Failed to fetch class details");
      }
    } catch (error) {
      showError("An error occurred while fetching class details");
    } finally {
      setLoading(false);
    }
  };

  const fetchClassStudents = async () => {
    try {
      const response = await fetch(`/api/teacher/classes/${classId}/students`);
      const data = await response.json();

      if (data.success) {
        setClassStudents(data.data);
      } else {
        showError("Failed to fetch class students");
      }
    } catch (error) {
      showError("An error occurred while fetching students");
    }
  };

  const fetchClassSessions = async () => {
    try {
      const response = await fetch(`/api/teacher/classes/${classId}/sessions`);
      const data = await response.json();

      if (data.success) {
        setClassSessions(data.data);
      } else {
        showError("Failed to fetch class sessions");
      }
    } catch (error) {
      showError("An error occurred while fetching sessions");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" color="text-blue-700" className="mr-2" />
        <span className="text-gray-600">Loading class details...</span>
      </div>
    );
  }

  if (!classDetails) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Class not found</p>
        <Button onClick={handleBack} variant="outline" className="mt-4">
          <FaArrowLeft className="mr-2" />
          Back to Classes
        </Button>
      </div>
    );
  }

  // Patch: fallback for legacy day/time_slot, but prefer timings array if present
  let timings: { day: string; time_slot: string }[] = [];
  if (Array.isArray(classDetails.timings) && classDetails.timings.length > 0) {
    timings = classDetails.timings;
  } else if (classDetails.day && classDetails.time_slot) {
    timings = [{ day: classDetails.day, time_slot: classDetails.time_slot }];
  }

  return (
    <div>
      {/* Class Description with Create Session Button in Header */}
      <ClassDescription
        classDetails={{ ...classDetails, timings }}
        studentCount={classStudents.length}
        onBack={handleBack}
      />

      {/* Main Content */}
      <div className="px-3 sm:px-4 pb-36 md:px-5 lg:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Class Sessions - First on mobile, Left column on desktop */}
          <div className="order-1">
            <ClassSessions
              classId={classId}
              classSessions={classSessions}
              onSessionsChangeAction={fetchClassSessions}
            />
          </div>

          {/* Class Students - Second on mobile, Right column on desktop */}
          <div className="order-2">
            <ClassStudents
              classId={classId}
              classStudents={classStudents}
              onStudentsChangeAction={fetchClassStudents}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
