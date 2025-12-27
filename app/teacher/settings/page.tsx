"use client";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile & Settings</h1>
      <div className="bg-white rounded-3xl shadow-sm border p-8">
        <div className="flex items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center text-white text-3xl font-bold">
            T
          </div>
          <div>
            <h2 className="text-2xl font-bold">Mr. Teacher Name</h2>
            <p className="text-gray-600">teacher@school.edu.kh</p>
          </div>
        </div>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700">
          Edit Profile
        </button>
      </div>
    </div>
  );
}