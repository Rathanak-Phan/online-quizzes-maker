"use client";

import { useRouter } from "next/navigation";
import { Bell, Globe, Search, ChevronDown, LogOut, User } from "lucide-react";
import { useState, useEffect } from "react";
import ProfileAvatarUpload from "../ui/profileavatarupload";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: number;
    name: string;
    email: string;
    role: string;
    profile_image?: string | null; // ✅ add this line
  } | null>(null);

  // Load user from localStorage when component mounts
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    if (storedUser) setUser(storedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("logout"));
    router.replace("/admin/login");
  };

  const handleProfile = () => {
    router.push("/admin/profile");
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3.5 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center flex-1">
        <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">
          Admin Dashboard
        </h1>

        {/* Optional Search Bar */}
        <div className="hidden md:flex ml-8 max-w-md w-full">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-3 lg:space-x-4">
        {/* Notification */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>

        {/* Language */}
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 text-sm font-medium">
          <Globe className="w-4 h-4" />
          <span>EN</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        {/* User Dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <ProfileAvatarUpload
              userId={user?.id || 1}
              avatarUrl={user?.profile_image || "/logo.png"}
              setUser={setUser}
            />

            <div className="hidden lg:block text-left">
              <p className="text-sm font-medium text-gray-900">
                {user?.name || "Admin"}
              </p>
              <p className="text-xs text-gray-500">
                {user?.email || "admin@example.com"}
              </p>
            </div>

            <ChevronDown className="w-4 h-4 text-gray-500 hidden lg:block" />
          </button>

          <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
            <button
              onClick={handleProfile}
              className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <User className="w-4 h-4" />
              <span className="text-sm">Profile</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
