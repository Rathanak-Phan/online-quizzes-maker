"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  School,
  FileText,
  Trophy,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
} from "lucide-react";

export default function TeacherSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);

  /* Persist sidebar state */
  useEffect(() => {
    const saved = localStorage.getItem("teacher-sidebar");
    if (saved) setCollapsed(saved === "collapsed");
  }, []);

  const toggleSidebar = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem(
      "teacher-sidebar",
      newState ? "collapsed" : "expanded"
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.dispatchEvent(new Event("logout"));
    router.replace("/login");
  };

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  /* ===================== MENU CONFIG ===================== */

  const teachingMenu = [
    { name: "Dashboard", path: "/teacher", icon: LayoutDashboard },
    { name: "Classes", path: "/teacher/classes", icon: School },
    { name: "Quizzes", path: "/teacher/quizzes", icon: FileText },
    { name: "Challenges", path: "/teacher/challenges", icon: Trophy },
  ];

  const insightMenu = [
    { name: "Analytics", path: "/teacher/analytics", icon: BarChart3 },
    { name: "Notifications", path: "/teacher/notifications", icon: Bell, badge: 3 },
  ];

  const systemMenu = [
    { name: "Settings", path: "/teacher/settings", icon: Settings },
  ];

  /* ===================== RENDER ITEM ===================== */

  const MenuItem = ({ item }: { item: any }) => {
    const active = isActive(item.path);

    return (
      <Link
        href={item.path}
        title={collapsed ? item.name : undefined}
        className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200
          ${active
            ? "bg-blue-600/20 text-white border-l-4 border-blue-500"
            : "text-gray-300 hover:bg-gray-800 hover:text-white"
          }`}
      >
        <item.icon className="w-5 h-5 shrink-0" />

        {!collapsed && (
          <>
            <span className="font-medium">{item.name}</span>

            {item.badge && (
              <span className="ml-auto text-xs bg-red-500 px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            )}
          </>
        )}
      </Link>
    );
  };

  /* ===================== UI ===================== */

  return (
    <aside
      className={`h-screen bg-gray-900 text-white flex flex-col sticky top-0 z-50
        ${collapsed ? "w-20" : "w-64"} transition-all duration-300 shadow-xl`}
    >
      {/* Logo */}
      <div className="relative px-6 py-6 border-b border-gray-800">
        {!collapsed && (
          <>
            <h2 className="text-xl font-bold">Teacher Panel</h2>
            <p className="text-xs text-gray-400 mt-1">QuizMaster System</p>
          </>
        )}

        {/* Collapse Button */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-6 bg-gray-800 p-2 rounded-full shadow-md"
        >
          <ChevronLeft
            className={`w-4 h-4 transition-transform ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto">
        {/* Teaching */}
        {!collapsed && (
          <p className="text-xs uppercase text-gray-500 px-3">Teaching</p>
        )}
        {teachingMenu.map((item) => (
          <MenuItem key={item.path} item={item} />
        ))}

        {/* Insights */}
        {!collapsed && (
          <p className="text-xs uppercase text-gray-500 px-3 pt-4">Insights</p>
        )}
        {insightMenu.map((item) => (
          <MenuItem key={item.path} item={item} />
        ))}

        {/* System */}
        {!collapsed && (
          <p className="text-xs uppercase text-gray-500 px-3 pt-4">System</p>
        )}
        {systemMenu.map((item) => (
          <MenuItem key={item.path} item={item} />
        ))}
      </nav>

      {/* Profile & Logout */}
      <div className="px-4 py-5 border-t border-gray-800">
        {!collapsed && (
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">
              T
            </div>
            <div>
              <p className="text-sm font-medium">Teacher Name</p>
              <p className="text-xs text-gray-400">teacher@email.com</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-medium transition"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && "Logout"}
        </button>
      </div>
    </aside>
  );
}
