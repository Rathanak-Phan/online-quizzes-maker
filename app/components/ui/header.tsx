"use client";

import { useState, useEffect } from "react";
import { Menu, X, Bell, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Notification from "./notification";

export default function Header() {
  const [open, setOpen] = useState(false); // mobile menu
  const [user, setUser] = useState<{
    id: number;
    name: string;
    role: string;
    profileImage?: string;
  } | null>(null);
  const [openDropdown, setOpenDropdown] = useState(false); // dropdown menu
  const router = useRouter();

  const handleNotifications = () => {
    alert("Notifications clicked!");
  };

  // Update user state on login/logout
  useEffect(() => {
    const updateUser = () => {
      const storedUser = JSON.parse(
        localStorage.getItem("user") || sessionStorage.getItem("user") || "null"
      );
      setUser(storedUser);
    };

    updateUser();
    window.addEventListener("login", updateUser);
    window.addEventListener("logout", updateUser);

    return () => {
      window.removeEventListener("login", updateUser);
      window.removeEventListener("logout", updateUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    window.dispatchEvent(new Event("logout"));
    router.push("/");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".dropdown")) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <header className="w-full bg-white shadow-sm fixed z-100">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-bold text-blue-600">
          <Link href="/">Online-Quiz</Link>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-8 text-gray-700 font-medium">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          <Link href="/quizzes" className="hover:text-blue-600">
            Quizzes
          </Link>
          <Link href="/categories" className="hover:text-blue-600">
            Categories
          </Link>
          <Link href="/leaderboard" className="hover:text-blue-600">
            Leaderboard
          </Link>
        </nav>

        {/* Desktop Profile / Auth Buttons */}
        <div className="hidden md:flex items-center gap-4 relative dropdown">
          <Notification />

          {!user ? (
            <>
              <Link
                href="/login"
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50"
              >
                Register
              </Link>
            </>
          ) : (
            <div className="relative">
              {/* Profile Image */}
              <div
                className="relative cursor-pointer"
                onClick={() => setOpenDropdown(!openDropdown)}
              >
                <img
                  src={user.profileImage || "/logo.png"}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-600"
                />

                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                  <ChevronDown className="w-3 h-3 text-gray-600" />
                </div>
              </div>

              {/* Dropdown Menu */}
              {openDropdown && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-lg shadow-2xl overflow-hidden z-50 border border-gray-200">
                  {/* User Header */}
                  <div className="px-5 pt-5 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-4">
                      <img
                        src={user.profileImage || "/logo.png"}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-300"
                      />
                      <div>
                        <h3 className="text-gray-900 text-lg font-bold">
                          {user.name}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* See all profiles button - light style */}
                  <button className="w-full px-5 py-3 bg-gray-100 hover:bg-gray-200 transition-colors">
                    <div className="flex items-center justify-center gap-2 text-gray-800 text-base font-medium">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      See all profiles
                    </div>
                  </button>

                  {/* Menu Items with Icons */}
                  <div className="py-2">
                    <Link
                      href="/profile"
                      onClick={() => setOpenDropdown(false)}
                      className="flex items-center justify-between px-5 py-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <svg
                          className="w-6 h-6 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span className="text-gray-800 text-base">Profile</span>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setOpenDropdown(false)}
                      className="flex items-center justify-between px-5 py-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <svg
                          className="w-6 h-6 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <span className="text-gray-800 text-base">
                          Settings & privacy
                        </span>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>

                    <Link
                      href="/help"
                      onClick={() => setOpenDropdown(false)}
                      className="flex items-center justify-between px-5 py-4 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <svg
                          className="w-6 h-6 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="12" r="10" strokeWidth={2} />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"
                          />
                          <line
                            x1="12"
                            y1="17"
                            x2="12.01"
                            y2="17"
                            strokeWidth={2}
                          />
                        </svg>
                        <span className="text-gray-800 text-base">
                          Help & support
                        </span>
                      </div>
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>

                    <button
                      onClick={() => alert("Feedback form opens")}
                      className="flex items-center justify-between w-full px-5 py-4 hover:bg-gray-100 transition-colors text-left"
                    >
                      <div className="flex items-center gap-4">
                        <svg
                          className="w-6 h-6 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        <div>
                          <span className="text-gray-800 text-base">
                            Give feedback
                          </span>
                          <p className="text-gray-500 text-xs">Ctrl B</p>
                        </div>
                      </div>
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200" />

                  {/* Log out */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-between w-full px-5 py-4 hover:bg-gray-100 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <svg
                        className="w-6 h-6 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      <span className="text-gray-800 text-base">Log out</span>
                    </div>
                  </button>

                  {/* Bottom Links */}
                  <div className="px-5 py-3 text-gray-500 text-xs border-t border-gray-200">
                    <div className="flex flex-wrap gap-x-3">
                      <a href="/privacy" className="hover:underline">
                        Privacy
                      </a>
                      ·
                      <a href="/terms" className="hover:underline">
                        Terms
                      </a>
                      ·
                      <a href="/about" className="hover:underline">
                        About
                      </a>
                      ·
                      <a href="/contact" className="hover:underline">
                        Contact
                      </a>
                      ·<span>More ›</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white px-6 pb-6 shadow-lg">
          <nav className="flex flex-col gap-4 text-gray-700 font-medium">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
            <Link href="/quizzes" className="hover:text-blue-600">
              Quizzes
            </Link>
            <Link href="/categories" className="hover:text-blue-600">
              Categories
            </Link>
            <Link href="/leaderboard" className="hover:text-blue-600">
              Leaderboard
            </Link>
          </nav>

          {/* Mobile Profile Dropdown */}
          {user && (
            <div className="mt-4 flex flex-col items-center gap-2 relative dropdown">
              <img
                src={user.profileImage || "/default-profile.png"}
                alt={user.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-blue-600 cursor-pointer"
                onClick={() => setOpenDropdown(!openDropdown)}
              />

              {openDropdown && (
                <div className="absolute top-16 right-0 w-40 bg-white shadow-lg rounded-xl flex flex-col z-50">
                  <Link
                    href="/profile"
                    className="px-4 py-2 hover:bg-blue-50 text-gray-700 rounded-t-xl"
                  >
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="px-4 py-2 hover:bg-blue-50 text-gray-700"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-b-xl text-left"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
