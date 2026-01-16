"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, UserCheck, Users, LayoutTemplate } from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname.startsWith(path) || pathname === path;

  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Teachers", href: "/admin/teachers", icon: UserCheck },
    { name: "Students", href: "/admin/students", icon: Users },
    { name: "Data", href: "/admin/templates", icon: LayoutTemplate },
  ];

  return (
    <aside className="fixed left-0 top-18 overflow-hidden border border-gray-800 shadow-lg h-[90vh] max-w-[14rem] z-40">
      <div className="bg-gradient-to-b from-gray-900 to-black text-white h-full flex flex-col">
        <div className="px-4 py-3 text-xs font-semibold text-gray-400 tracking-wider">
          Admin
        </div>
        <nav className="px-3 pb-3 flex-1 overflow-y-auto space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${
                  active
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-300 hover:text-white hover:bg-gray-800/60"
                }`}
                title={item.name}
              >
                <Icon className={`w-5 h-5 ${active ? "text-blue-600" : "text-gray-400 group-hover:text-white"}`} />
                <div className="flex flex-col">
                  <span className={`text-sm font-semibold ${active ? "text-gray-900" : ""}`}>
                    {item.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
