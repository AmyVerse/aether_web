"use client";
import { cn } from "@/lib/utils";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  FaAngleLeft,
  FaAngleRight,
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

  // Desktop collapse state
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load collapse state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar-collapsed");
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  // Save collapse state to localStorage
  const toggleCollapsed = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar-collapsed", JSON.stringify(newState));
  };

  const sidebarItems: SidebarItem[] = [
    {
      label: "Dashboard",
      href: `/dashboard`,
      icon: <FaThLarge className="w-5 h-5" />,
    },
    {
      label: "Classes",
      href: `/dashboard/class`,
      icon: <FaRegCalendarAlt className="w-5 h-5" />,
    },
    {
      label: "Messages",
      href: `/dashboard/messages`,
      icon: <FaRegEnvelope className="w-5 h-5" />,
    },
    {
      label: "Students",
      href: `/dashboard/students`,
      icon: <FaRegUser className="w-5 h-5" />,
      roles: ["teacher", "admin"],
    },
    {
      label: "Schedule",
      href: `/dashboard/schedule`,
      icon: <FaRegCalendarAlt className="w-5 h-5" />,
      roles: ["student"],
    },
    {
      label: "Reports",
      href: `/dashboard/reports`,
      icon: <FaRegChartBar className="w-5 h-5" />,
      roles: ["teacher", "admin"],
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
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-80 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-white/95 backdrop-blur-sm h-screen flex flex-col shadow-xl border-r border-gray-200/60 transition-all duration-300 ease-in-out z-70 overflow-hidden",
          "fixed md:relative",
          // Mobile behavior
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          // Desktop width based on collapsed state
          isCollapsed ? "md:w-20" : "md:w-72",
          // Mobile always full width when open
          "w-72",
        )}
      >
        {/* Desktop Collapse Toggle - only visible on desktop */}
        <div
          className={cn(
            "hidden md:block absolute top-14 right-4 z-45 transition-all duration-300",
          )}
        >
          <button
            onClick={toggleCollapsed}
            className="bg-white border-2 border-gray-300 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-gray-50 hover:border-gray-400"
          >
            {isCollapsed ? (
              <FaAngleRight className="w-4 h-4 text-gray-700" />
            ) : (
              <FaAngleLeft className="w-4 h-4 text-gray-700" />
            )}
          </button>
        </div>
        {/* Header with close button */}
        <div
          className={cn(
            "border-b border-gray-100/80 transition-all duration-300",
            isCollapsed ? "md:p-4" : "p-6 md:p-8",
          )}
        >
          {/* Mobile close button - top right */}
          <div className="flex justify-end md:hidden mb-4">
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-gray-100/80 transition-colors duration-200"
            >
              <FaTimes className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Brand - centered or icon only */}
          <div className="text-center">
            {isCollapsed ? (
              // Collapsed state - show only A icon
              <div className="hidden py-3 md:block">
                <div className="w-8 h-8  rounded-full flex items-center justify-center mx-auto">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
              </div>
            ) : (
              // Expanded state - show full branding
              <>
                <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent tracking-tight">
                  Aether
                </h1>
                <p className="text-sm font-medium text-gray-500 mt-1 tracking-wide">
                  IIIT NAGPUR
                </p>
                {/* Decorative line under IIIT NAGPUR */}
                <div className="w-32 h-0.5 bg-gray-400 mx-auto mt-3 rounded-full"></div>
              </>
            )}

            {/* Mobile always shows full branding */}
            <div className="md:hidden">
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent tracking-tight">
                Aether
              </h1>
              <p className="text-sm font-medium text-gray-500 mt-1 tracking-wide">
                IIIT NAGPUR
              </p>
              {/* Decorative line under IIIT NAGPUR */}
              <div className="w-32 h-0.5 bg-gray-400 mx-auto mt-3 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav
          className={cn(
            "flex-1 py-6 space-y-2 transition-all duration-300",
            isCollapsed ? "md:px-2" : "px-4 md:px-6",
          )}
        >
          {filteredItems.map((item) => {
            // Check if current pathname matches the item href exactly
            const isActive = pathname === item.href;
            return (
              <Link key={item.label} href={item.href} onClick={onClose}>
                <button
                  className={cn(
                    "flex items-center w-full rounded-xl text-sm font-medium transition-all duration-200 group relative",
                    isCollapsed
                      ? "md:justify-center md:px-3 md:py-3"
                      : "gap-4 px-4 py-3.5",
                    "gap-4 px-4 py-3.5 md:gap-4", // Mobile always shows full
                    isActive
                      ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200/60 shadow-sm"
                      : "text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 border border-transparent hover:border-gray-200/40",
                  )}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span
                    className={cn(
                      "transition-colors duration-200 flex-shrink-0",
                      isActive
                        ? "text-indigo-600"
                        : "text-gray-400 group-hover:text-gray-600",
                    )}
                  >
                    {item.icon}
                  </span>

                  {/* Label - hidden when collapsed on desktop, always visible on mobile */}
                  <span
                    className={cn(
                      "font-medium tracking-wide transition-all duration-300",
                      isCollapsed ? "md:hidden" : "block",
                    )}
                  >
                    {item.label}
                  </span>

                  {/* Tooltip for collapsed state */}
                  {isCollapsed && (
                    <div className="hidden md:block absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                      {item.label}
                    </div>
                  )}
                </button>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section - Settings & Sign Out - Fixed at bottom */}
        <div
          className={cn(
            "border-t border-gray-200 space-y-2 transition-all duration-300 flex-shrink-0",
            isCollapsed ? "md:p-2" : "p-4 md:p-6",
          )}
        >
          {/* Settings */}
          <Link href="/dashboard/settings" onClick={onClose}>
            <button
              className={cn(
                "flex items-center w-full rounded-xl text-sm font-medium transition-all duration-200 group border border-transparent relative",
                isCollapsed
                  ? "md:justify-center md:px-3 md:py-3"
                  : "gap-4 px-4 py-3",
                "gap-4 px-4 py-3 md:gap-4", // Mobile always shows full
                pathname === "/dashboard/settings"
                  ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-indigo-200/60 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 hover:border-gray-200/40",
              )}
              title={isCollapsed ? "Settings" : undefined}
            >
              <FaCog
                className={cn(
                  "w-5 h-5 transition-colors duration-200 flex-shrink-0",
                  pathname === "/dashboard/settings"
                    ? "text-indigo-600"
                    : "text-gray-400 group-hover:text-gray-600",
                )}
              />
              <span
                className={cn(
                  "font-medium tracking-wide transition-all duration-300",
                  isCollapsed ? "md:hidden" : "block",
                )}
              >
                Settings
              </span>

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="hidden md:block absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  Settings
                </div>
              )}
            </button>
          </Link>

          {/* Sign Out */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className={cn(
              "flex items-center w-full rounded-xl text-sm font-medium text-red-600 hover:bg-red-50/80 transition-all duration-200 group border border-transparent hover:border-red-200/40 relative",
              isCollapsed
                ? "md:justify-center md:px-3 md:py-3"
                : "gap-4 px-4 py-3",
              "gap-4 px-4 py-3 md:gap-4", // Mobile always shows full
            )}
            title={isCollapsed ? "Sign Out" : undefined}
          >
            <FaSignOutAlt className="w-5 h-5 text-red-500 group-hover:text-red-600 transition-colors duration-200 flex-shrink-0" />
            <span
              className={cn(
                "font-medium tracking-wide transition-all duration-300",
                isCollapsed ? "md:hidden" : "block",
              )}
            >
              Sign Out
            </span>

            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="hidden md:block absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                Sign Out
              </div>
            )}
          </button>

          {/* Footer - hidden when collapsed */}
          {!isCollapsed && (
            <div className="text-center text-gray-400 text-xs pt-4 border-t border-gray-100/60 transition-all duration-300">
              <p className="font-medium text-gray-500">Aether Portal v1.0</p>
              <p className="mt-1">© 2025 IIIT Nagpur</p>
            </div>
          )}

          {/* Mobile footer - always visible */}
          <div className="md:hidden text-center text-gray-400 text-xs pt-4 border-t border-gray-100/60">
            <p className="font-medium text-gray-500">Aether Portal v1.0</p>
            <p className="mt-1">© 2025 IIIT Nagpur</p>
          </div>
        </div>
      </aside>
    </>
  );
}
