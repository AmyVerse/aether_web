"use client";
import { useCachedSession } from "@/hooks/useSessionCache";
import { cn } from "@/lib/utils";
import { PanelLeftClose, PanelRightClose } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import {
  FaCog,
  FaHome,
  FaRegCalendarAlt,
  FaRegChartBar,
  FaRegEnvelope,
  FaRegQuestionCircle,
  FaRegUser,
  FaSignOutAlt,
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
  userRole?: string;
}

export default function Sidebar({
  isOpen = true,
  onClose,
  userRole,
}: SidebarProps) {
  const pathname = usePathname();
  const { userRole: cachedUserRole } = useCachedSession();
  // Use passed userRole or fallback to cached session role
  const currentUserRole = userRole || cachedUserRole;

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
      icon: <FaHome className="w-5 h-5" />,
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
    (item) => !item.roles || item.roles.includes(currentUserRole || ""),
  );

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm md:hidden z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-white/95 backdrop-blur-sm h-screen flex flex-col shadow-xl border-r border-gray-200/60 transition-all duration-300 ease-in-out",
          "fixed md:relative z-50",
          // Mobile behavior
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          // Desktop width based on collapsed state
          isCollapsed ? "md:w-20" : "md:w-72",
          // Mobile always full width when open
          "w-72",
        )}
      >
        {/* Header with branding and collapse toggle */}
        <div
          className={cn(
            "border-b border-gray-100/80 transition-all duration-300",
            "p-6 md:p-8", // Keep consistent padding always
          )}
        >
          {/* Mobile close button - top right */}
          <div className="flex justify-end md:hidden mb-4">
            <button
              onClick={onClose}
              className="bg-white border border-gray-300 rounded-md p-2 transition-all duration-200 hover:bg-gray-100 hover:border-gray-400 flex items-center justify-center"
            >
              <PanelLeftClose className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          {/* Desktop: Branding and collapse toggle inline */}
          <div className="hidden md:flex self-center items-center justify-center min-h-[60px]">
            <div className="flex-1 text-left">
              {!isCollapsed && (
                <div>
                  <h1 className="text-2xl font-[manrope] md:text-3xl font-bold bg-gray-800 bg-clip-text text-transparent tracking-tight">
                    Aether
                  </h1>
                  <p className="text-sm font-[manrope] font-medium text-gray-500 mt-1 tracking-wide">
                    IIIT NAGPUR
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={toggleCollapsed}
              className={cn(
                "bg-white border border-gray-300 rounded-md p-2 transition-all duration-200 hover:bg-gray-100 hover:border-gray-400 flex items-center justify-center",
              )}
            >
              {isCollapsed ? (
                <PanelRightClose className="w-5 h-5 text-gray-700" />
              ) : (
                <PanelLeftClose className="w-5 h-5 text-gray-700" />
              )}
            </button>
          </div>

          {/* Brand - centered or icon only */}
          <div className="text-center">
            {/* Mobile always shows full branding */}
            <div className="md:hidden">
              <h1 className="text-2xl font-[manrope] md:text-3xl font-bold bg-gray-800 bg-clip-text text-transparent tracking-tight">
                Aether
              </h1>
              <p className="text-sm font-[manrope] font-medium text-gray-500 mt-1 tracking-wide">
                IIIT NAGPUR
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav
          className={cn(
            "flex-1 py-6 space-y-2 transition-all duration-300 px-4",
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
                      ? "md:justify-center md:px-2 md:py-3"
                      : "gap-4 px-4 py-3.5",
                    "gap-4 px-4 py-3.5", // Mobile always shows full
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
                    <div className="hidden md:block absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[9999]">
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
            "p-4 md:p-6", // Keep consistent padding always
          )}
        >
          {/* Settings */}
          <div className="min-h-[44px] flex items-center">
            <Link
              href="/dashboard/settings"
              onClick={onClose}
              className="w-full"
            >
              <button
                className={cn(
                  "flex items-center w-full rounded-xl text-sm font-medium transition-all duration-200 group border border-transparent relative",
                  isCollapsed
                    ? "md:justify-center md:px-2 md:py-3"
                    : "gap-4 px-4 py-3",
                  "gap-4 px-4 py-3", // Mobile always shows full
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
                  <div className="hidden md:block absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[9999]">
                    Settings
                  </div>
                )}
              </button>
            </Link>
          </div>

          {/* Sign Out */}
            <div className="min-h-[44px] flex items-center">
            <Link
              href="/faqs"
              onClick={onClose}
              className="w-full"
            >
              <button
              className={cn(
                "flex items-center w-full rounded-xl text-sm font-medium transition-all duration-200 group border border-transparent relative",
                isCollapsed
                ? "md:justify-center md:px-2 md:py-3"
                : "gap-4 px-4 py-3",
                "gap-4 px-4 py-3", // Mobile always shows full
              )}
              title={isCollapsed ? "FAQs" : undefined}
              >
              <FaRegQuestionCircle className="w-5 h-5 transition-colors text-gray-400 hover:text-black duration-200 flex-shrink-0" />
              <span
                className={cn(
                "font-medium tracking-wide transition-all duration-300",
                isCollapsed ? "md:hidden" : "block",
                )}
              >
                FAQs
              </span>

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="hidden md:block absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-[9999]">
                FAQs
                </div>
              )}
              </button>
            </Link>
            </div>

          {/* Footer */}
          <div className="hidden min-h-[56px] md:flex items-center justify-center">
            <div className="text-center text-gray-400 text-xs pt-4 border-t border-gray-100/60 transition-all duration-300 w-full">
              {isCollapsed ? (
                <div className="min-h-[32px] flex items-center justify-center">
                  <p className="font-medium text-gray-500">v1.0</p>
                </div>
              ) : (
                <div className="min-h-[32px] flex flex-col justify-center">
                  <p className="font-medium text-gray-500">
                    Aether Portal v1.0
                  </p>
                  <p className="mt-1">© 2025 IIIT Nagpur</p>
                </div>
              )}
            </div>
          </div>

          {/* Mobile footer - always full */}
          <div className="md:hidden text-center text-gray-400 text-xs pt-4 border-t border-gray-100/60">
            <p className="font-medium text-gray-500">Aether Portal v1.0</p>
            <p className="mt-1">© 2025 IIIT Nagpur</p>
          </div>
        </div>
      </aside>
    </>
  );
}
