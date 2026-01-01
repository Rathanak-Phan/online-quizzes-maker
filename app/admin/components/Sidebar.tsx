// app/admin/components/Sidebar.tsx
"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";

const menuItems = [
  { name: "Dashboard", path: "/admin", icon: "🏠" },
  { name: "Users", path: "/admin/users", icon: "👥" },
  { name: "Quizzes", path: "/admin/quizzes", icon: "📝" },
  { name: "Students", path: "/admin/students", icon: "🎓" },
  { name: "Submissions", path: "/admin/submissions", icon: "📤" },
  { name: "Reports", path: "/admin/reports", icon: "📊" },
  { name: "Audit Logs", path: "/admin/audit-logs", icon: "📜" },
  { name: "Notifications", path: "/admin/notifications", icon: "🔔" },
  { name: "Settings", path: "/admin/settings", icon: "⚙️" },
];

export default function Sidebar({ currentPath }: { currentPath: string }) {
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-gray-800">
        <h2 className="text-2xl font-bold">QuizMaster</h2>
        <p className="text-sm text-gray-400">Admin Panel</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center gap-4 px-4 py-3 rounded-lg transition ${
              currentPath === item.path
                ? "bg-blue-600 text-white shadow-lg"
                : "hover:bg-gray-800"
            }`}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-red-600 rounded-lg hover:bg-red-700 transition font-medium"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}