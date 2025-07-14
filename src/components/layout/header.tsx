import { useDataCache } from "@/hooks/useDataCache";
import { useCachedSession } from "@/hooks/useSessionCache";
import { PanelRightClose } from "lucide-react";
import { signOut } from "next-auth/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  FaBell,
  FaCog,
  FaEnvelope,
  FaSearch,
  FaSync,
  FaUser,
} from "react-icons/fa";
import Dialog from "../ui/dialog";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { userName, userEmail, userImage, userRole } = useCachedSession();
  const { invalidateCache } = useDataCache();
  const user = {
    name: userName,
    email: userEmail,
    image: userImage,
    role: userRole,
  };

  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Dummy notifications
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

  // Dummy messages
  const messages = [
    {
      id: 1,
      sender: "John Doe",
      message: "Hey, can we reschedule the meeting?",
      time: "5 min ago",
    },
    {
      id: 2,
      sender: "Jane Smith",
      message: "Thanks for the presentation!",
      time: "1 hour ago",
    },
    {
      id: 3,
      sender: "Mike Johnson",
      message: "Please review the assignment",
      time: "2 hours ago",
    },
  ];

  const handleSignOut = async () => {
    // Clear all cache on sign out
    invalidateCache();
    await signOut({ callbackUrl: "/" });
    setShowSignOutModal(false);
  };

  const handleRefreshCache = () => {
    invalidateCache();
    window.location.reload();
  };

  // Helper function to get user initials
  const getUserInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Close all popups when clicking anywhere
  const closeAllPopups = () => {
    setShowMessages(false);
    setShowNotifications(false);
    setShowProfileMenu(false);
  };

  // Add global click listener to close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // Only close if clicking outside header area and no popup buttons are clicked
      if (
        !target.closest("header") &&
        (showMessages || showNotifications || showProfileMenu)
      ) {
        closeAllPopups();
      }
    };

    if (showMessages || showNotifications || showProfileMenu) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showMessages, showNotifications, showProfileMenu]);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Left side - Menu button and search bar */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <button
            className="md:hidden bg-white border border-gray-300 rounded-md p-2 transition-all duration-200 hover:bg-gray-100 hover:border-gray-400 flex items-center justify-center"
            onClick={onMenuClick}
          >
            <PanelRightClose className="w-4 h-4 text-gray-700" />
          </button>

          {/* Search bar */}
          <div className="relative hidden sm:block w-auto">
            <div className="flex items-center bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 w-40 sm:w-60 md:w-80">
              <FaSearch className="w-4 h-4 text-gray-500 mr-3" />
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm text-gray-700 placeholder-gray-500 focus:outline-none flex-1"
              />
            </div>
          </div>
        </div>

        {/* Right side - Cache Refresh, Messages, Notifications and Avatar */}
        <div className="flex items-center sm:gap-3">
          {/* Cache Refresh button */}
          <div className="relative">
            <button
              onClick={handleRefreshCache}
              className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors relative"
              title="Refresh all cached data"
            >
              <FaSync className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Messages icon */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(false);
                setShowProfileMenu(false);
                setShowMessages(!showMessages);
              }}
              className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors relative"
            >
              <FaEnvelope className="w-4 h-4 text-gray-600" />
              {messages.length > 0 && (
                <span className="absolute top-1 right-1 bg-blue-500 rounded-full w-2 h-2"></span>
              )}
            </button>

            {/* Messages dropdown */}
            {showMessages && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-gray-300 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Messages</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-50 last:border-b-0"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                          {user?.image ? (
                            <Image
                              src={user.image}
                              alt="User"
                              width={32}
                              height={32}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-medium text-gray-600">
                              {getUserInitials(user?.name)}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {message.sender}
                          </div>
                          <div className="text-sm text-gray-600 truncate">
                            {message.message}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            {message.time}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowMessages(false);
                setShowProfileMenu(false);
                setShowNotifications(!showNotifications);
              }}
              className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors relative"
            >
              <FaBell className="w-4 h-4 text-gray-600" />
              {notifications.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 rounded-full w-2 h-2"></span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-xl shadow-xl border border-gray-300 py-2 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer border-b border-gray-50 last:border-b-0"
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {notification.time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Avatar */}
          <div className="relative">
            <button
              onClick={() => {
                setShowMessages(false);
                setShowNotifications(false);
                setShowProfileMenu(!showProfileMenu);
              }}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors ml-2"
            >
              <div className="w-9 h-9 rounded-lg overflow-hidden bg-violet-500 flex items-center justify-center">
                {user?.image ? (
                  <Image
                    src={user.image}
                    alt={user?.name || "User"}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-white">
                    {getUserInitials(user?.name)}
                  </span>
                )}
              </div>
            </button>

            {/* Profile dropdown */}
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-64 sm:w-72 bg-white rounded-xl shadow-xl border border-gray-300 py-2 z-50">
                {/* Profile Card */}
                <div className="px-4 py-4">
                  <div className="flex items-center gap-3 sm:gap-5 mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-violet-500 flex items-center justify-center">
                      {user?.image ? (
                        <Image
                          src={user.image}
                          alt={user?.name || "User"}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-sm sm:text-md font-medium text-white">
                          {getUserInitials(user?.name)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                        {user?.name || "User"}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 truncate">
                        {user?.email || "user@example.com"}
                      </div>
                      <div className="text-xs bg-blue-100 rounded-md text-blue-600 w-fit p-1 font-medium mt-2">
                        {user?.role?.charAt(0).toUpperCase() +
                          (user?.role?.slice(1) || "User")}
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  <div className="pt-2 space-y-1">
                    <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors text-left">
                      <FaUser className="w-4 h-4 text-gray-400" />
                      <span>Account Settings</span>
                    </button>
                    <button
                      onClick={() => setShowSignOutModal(true)}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors text-left"
                    >
                      <FaCog className="w-4 h-4 text-red-400" />
                      <span>Sign out</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sign Out Confirmation Dialog */}
      <Dialog
        isOpen={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        title="Sign out"
        description="Are you sure you want to sign out?"
        confirmText="Sign out"
        cancelText="Cancel"
        onConfirm={handleSignOut}
        confirmVariant="destructive"
      />
    </header>
  );
}
