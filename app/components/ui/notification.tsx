"use client";

import { useState } from "react";
import { Bell, X } from "lucide-react";

export default function Notification() {
  const [open, setOpen] = useState(false);

  const notifications = [
    "New quiz available!",
    "Your score has been updated.",
    "Don't forget to complete your daily quiz.",
  ];

  return (
    <div>
      {/* Notification Icon */}
      <button
        onClick={() => setOpen(true)}
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        <Bell size={24} className="text-gray-700" />
        <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          ></div>

          {/* Modal content */}
          <div className="relative w-96 bg-white rounded-xl shadow-lg p-6 z-10">
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-semibold text-gray-700">Notifications</h4>
              <button onClick={() => setOpen(false)}>
                <X size={20} className="text-gray-500 hover:text-gray-700" />
              </button>
            </div>

            <ul className="flex flex-col gap-3 max-h-64 overflow-y-auto">
              {notifications.length === 0 ? (
                <li className="text-gray-500 text-sm text-center">No notifications</li>
              ) : (
                notifications.map((n, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-lg bg-gray-50 border border-gray-100 text-gray-700 text-sm hover:bg-gray-100 transition"
                  >
                    {n}
                  </li>
                ))
              )}
            </ul>

            <div className="mt-4 text-right">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
