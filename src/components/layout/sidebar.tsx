"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import {
  FaCog,
  FaRegCalendarAlt,
  FaRegChartBar,
  FaRegEnvelope,
  FaRegUser,
  FaSignOutAlt,
  FaThLarge,
  FaTimes,
} from "react-icons/fa";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
}

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  const sidebarItems: SidebarItem[] = [
    {
      label: "Dashboard",
      href: `/dashboard`,
      icon: <FaThLarge />,
    },
    {
      label: "Schedule",
      href: `/dashboard#schedule`,
      icon: <FaRegCalendarAlt />,
    },
    {
      label: "Messages",
      href: `/dashboard#messages`,
      icon: <FaRegEnvelope />,
    },
    {
      label: "Students",
      href: `/dashboard#students`,
      icon: <FaRegUser />,
      roles: ["teacher", "admin"],
    },
    {
      label: "Classes",
      href: `/dashboard#classes`,
      icon: <FaRegUser />,
      roles: ["student"],
    },
    {
      label: "Reports",
      href: `/dashboard#reports`,
      icon: <FaRegChartBar />,
      roles: ["teacher", "admin"],
    },
    {
      label: "Settings",
      href: `/dashboard#settings`,
      icon: <FaCog />,
    },
  ];

  const filteredItems = sidebarItems.filter(
    (item) => !item.roles || item.roles.includes(userRole || ""),
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-white h-screen flex flex-col justify-between rounded-r-2xl shadow-lg p-6 border-r border-gray-100 transition-transform duration-300 ease-in-out z-50",
          "fixed md:relative w-64",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Mobile close button */}
        <div className="flex justify-between items-center mb-8 md:block">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Aether</h2>
            <p className="text-sm text-gray-500">IIIT Nagpur</p>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <FaTimes className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <nav className="space-y-2">
          {filteredItems.map((item) => {
            // For dashboard navigation, the main dashboard path should be active for all
            const isActive =
              pathname === "/dashboard" && item.href.startsWith("/dashboard");
            return (
              <Link key={item.label} href={item.href} onClick={onClose}>
                <button
                  className={cn(
                    "flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <span className="text-lg">{item.icon}</span>
                  {item.label}
                </button>
              </Link>
            );
          })}
        </nav>

        {userRole === "teacher" && (
          <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-xl text-white">
            <div className="flex items-center justify-center mb-2">
              <FaRegEnvelope className="text-xl" />
            </div>
            <div className="text-sm text-center mb-3">
              Create new class chat
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full bg-white/20 hover:bg-white/30 text-white border-0"
            >
              Create class
            </Button>
          </div>
        )}

        <div className="space-y-4 mt-auto">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => signOut()}
          >
            <FaSignOutAlt className="mr-2" />
            Sign Out
          </Button>

          <div className="text-center text-gray-500 text-xs">
            <span className="block font-medium">Aether Portal v1.0</span>
            <span className="block">© 2025 IIIT Nagpur</span>
          </div>
        </div>
      </aside>
    </>
  );
}
