"use client";

import { useState, useEffect } from "react";
import { Bell, Search, Menu, User } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Header() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    // Load user profile
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setProfile(user);
    }

    // Fetch unread notifications
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/teacher/notifications/count");
        if (res.ok) {
          const data = await res.json();
          setUnreadNotifications(data.count || 0);
        }
      } catch (err) {
        console.warn("Failed to load notifications count");
        setUnreadNotifications(3); // fallback
      }
    };

    fetchNotifications();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/teacher/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery(""); // optional: clear after search
    }
  };

  const toggleSidebar = () => {
    window.dispatchEvent(new CustomEvent("toggle-sidebar"));
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-sm">
      <div className="px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Left Side */}
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-lg lg:text-xl font-bold text-gray-900">
                Teacher Dashboard
              </h1>
              <p className="text-xs text-gray-500 hidden md:block">
                Manage your classes, quizzes, and students
              </p>
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search quizzes, students..."
                className="pl-10 pr-4 py-2.5 w-48 lg:w-64 bg-gray-50 rounded-xl border border-gray-200 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                  transition placeholder-gray-400 text-sm"
              />
            </form>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => router.push("/teacher/notifications")}
                className="p-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                aria-label={`Notifications (${unreadNotifications} unread)`}
              >
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadNotifications > 0 && (
                  <span
                    className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1.5 
                    bg-red-500 text-white text-xs font-bold rounded-full 
                    flex items-center justify-center animate-pulse"
                  >
                    {unreadNotifications > 99 ? "99+" : unreadNotifications}
                  </span>
                )}
              </button>
            </div>

            {/* Avatar */}
            <div className="relative">
              {profile?.profile_image ? (
                <Image
                  src={profile.profile_image}
                  alt={profile.name || "Teacher"}
                  width={40}
                  height={40}
                  className="rounded-full object-cover border-2 border-white shadow-md"
                />
              ) : (
                <div
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 
                  flex items-center justify-center text-white font-bold text-lg
                  border-2 border-white shadow-md"
                >
                  {profile?.name?.[0]?.toUpperCase() || "T"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
