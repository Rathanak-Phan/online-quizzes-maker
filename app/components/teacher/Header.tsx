"use client";

import { useRouter } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { useState, useEffect } from "react";
import ProfileAvatarUpload from "../ui/profileavatarupload";

export default function TeacherHeader() {
  const router = useRouter();

  const [user, setUser] = useState<{
    id: number;
    name: string;
    email: string;
    role: string;
    profile_image?: string | null;
  } | null>(null);

  /* ================= LOAD USER ================= */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      if (parsed.role === "teacher") setUser(parsed);
    }
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        {/* ================= LEFT ================= */}
        <div className="flex items-center gap-6 flex-1">
          {/* Page Title */}
          <h1 className="text-lg lg:text-xl font-semibold text-gray-900">
            Teacher Dashboard
          </h1>

          {/* Search (Desktop Only) */}
          <div className="hidden md:block max-w-md w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search classes, quizzes, students..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white
                  transition"
              />
            </div>
          </div>
        </div>

        {/* ================= RIGHT ================= */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button
            className="relative p-2 rounded-lg hover:bg-gray-100 transition"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white" />
          </button>

          {/* Profile Avatar (No Dropdown) */}
          <ProfileAvatarUpload
            userId={user?.id || 1}
            avatarUrl={user?.profile_image || "/default-avatar.png"}
            setUser={setUser}
          />
        </div>
      </div>
    </header>
  );
}
