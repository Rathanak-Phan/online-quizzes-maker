"use client";

import { Bell, Mail, AlertCircle, Trophy } from "lucide-react";

// Mock notifications grouped by date
const mockNotifications = {
  Today: [
    { id: 1, type: "quiz", message: "Sok Piseth submitted Math Quiz", time: "2 hours ago", read: false },
    { id: 2, type: "student", message: "New student joined Science 9A", time: "4 hours ago", read: true },
  ],
  Yesterday: [
    { id: 3, type: "challenge", message: "Challenge ending soon", time: "1 day ago", read: false },
  ],
  Older: [
    { id: 4, type: "announcement", message: "School closed on Friday", time: "3 days ago", read: true },
  ],
};

// Map notification type to icon and color
const typeMap: Record<string, { icon: any; color: string }> = {
  quiz: { icon: Trophy, color: "text-yellow-500" },
  student: { icon: Mail, color: "text-blue-500" },
  challenge: { icon: AlertCircle, color: "text-orange-500" },
  announcement: { icon: Bell, color: "text-gray-500" },
};

export default function NotificationsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Notifications</h1>

      {Object.keys(mockNotifications).map((dateGroup) => {
        const notifications = mockNotifications[dateGroup as keyof typeof mockNotifications];
        if (notifications.length === 0) return null;

        return (
          <div key={dateGroup} className="mb-8">
            {/* Group header */}
            <h2 className="text-gray-500 font-semibold mb-4">{dateGroup}</h2>

            {/* Notification list */}
            <div className="bg-white rounded-3xl shadow-sm border divide-y divide-gray-100">
              {notifications.map((n) => {
                const Icon = typeMap[n.type]?.icon || Bell;
                const color = typeMap[n.type]?.color || "text-gray-400";

                return (
                  <div
                    key={n.id}
                    className={`p-6 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition ${
                      n.read ? "" : "bg-blue-50"
                    }`}
                  >
                    <div className="relative">
                      <Icon className={`w-6 h-6 ${color}`} />
                      {!n.read && <span className="absolute top-0 right-0 w-2 h-2 bg-blue-600 rounded-full animate-pulse" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{n.message}</p>
                      <p className="text-sm text-gray-500 mt-1">{n.time}</p>
                    </div>
                    {!n.read && (
                      <button className="text-sm text-blue-600 hover:underline">Mark as read</button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Empty state */}
      {Object.values(mockNotifications).flat().length === 0 && (
        <div className="bg-gray-50 rounded-3xl p-10 text-center text-gray-500">
          <Bell className="mx-auto w-12 h-12 text-gray-400 mb-4" />
          No notifications yet.
        </div>
      )}
    </div>
  );
}
