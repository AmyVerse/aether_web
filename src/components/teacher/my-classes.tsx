"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  FaCalendarAlt,
  FaChevronRight,
  FaClock,
  FaMapMarkerAlt,
  FaPlus,
  FaSpinner,
  FaUsers,
} from "react-icons/fa";
import AddClassModal from "./add-class-modal";

interface TeacherClass {
  id: string;
  subject_name: string;
  subject_code: string;
  branch: string;
  section: string;
  day: string;
  time_slot: string;
  room_number: string;
  students?: number;
}

interface ClassTileProps {
  classData: TeacherClass;
  onViewDetails: (classId: string) => void;
  onCreateSession: (classId: string) => void;
}

function ClassTile({
  classData,
  onViewDetails,
  onCreateSession,
}: ClassTileProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-gray-900 mb-1">
            {classData.subject_name}
          </h3>
          <p className="text-gray-600 text-sm">
            {classData.subject_code} • {classData.branch} - Section{" "}
            {classData.section}
          </p>
        </div>
        <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
          {classData.day}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FaClock className="text-gray-400" />
          <span>{classData.time_slot}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <FaMapMarkerAlt className="text-gray-400" />
          <span>{classData.room_number}</span>
        </div>
        {classData.students && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaUsers className="text-gray-400" />
            <span>{classData.students} students</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => onViewDetails(classData.id)}
          variant="outline"
          size="sm"
          className="flex-1"
        >
          View Details
          <FaChevronRight className="ml-2 text-xs" />
        </Button>
        <Button
          onClick={() => onCreateSession(classData.id)}
          className="flex-1 bg-blue-900 hover:bg-blue-700 text-white"
          size="sm"
        >
          Create Session
        </Button>
      </div>
    </div>
  );
}

interface MyClassesProps {
  fullView?: boolean;
}

export default function MyClasses({ fullView = false }: MyClassesProps) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [loading, setLoading] = useState(true);
  const { showError } = useToast();
  const router = useRouter();

  // Fetch teacher's classes from API
  useEffect(() => {
    fetchclassTeachers();
  }, []);

  const fetchclassTeachers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/teacher/classes");
      const data = await response.json();

      if (data.success) {
        setClasses(data.data);
      } else {
        showError("Failed to fetch your classes");
      }
    } catch (error) {
      showError("An error occurred while fetching classes");
    } finally {
      setLoading(false);
    }
  };

  const handleClassAdded = () => {
    // Refresh the classes list after adding a new class
    fetchclassTeachers();
  };

  const handleViewDetails = (classId: string) => {
    if (fullView) {
      // Navigate to specific class detail
      window.location.href = `/dashboard/class/${classId}`;
    } else {
      // Navigate to classes overview
      window.location.href = `/dashboard/class`;
    }
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
        showError("Session created successfully!");
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

  // If a class is selected, show the detail view
  if (loading) {
    return (
      <div className="bg-gray-50 p-6 rounded-xl">
        <div className="flex items-center justify-center py-12">
          <FaSpinner className="animate-spin text-blue-600 text-xl mr-2" />
          <span className="text-gray-600">Loading your classes...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 p-6 rounded-xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">My Classes</h2>
          <p className="text-gray-600 text-sm">
            Manage your assigned classes and create sessions
          </p>
        </div>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <FaPlus className="mr-2" />
          Add Class
        </Button>
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-12">
          <FaCalendarAlt className="text-gray-300 text-4xl mx-auto mb-4" />
          <h3 className="text-gray-500 text-lg font-medium mb-2">
            No classes assigned
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Get started by adding your first class
          </p>
          <Button onClick={() => setIsAddModalOpen(true)} variant="outline">
            <FaPlus className="mr-2" />
            Add Your First Class
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((classData) => (
            <ClassTile
              key={classData.id}
              classData={classData}
              onViewDetails={handleViewDetails}
              onCreateSession={handleCreateSession}
            />
          ))}
        </div>
      )}

      <AddClassModal
        isOpen={isAddModalOpen}
        onCloseAction={() => {
          setIsAddModalOpen(false);
          handleClassAdded();
        }}
      />
    </div>
  );
}
