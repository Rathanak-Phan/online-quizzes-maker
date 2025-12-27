"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    // Dispatch logout event if used elsewhere
    window.dispatchEvent(new Event("logout"));

    // Redirect to admin login
    router.replace("/admin/login");
  };

  const menu = [
    { name: "Dashboard", path: "/admin" },
    { name: "Quizzes", path: "/admin/quizzes" },
    { name: "Students", path: "/admin/students" },
    { name: "Submissions", path: "/admin/submissions" },
    { name: "Reports", path: "/admin/reports" },
    { name: "Notifications", path: "/admin/notifications" },
    { name: "Audit Logs", path: "/admin/audit-logs" },
    { name: "Settings", path: "/admin/settings" },
  ];

  return (
    <aside className="w-64 h-screen bg-gray-900 text-white p-0 sticky top-0 z-50">
      <div className="flex flex-col justify-between min-h-screen py-5 px-3">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
        <div className="flex-1">
          <ul className="space-y-2">
            {menu.map((item) => (
              <li key={item.path}>
                <Link
                  href={item.path}
                  className={`block p-2 rounded transition-colors ${
                    pathname === item.path ? "bg-blue-600" : "hover:bg-gray-700"
                  }`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-end mt-4">
          <button
            onClick={handleLogout}
            className="w-full p-2 text-white bg-red-800 rounded hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
