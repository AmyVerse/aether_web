"use client";

import { useSessionStore } from "@/store/useSessionStore";
import React, { useEffect, useState } from "react";
import { FaPlus } from "react-icons/fa";
import { Button } from "../ui/button";
import { ClassroomAllocationModal } from "./class-allocation-modal";
import LoadingSpinner from "../ui/loading-spinner";

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

const getBranchColor = (branch: string) => {
  const colors = {
    CSE: "#FFF2CC",
    "CSE-AIML": "#D5E8D4",
    "CSE-DS": "#E1D5E7",
    "CSE-HCIGT": "#F8CECC",
    ECE: "#DAE8FC",
    "ECE-IoT": "#FFE6CC",
  };
  return colors[branch as keyof typeof colors] || "#F5F5F5";
};

export default function ClassroomAllocationTable() {
  const { academicYear, semesterType } = useSessionStore();
  const [allocations, setAllocations] = useState<ClassroomAllocation[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAllocations();
    fetchRooms();
  }, [academicYear, semesterType]);

  const fetchAllocations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/editor/allocations");
      if (response.ok) {
        const data = await response.json();
        setAllocations(data);
      }
    } catch (error) {
      console.error("Error fetching allocations:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/editor/rooms");
      if (response.ok) {
        const data = await response.json();
        setRooms(data.rooms || []);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  // Filter allocations for current academic year and semester type
  const filteredAllocations = allocations.filter(
    (allocation) =>
      allocation.academic_year === academicYear &&
      allocation.semester_type === semesterType,
  );

  // Get unique branches and sections dynamically
  const branches = Array.from(
    new Set(filteredAllocations.map((a) => a.branch)),
  ).sort();

  // Get all unique sections for each branch
  const getBranchSections = (branch: string) => {
    return Array.from(
      new Set(
        filteredAllocations
          .filter((a) => a.branch === branch)
          .map((a) => a.section),
      ),
    ).sort();
  };

  // Get semesters based on semester type
  const semesters = semesterType === "odd" ? [1, 3, 5, 7] : [2, 4, 6, 8];
  // Helper function to get room for specific allocation
  const getRoomForAllocation = (
    branch: string,
    section: string,
    semester: number,
    dayHalf: "first_half" | "second_half",
  ) => {
    const allocation = filteredAllocations.find(
      (a) =>
        a.branch === branch &&
        a.section === section &&
        a.semester === semester &&
        a.day_half === dayHalf,
    );
    return allocation?.room?.room_number || "";
  };

  if (loading) {
      return (
        <div className="flex items-center flex-col justify-center h-64">
          <LoadingSpinner size="lg" color="text-blue-600" />
          <p className="mt-2 text-sm text-gray-600">Loading allocation...</p>
        </div>
      );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header with Title and Button */}
      <div className="flex justify-between items-start mb-10">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">Class Allocation</h1>
          <div className="text-sm text-gray-600 flex flex-wrap gap-x-2 items-center">
            <span>Academic Year: {academicYear}</span> |
            <span>Semester Type: {semesterType.toUpperCase()}</span> |
            <span>
              Semesters: {semesterType === "odd" ? "1, 3, 5, 7" : "2, 4, 6, 8"}
            </span>{" "}
            |
            <span>
              Branches:{" "}
              {branches.length > 0 ? branches.join(", ") : "No allocations yet"}
            </span>
          </div>
        </div>

        {/* Add Allocation Button */}
        <Button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2"
        >
          <FaPlus className="w-4 h-4" />
          <span>Add Allocation</span>
        </Button>
      </div>

      {/* Allocation Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th
                rowSpan={2}
                className="border border-gray-300 p-3 bg-gray-50 text-center font-medium"
              >
                Branch
              </th>
              <th
                rowSpan={2}
                className="border border-gray-300 p-3 bg-gray-50 text-center font-medium"
              >
                Section
              </th>
              {semesters.map((semester) => (
                <th
                  key={semester}
                  colSpan={2}
                  className="border border-gray-300 p-3 bg-gray-50 text-center font-medium"
                >
                  Semester {semester}
                </th>
              ))}
            </tr>
            <tr>
              {semesters.map((semester) => (
                <React.Fragment key={semester}>
                  <th className="border border-gray-300 p-2 bg-gray-100 text-sm font-medium">
                    First Half
                  </th>
                  <th className="border border-gray-300 p-2 bg-gray-100 text-sm font-medium">
                    Second Half
                  </th>
                </React.Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {branches.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="border border-gray-300 p-8 text-center text-gray-500"
                >
                  No allocations found. Click "Add Allocation" to get started.
                </td>
              </tr>
            ) : (
              branches.map((branch) => {
                const branchSections = getBranchSections(branch);

                return branchSections.map((section, sectionIndex) => (
                  <tr key={`${branch}-${section}`}>
                    {sectionIndex === 0 && (
                      <td
                        rowSpan={branchSections.length}
                        className="border border-gray-300 p-3 text-center font-medium"
                        style={{
                          backgroundColor: getBranchColor(branch),
                        }}
                      >
                        {branch}
                      </td>
                    )}
                    <td className="border border-gray-300 p-3 text-center font-medium">
                      {section}
                    </td>
                    {semesters.map((semester) => (
                      <React.Fragment key={`${branch}-${section}-${semester}`}>
                        <td className="border border-gray-300 p-2 text-center text-sm">
                          {getRoomForAllocation(
                            branch,
                            section,
                            semester,
                            "first_half",
                          ) ? (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm font-medium">
                              {getRoomForAllocation(
                                branch,
                                section,
                                semester,
                                "first_half",
                              )}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="border border-gray-300 p-2 text-center text-sm">
                          {getRoomForAllocation(
                            branch,
                            section,
                            semester,
                            "second_half",
                          ) ? (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm font-medium">
                              {getRoomForAllocation(
                                branch,
                                section,
                                semester,
                                "second_half",
                              )}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      </React.Fragment>
                    ))}
                  </tr>
                ));
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Classroom Allocation Modal */}
      <ClassroomAllocationModal
        isOpen={showModal}
        onCloseAction={() => setShowModal(false)}
        onSuccessAction={() => {
          setShowModal(false);
          fetchAllocations();
        }}
        allocation={null}
        rooms={rooms}
        academicYear={academicYear}
        semesterType={semesterType}
      />
    </div>
  );
}
