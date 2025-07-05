"use client";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Student {
  id: string;
  name: string;
  avatar?: string;
}

interface Test {
  id: string;
  name: string;
  deadline: string;
  student: Student;
  status: "Active" | "Reviewed" | "Not viewed" | "Overdue";
}

interface StudentTestsProps {
  className?: string;
}

const getStatusVariant = (status: Test["status"]) => {
  switch (status) {
    case "Active":
      return "primary";
    case "Reviewed":
      return "success";
    case "Not viewed":
      return "warning";
    case "Overdue":
      return "destructive";
    default:
      return "secondary";
  }
};

export default function StudentTests({ className }: StudentTestsProps) {
  // Dummy data - in real app, this would come from props or API
  const tests: Test[] = [
    {
      id: "1",
      name: "Composition in Web Design",
      deadline: "June 09, 2024",
      student: { id: "1", name: "Marie Stephens", avatar: "/profile.png" },
      status: "Active",
    },
    {
      id: "2",
      name: "Responsive vs. Adaptive Design",
      deadline: "June 10, 2024",
      student: { id: "2", name: "Barbara Carter", avatar: "/profile.png" },
      status: "Active",
    },
    {
      id: "3",
      name: "CSS Grid System Fundamentals",
      deadline: "June 10, 2024",
      student: { id: "3", name: "Daniel Evans", avatar: "/profile.png" },
      status: "Reviewed",
    },
    {
      id: "4",
      name: "8 Point Grid System in UX",
      deadline: "June 11, 2024",
      student: { id: "4", name: "Paul Robinson", avatar: "/profile.png" },
      status: "Not viewed",
    },
  ];

  return (
    <Card className={className}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-700">Student Tests</h3>
        <Button
          variant="ghost"
          width="auto"
          padding="py-2 px-4"
          className="text-blue-600"
        >
          All Tests
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-500 border-b border-gray-100">
              <th className="font-normal pb-3 text-left">Test Name</th>
              <th className="font-normal pb-3 text-left">Deadline</th>
              <th className="font-normal pb-3 text-left">Student</th>
              <th className="font-normal pb-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {tests.map((test) => (
              <tr
                key={test.id}
                className="border-b border-gray-50 hover:bg-gray-25"
              >
                <td className="py-3">
                  <button className="text-blue-600 hover:text-blue-700 font-medium text-left">
                    {test.name}
                  </button>
                </td>
                <td className="py-3 text-gray-600">{test.deadline}</td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <Avatar
                      src={test.student.avatar}
                      fallback={test.student.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                      size="sm"
                    />
                    <span className="text-gray-700">{test.student.name}</span>
                  </div>
                </td>
                <td className="py-3">
                  <Badge variant={getStatusVariant(test.status)}>
                    {test.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
