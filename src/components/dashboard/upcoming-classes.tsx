"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FaClock, FaMapMarkerAlt, FaUsers } from "react-icons/fa";

interface ClassItem {
  id: string;
  subject: string;
  time: string;
  room: string;
  students?: number;
  status: "upcoming" | "ongoing" | "completed";
}

const mockClasses: ClassItem[] = [
  {
    id: "1",
    subject: "Data Structures",
    time: "10:00 AM",
    room: "Room 101",
    students: 45,
    status: "upcoming",
  },
  {
    id: "2",
    subject: "Machine Learning",
    time: "2:00 PM",
    room: "Lab 202",
    students: 32,
    status: "upcoming",
  },
  {
    id: "3",
    subject: "Algorithms",
    time: "4:00 PM",
    room: "Room 105",
    students: 38,
    status: "upcoming",
  },
];

export default function UpcomingClasses() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Today&apos;s Classes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {mockClasses.map((classItem) => (
            <div
              key={classItem.id}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors gap-3"
            >
              <div className="flex-1 w-full">
                <h4 className="font-medium text-gray-900">
                  {classItem.subject}
                </h4>
                <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-1 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <FaClock className="w-3 h-3" />
                    {classItem.time}
                  </div>
                  <div className="flex items-center gap-1">
                    <FaMapMarkerAlt className="w-3 h-3" />
                    {classItem.room}
                  </div>
                  {classItem.students && (
                    <div className="flex items-center gap-1">
                      <FaUsers className="w-3 h-3" />
                      {classItem.students}
                    </div>
                  )}
                </div>
              </div>

              <Badge
                variant={
                  classItem.status === "upcoming"
                    ? "info"
                    : classItem.status === "ongoing"
                      ? "warning"
                      : "success"
                }
                className="flex-shrink-0"
              >
                {classItem.status}
              </Badge>
            </div>
          ))}

          {mockClasses.length === 0 && (
            <p className="text-center text-gray-500 py-4">
              No classes scheduled for today
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
