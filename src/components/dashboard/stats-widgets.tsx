"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: "positive" | "negative";
  icon?: React.ReactNode;
  description?: string;
}

export function StatsCard({
  title,
  value,
  change,
  changeType,
  icon,
  description,
}: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            {description && (
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            )}
          </div>

          {icon && <div className="text-indigo-600 text-2xl">{icon}</div>}
        </div>

        {change !== undefined && (
          <div className="flex items-center mt-4">
            <div
              className={`flex items-center gap-1 text-sm ${
                changeType === "positive" ? "text-green-600" : "text-red-600"
              }`}
            >
              {changeType === "positive" ? (
                <FaArrowUp className="w-3 h-3" />
              ) : (
                <FaArrowDown className="w-3 h-3" />
              )}
              {Math.abs(change)}%
            </div>
            <span className="text-sm text-gray-500 ml-2">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface QuickActionsProps {
  role: string;
}

export function QuickActions({ role }: QuickActionsProps) {
  const getActionsByRole = () => {
    switch (role) {
      case "teacher":
        return [
          { label: "Mark Attendance", action: () => {} },
          { label: "Create Assignment", action: () => {} },
          { label: "Schedule Class", action: () => {} },
          { label: "View Reports", action: () => {} },
        ];
      case "student":
        return [
          { label: "View Assignments", action: () => {} },
          { label: "Check Attendance", action: () => {} },
          { label: "Join Class", action: () => {} },
          { label: "Download Notes", action: () => {} },
        ];
      default:
        return [
          { label: "View Profile", action: () => {} },
          { label: "Settings", action: () => {} },
        ];
    }
  };

  const actions = getActionsByRole();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              onClick={action.action}
              className="justify-start"
            >
              {action.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
