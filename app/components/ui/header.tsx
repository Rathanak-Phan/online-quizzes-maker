"use client";

import { useState, useEffect } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Notification from "./notification";

export default function Header() {
  const [open, setOpen] = useState(false); // mobile menu
  const [user, setUser] = useState<{
    id: number;
    name: string;
    email: string;
    role: string;
    profileImage?: string;
  } | null>(null);
  const [openDropdown, setOpenDropdown] = useState(false); // dropdown menu
  const router = useRouter();

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

  // --- UPDATED LOGIC ---
  const isLinkDisabled = (targetRole: string) => {
    if (!user) return true; // Not logged in -> Disable everything
    
    // If user is Teacher, they can access EVERYTHING (return false = not disabled)
    if (user.role === 'teacher') return false;

    // If user is Student (or others), they can only access their specific role
    return user.role !== targetRole;
  };

  return (
    <header className="w-full bg-white shadow-sm fixed z-50 top-0 left-0 right-0">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-bold text-blue-600">
          <Link href="/">QuizHub</Link>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-8 text-gray-700 font-medium">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          
          <Link 
            href="/teacher" 
            className={`transition-colors ${
              isLinkDisabled("teacher") 
                ? "text-gray-300 pointer-events-none cursor-not-allowed" 
                : "hover:text-blue-600"
            }`}
            aria-disabled={isLinkDisabled("teacher")}
          >
            Teacher
          </Link>
          
          <Link 
            href="/student" 
            className={`transition-colors ${
              isLinkDisabled("user") 
                ? "text-gray-300 pointer-events-none cursor-not-allowed" 
                : "hover:text-blue-600"
            }`}
            aria-disabled={isLinkDisabled("user")}
          >
            Student
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
                className="relative cursor-pointer flex items-center gap-2"
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
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-lg shadow-2xl overflow-hidden z-50 border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* User Header */}
                  <div className="px-5 pt-5 pb-4 border-b border-gray-200 bg-gray-50/50">
                    <div className="flex items-center gap-4">
                      <img
                        src={user.profileImage || "/logo.png"}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-300"
                      />
                      <div className="overflow-hidden">
                        <h3 className="text-gray-900 text-lg font-bold truncate">
                          {user.name}
                        </h3>
                        <p className="text-gray-500 text-xs truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium capitalize">
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* See all profiles button */}
                  <button className="w-full px-5 py-3 bg-white hover:bg-gray-50 transition-colors border-b border-gray-100">
                    <div className="flex items-center justify-center gap-2 text-blue-600 text-sm font-medium">
                      See all profiles
                    </div>
                  </button>

                  {/* Menu Items */}
                  <div className="py-2">
                    <Link
                      href="/profile"
                      onClick={() => setOpenDropdown(false)}
                      className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <span className="text-gray-700 font-medium">Profile</span>
                      </div>
                    </Link>

                    <Link
                      href="/settings"
                      onClick={() => setOpenDropdown(false)}
                      className="flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <span className="text-gray-700 font-medium">Settings & privacy</span>
                      </div>
                    </Link>

                    <div className="border-t border-gray-100 my-2" />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center justify-between px-5 py-3 hover:bg-red-50 transition-colors group text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-50 rounded-lg group-hover:bg-white group-hover:shadow-sm transition-all">
                          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                        </div>
                        <span className="text-red-700 font-medium">Log out</span>
                      </div>
                    </button>
                  </div>

                  {/* Footer Links */}
                  <div className="px-5 py-3 bg-gray-50 text-xs text-gray-500 border-t border-gray-200">
                    <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center">
                      <Link href="/privacy" className="hover:text-gray-900 hover:underline">Privacy</Link>
                      <span>·</span>
                      <Link href="/terms" className="hover:text-gray-900 hover:underline">Terms</Link>
                      <span>·</span>
                      <Link href="/help" className="hover:text-gray-900 hover:underline">Help</Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <button className="md:hidden p-2 text-gray-600" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full left-0 top-[72px] max-h-[calc(100vh-72px)] overflow-y-auto">
          <nav className="flex flex-col p-4 gap-2">
            <Link 
              href="/" 
              className="p-3 hover:bg-gray-50 rounded-lg text-gray-700 font-medium"
              onClick={() => setOpen(false)}
            >
              Home
            </Link>
            
            <Link 
              href="/teacher" 
              className={`p-3 rounded-lg font-medium ${
                isLinkDisabled("teacher") 
                  ? "text-gray-300 pointer-events-none" 
                  : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              }`}
              onClick={() => setOpen(false)}
            >
              Teacher Dashboard
            </Link>
            
            <Link 
              href="/student" 
              className={`p-3 rounded-lg font-medium ${
                isLinkDisabled("user") 
                  ? "text-gray-300 pointer-events-none" 
                  : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
              }`}
              onClick={() => setOpen(false)}
            >
              Student Dashboard
            </Link>

            <div className="border-t border-gray-100 my-2" />

            {!user ? (
              <div className="flex flex-col gap-3 p-2">
                <Link
                  href="/login"
                  className="w-full py-3 bg-blue-600 text-white rounded-xl text-center font-semibold"
                  onClick={() => setOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="w-full py-3 border border-blue-600 text-blue-600 rounded-xl text-center font-semibold"
                  onClick={() => setOpen(false)}
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="p-2">
                <div className="flex items-center gap-3 mb-4 p-2 bg-gray-50 rounded-lg">
                  <img
                    src={user.profileImage || "/logo.png"}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-medium text-center hover:bg-red-100"
                >
                  Log out
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}