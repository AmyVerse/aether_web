"use client";

import { Button } from "@/components/ui/button";
import Dialog from "@/components/ui/dialog";
import { useToast } from "@/hooks/useToast";
import { useState } from "react";

interface Room {
  id: string;
  room_number: string;
  room_type: "Classroom" | "Lab";
  capacity: number;
  building: string;
}

interface ClassroomAllocation {
  id: string;
  academic_year: string;
  semester_type: "odd" | "even";
  semester: number;
  branch: string;
  section: string;
  room_id: string;
  day_half: "first_half" | "second_half" | null;
  room: Room;
}

interface ClassroomAllocationModalProps {
  isOpen: boolean;
  onCloseAction: () => void;
  onSuccessAction: (allocation: ClassroomAllocation) => void;
  allocation: ClassroomAllocation | null;
  rooms: Room[];
  academicYear: string;
  semesterType: "odd" | "even";
}

const BRANCHES = ["CSE", "CSE-AIML", "CSE-DS", "CSE-HCIGT", "ECE", "ECE-IoT"];
const SECTIONS = ["A", "B", "C"];
const DAY_HALVES = [
  { value: "first_half", label: "First Half (8AM-1PM)" },
  { value: "second_half", label: "Second Half (1PM-6PM)" },
];

export function ClassroomAllocationModal({
  isOpen,
  onCloseAction,
  onSuccessAction,
  allocation,
  rooms,
  academicYear,
  semesterType,
}: ClassroomAllocationModalProps) {
  const [formData, setFormData] = useState({
    semester: allocation?.semester?.toString() || "",
    branch: allocation?.branch || "",
    section: allocation?.section || "",
    room_id: allocation?.room_id || "",
    day_half: allocation?.day_half || "",
  });
  const [loading, setLoading] = useState(false);
  const { showError } = useToast();

  // Get selected room details
  const selectedRoom = rooms.find((room) => room.id === formData.room_id);
  const isLabAllocation = selectedRoom?.room_type === "Lab";

  // Get semesters based on semester type
  const getSemesters = () => {
    return semesterType === "odd" ? [1, 3, 5, 7] : [2, 4, 6, 8];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.semester ||
      !formData.branch ||
      !formData.section ||
      !formData.room_id ||
      (!isLabAllocation && !formData.day_half) // day_half required only for classrooms
    ) {
      showError("Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const url = allocation?.id
        ? `/api/editor/allocations/${allocation.id}`
        : "/api/editor/allocations";

      const method = allocation?.id ? "PUT" : "POST";

      const requestBody: any = {
        academic_year: academicYear,
        semester_type: semesterType,
        semester: parseInt(formData.semester),
        branch: formData.branch,
        section: formData.section,
        room_id: formData.room_id,
      };

      // Only include day_half for classroom allocations
      if (!isLabAllocation && formData.day_half) {
        requestBody.day_half = formData.day_half;
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const result = await response.json();
        onSuccessAction(result);
        onCloseAction();
      } else {
        const error = await response.json();
        showError(error.message || "Failed to save allocation");
      }
    } catch (error) {
      showError("Failed to save allocation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onCloseAction}
      title={`${allocation?.id ? "Edit" : "Create"} Classroom Allocation`}
      showActions={false}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Branch
          </label>
          <select
            value={formData.branch}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, branch: e.target.value }))
            }
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select branch</option>
            {BRANCHES.map((branch) => (
              <option key={branch} value={branch}>
                {branch}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Section
          </label>
          <select
            value={formData.section}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, section: e.target.value }))
            }
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select section</option>
            {SECTIONS.map((section) => (
              <option key={section} value={section}>
                Section {section}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Semester
          </label>
          <select
            value={formData.semester}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, semester: e.target.value }))
            }
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select semester</option>
            {getSemesters().map((sem: number) => (
              <option key={sem} value={sem.toString()}>
                Semester {sem}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Classroom
          </label>
          <select
            value={formData.room_id}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                room_id: e.target.value,
                // Reset day_half when switching between classroom and lab
                day_half: "",
              }))
            }
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select classroom/lab</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.room_number} ({room.building}) - {room.room_type} -
                Capacity: {room.capacity}
              </option>
            ))}
          </select>
        </div>

        {/* Day Half - Only show for classroom allocations */}
        {!isLabAllocation && formData.room_id && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Day Half
            </label>
            <select
              value={formData.day_half}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, day_half: e.target.value }))
              }
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select day half</option>
              {DAY_HALVES.map((half) => (
                <option key={half.value} value={half.value}>
                  {half.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Lab allocation note */}
        {isLabAllocation && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-center">
              <div className="text-blue-600 text-sm">
                <strong>Lab Allocation:</strong> Labs can be used at any time
                during the day. Day half selection is not required for lab
                allocations.
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCloseAction}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : allocation?.id ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
