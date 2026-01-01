// app/admin/notifications/page.tsx
import { Bell, Mail, Megaphone, Clock, CheckCircle } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Notifications</h1>
        <p className="text-lg text-gray-600 mt-2">
          Manage and send notifications to users, teachers, or everyone.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Sent</p>
              <p className="text-4xl font-bold mt-2">1,248</p>
            </div>
            <Megaphone className="w-12 h-12 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Delivered</p>
              <p className="text-4xl font-bold mt-2">1,189</p>
            </div>
            <CheckCircle className="w-12 h-12 opacity-50" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Pending</p>
              <p className="text-4xl font-bold mt-2">59</p>
            </div>
            <Clock className="w-12 h-12 opacity-50" />
          </div>
        </div>
      </div>

      {/* Send Notification Form */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Send New Notification</h2>

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient
            </label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Users</option>
              <option>All Teachers</option>
              <option>All Students</option>
              <option>Specific User (by email)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              placeholder="e.g., New Quiz Available!"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              rows={5}
              placeholder="Write your notification message here..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition shadow-md"
            >
              Send Notification
            </button>
            <button
              type="button"
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Save as Draft
            </button>
          </div>
        </form>
      </div>

      {/* Recent Notifications */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Notifications</h2>

        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between p-5 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Bell className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">New Math Quiz Released!</h3>
                  <p className="text-sm text-gray-600">Sent to all students • 2 hours ago</p>
                  <p className="text-sm text-gray-500 mt-1">Delivered to 542 users</p>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full font-medium">
                  Delivered
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <button className="text-blue-600 hover:text-blue-700 font-medium">
            View All Notifications →
          </button>
        </div>
      </div>
    </div>
  );
}