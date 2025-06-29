"use client";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { FaBars, FaEllipsisV, FaRegBell, FaSearch } from "react-icons/fa";

interface TopHeaderProps {
  title?: string;
  subtitle?: string;
  onMenuClick?: () => void;
}

export default function TopHeader({
  title,
  subtitle,
  onMenuClick,
}: TopHeaderProps) {
  const { data: session } = useSession();
  const user = session?.user;

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <header className="flex items-center justify-between py-4 md:py-6 px-4 md:px-8 bg-white border-b border-gray-100">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden p-2"
          onClick={onMenuClick}
        >
          <FaBars className="w-5 h-5 text-gray-600" />
        </Button>

        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            {title || `${getGreeting()}, ${user?.name || "User"}`}
          </h1>
          <p className="text-gray-500 text-xs md:text-sm mt-1">
            {subtitle || currentDate}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <div className="flex items-center gap-2 md:gap-3">
          <Button variant="ghost" size="sm" className="p-2">
            <FaSearch className="w-4 h-4 text-gray-500" />
          </Button>

          <Button variant="ghost" size="sm" className="p-2 relative">
            <FaRegBell className="w-4 h-4 text-gray-500" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:gap-3 pl-2 md:pl-3 border-l border-gray-200">
          <Avatar src={user?.image} alt={user?.name || "User"} size="lg" />
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-gray-900">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {user?.role || "Student"}
            </p>
          </div>
          <Button variant="ghost" size="sm" className="p-1">
            <FaEllipsisV className="w-3 h-3 text-gray-400" />
          </Button>
        </div>
      </div>
    </header>
  );
}
