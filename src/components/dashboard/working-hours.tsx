"use client";
import { Card } from "@/components/ui/card";

interface WorkingHoursProps {
  className?: string;
}

export default function WorkingHours({ className }: WorkingHoursProps) {
  // Dummy data - in real app, this would come from props or API
  const days = ["S", "M", "T", "W", "T", "F", "S"];
  const onlineData = [4, 7, 5, 8, 2, 4, 3];
  const offlineData = [2, 3, 2, 1, 1, 0, 2];

  return (
    <Card className={className}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-700">Working Hours</h3>
        <span className="text-xs text-gray-400">This Week</span>
      </div>

      <div className="flex items-end h-24 gap-2 mb-4">
        {days.map((day, index) => (
          <div
            key={`${day}-${index}`}
            className="flex flex-col items-center flex-1"
          >
            <div className="relative w-full flex flex-col items-center">
              <div
                className="bg-blue-500 rounded-t w-3/4 min-h-[2px]"
                style={{ height: `${onlineData[index] * 6}px` }}
                title={`Online: ${onlineData[index]}h`}
              />
              <div
                className="bg-green-400 rounded-b w-3/4 min-h-[2px]"
                style={{ height: `${offlineData[index] * 6}px` }}
                title={`Offline: ${offlineData[index]}h`}
              />
            </div>
            <span className="text-xs text-gray-400 mt-2">{day}</span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 text-center text-xs">
        <div>
          <div className="text-gray-500">Total</div>
          <div className="font-semibold text-gray-700">36h 45m</div>
        </div>
        <div>
          <div className="text-gray-500">Online</div>
          <div className="font-semibold text-blue-600">22h 30m</div>
        </div>
        <div>
          <div className="text-gray-500">In-Person</div>
          <div className="font-semibold text-green-600">14h 15m</div>
        </div>
      </div>
    </Card>
  );
}
