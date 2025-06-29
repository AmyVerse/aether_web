"use client";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { FaEdit, FaGraduationCap, FaStar } from "react-icons/fa";

export default function ProfileCard() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <Card className="p-4 md:p-6">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <Avatar
            src={user?.image}
            alt={user?.name || "User"}
            size="xl"
            className="mx-auto sm:mx-0"
          />

          <div className="flex-1 text-center sm:text-left w-full">
            <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {user?.name || "User Name"}
                </h3>
                <p className="text-gray-500 text-sm">{user?.email}</p>
                <Badge variant="info" className="mt-2 capitalize">
                  {user?.role || "Student"}
                </Badge>
              </div>

              <Button variant="ghost" size="sm">
                <FaEdit className="w-4 h-4" />
              </Button>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <FaStar className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-600">
                  Rank:{" "}
                  <span className="font-semibold text-indigo-600">14</span>
                </span>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2">
                <FaGraduationCap className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600">
                  Classes:{" "}
                  <span className="font-semibold text-indigo-600">7</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
