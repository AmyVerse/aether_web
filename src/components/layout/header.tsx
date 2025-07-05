import { Avatar } from "@/components/ui/avatar";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FaBars, FaBell, FaSearch, FaTimes } from "react-icons/fa";

interface HeaderProps {
  onMenuClick?: () => void;
  pageTitle?: string; // Page title to display
}

export default function Header({ onMenuClick, pageTitle }: HeaderProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const pathname = usePathname();

  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Use provided pageTitle or default to Dashboard
  const getPageTitle = () => {
    return pageTitle || "Dashboard";
  };

  // Dummy notifications - you can replace with real data later
  const notifications = [
    { id: 1, title: "New session created", time: "2 min ago", type: "info" },
    {
      id: 2,
      title: "Student joined class",
      time: "5 min ago",
      type: "success",
    },
    {
      id: 3,
      title: "Assignment due tomorrow",
      time: "1 hour ago",
      type: "warning",
    },
  ];

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
    setShowSignOutModal(false);
  };

  return (
    <header className="flex items-center justify-between py-3 px-4 sm:py-4 sm:px-6 bg-white/80 backdrop-blur-sm border-b border-gray-200/50 shadow-sm z-70">
      {/* Left side - Menu + Title */}
      <div className="flex items-center gap-3 sm:gap-6 min-w-0 flex-1">
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100/80 transition-colors duration-200 group border border-gray-200/60 hover:border-gray-300/80 flex-shrink-0"
          onClick={onMenuClick}
        >
          <FaBars className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600 group-hover:text-gray-800" />
        </button>

        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <h1 className="text-lg sm:text-2xl font-[poppins] font-medium text-gray-900 tracking-tight truncate">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right side - Search, Notifications, Avatar */}
      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        {/* Search - Modern Design - Hidden on mobile, shown on tablet+ */}
        <div className="relative hidden sm:block">
          {isSearchExpanded ? (
            <div className="flex items-center gap-3 bg-gray-50/80 rounded-xl px-4 py-2 border border-gray-300/80 shadow-sm">
              <FaSearch className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search classes, sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 lg:w-64 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                autoFocus
                onBlur={() => setIsSearchExpanded(false)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setIsSearchExpanded(false);
                }}
              />
              <button
                onClick={() => setIsSearchExpanded(false)}
                className="p-1 rounded-md hover:bg-gray-200/60 transition-colors duration-200 border border-gray-200/60 hover:border-gray-300/60 flex-shrink-0"
              >
                <FaTimes className="w-3 h-3 text-gray-500" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsSearchExpanded(true)}
              className="p-2 sm:p-3 rounded-xl transition-all duration-200 group border border-gray-200/60 hover:border-gray-300/80 hover:bg-gray-100/80"
            >
              <FaSearch className="w-4 h-4 text-gray-600 group-hover:text-gray-700 transition-colors duration-200" />
            </button>
          )}
        </div>

        {/* Notifications - Modern Icon */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className={`p-2 sm:p-3 rounded-xl transition-all duration-200 group relative border ${
              showNotifications
                ? "bg-blue-50/80 border-blue-200/80 text-blue-600"
                : "border-gray-200/60 hover:border-gray-300/80 hover:bg-gray-100/80"
            }`}
          >
            <FaBell
              className={`w-4 h-4 transition-colors duration-200 ${
                showNotifications
                  ? "text-blue-600"
                  : "text-gray-600 group-hover:text-gray-700"
              }`}
            />
            <span className="absolute top-1 right-1 sm:top-2 sm:right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          </button>

          {showNotifications && (
            <>
              <div
                className="fixed inset-0 z-55"
                onClick={() => setShowNotifications(false)}
              />
              <div className="absolute right-0 top-12 sm:top-14 w-72 sm:w-80 bg-white/95 backdrop-blur-sm border-2 border-gray-400 rounded-2xl shadow-xl z-90 max-h-[80vh] overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-gray-100/80">
                  <h3 className="font-semibold text-gray-900 text-base sm:text-lg">
                    Notifications
                  </h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className="p-3 sm:p-4 border-b border-gray-50/80 hover:bg-gray-50/50 cursor-pointer transition-colors duration-200"
                    >
                      <p className="text-sm text-gray-900 font-medium">
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 sm:p-4 border-t border-gray-100/80">
                  <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium py-2 rounded-lg hover:bg-blue-50/50 transition-colors duration-200 border border-blue-200/40 hover:border-blue-300/60">
                    View All Notifications
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Avatar with Profile Menu - Modern Design */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className={`p-1 rounded-xl transition-all duration-200 border ${
              showProfileMenu
                ? "ring-2 ring-blue-200/80 border-blue-200/80 bg-blue-50/30"
                : "ring-2 ring-transparent border-gray-200/60 hover:ring-gray-200/50 hover:border-gray-300/80 hover:bg-gray-100/80"
            }`}
          >
            <Avatar
              src={user?.image}
              alt={user?.name || "User"}
              size="sm"
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl shadow-sm"
            />
          </button>

          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-55"
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 top-12 sm:top-14 w-64 sm:w-72 bg-white/95 backdrop-blur-sm border-2 border-gray-200/80 rounded-2xl shadow-xl z-90 max-h-[80vh] overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-gray-100/80">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={user?.image}
                      alt={user?.name || "User"}
                      size="md"
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-sm border border-gray-200/60"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">
                        {user?.email}
                      </p>
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-md mt-1 capitalize border border-blue-200/40">
                        {user?.role}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <button className="w-full text-left px-3 sm:px-4 py-3 text-sm text-gray-700 hover:bg-gray-50/80 rounded-xl transition-colors duration-200 font-medium border border-transparent hover:border-gray-200/60">
                    Edit Profile
                  </button>
                  <hr className="my-2 border-gray-200/60" />
                  <button
                    className="w-full text-left px-3 sm:px-4 py-3 text-sm text-red-600 hover:bg-red-50/80 rounded-xl transition-colors duration-200 font-medium border border-transparent hover:border-red-200/60"
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowSignOutModal(true);
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Sign Out Confirmation Modal - Modern Design */}
      {showSignOutModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-90 flex items-center justify-center p-4 min-h-screen">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl w-full max-w-md mx-auto my-auto border-2 border-gray-200/80 animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                Sign Out
              </h3>
              <p className="text-gray-600 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">
                Are you sure you want to sign out of your account?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  onClick={() => setShowSignOutModal(false)}
                  className="w-full sm:w-auto px-4 sm:px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100/80 hover:bg-gray-200/80 rounded-xl transition-colors duration-200 border border-gray-200/60 hover:border-gray-300/80 order-2 sm:order-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full sm:w-auto px-4 sm:px-6 py-3 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors duration-200 shadow-sm border border-red-700/80 hover:border-red-800/80 order-1 sm:order-2"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
