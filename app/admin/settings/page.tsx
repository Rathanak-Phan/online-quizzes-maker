// app/admin/settings/page.tsx
import { Globe, Bell, Shield, Palette, Mail, Lock, Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-lg text-gray-600 mt-2">
          Configure your quiz platform, manage admin preferences, and control system behavior.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button className="py-4 px-1 border-b-2 border-blue-600 text-blue-600 font-medium">
            General
          </button>
          <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
            Notifications
          </button>
          <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
            Security
          </button>
          <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700">
            Appearance
          </button>
        </nav>
      </div>

      {/* General Settings */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-4 mb-8">
          <Globe className="w-8 h-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">General Settings</h2>
        </div>

        <div className="space-y-6 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform Name
            </label>
            <input
              type="text"
              defaultValue="QuizMaster"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Support Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                defaultValue="support@quizmaster.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Language
            </label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>English (US)</option>
              <option>Spanish</option>
              <option>French</option>
              <option>Arabic</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
              <span className="text-gray-700">Allow new teacher registrations</span>
            </label>
          </div>

          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500" />
              <span className="text-gray-700">Enable ad-skipping for premium users</span>
            </label>
          </div>

          <div className="pt-4">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2 shadow-md">
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Admin Profile Section */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-4 mb-8">
          <Shield className="w-8 h-8 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-900">Admin Profile</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              defaultValue="Admin User"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              defaultValue="admin@quizmaster.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="Leave blank to keep current"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2 shadow-md">
            <Save className="w-5 h-5" />
            Update Profile
          </button>
        </div>
      </div>

      {/* Appearance Preview */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-4 mb-8">
          <Palette className="w-8 h-8 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">Appearance</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border-2 border-blue-500 rounded-lg p-4 text-center">
            <div className="bg-blue-600 h-20 rounded mb-3"></div>
            <p className="font-medium">Blue Theme (Current)</p>
          </div>
          <div className="border border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition">
            <div className="bg-purple-600 h-20 rounded mb-3"></div>
            <p className="font-medium">Purple Theme</p>
          </div>
          <div className="border border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition">
            <div className="bg-green-600 h-20 rounded mb-3"></div>
            <p className="font-medium">Green Theme</p>
          </div>
        </div>
      </div>
    </div>
  );
}