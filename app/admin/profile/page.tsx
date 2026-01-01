// app/admin/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Bell,
  Shield,
  Camera,
  Save,
  Loader2,
  Lock, // ← THIS WAS MISSING!
} from "lucide-react";
import Image from "next/image";

export default function AdminProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    notifications: true,
    twoFactor: false,
  });
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("/logo.png");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      setFormData({
        name: parsed.name || "",
        email: parsed.email || "",
        phone: parsed.phone || "",
        bio: parsed.bio || "",
        notifications: parsed.notifications ?? true,
        twoFactor: parsed.twoFactor ?? false,
      });
      setPreview(parsed.profile_image || "/logo.png");
    }
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatar(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("bio", formData.bio);
    data.append("notifications", formData.notifications.toString());
    data.append("twoFactor", formData.twoFactor.toString());
    if (avatar) data.append("avatar", avatar);

    try {
      const res = await fetch("/api/admin/update-profile", {
        method: "POST",
        body: data,
      });

      const result = await res.json();

      if (res.ok) {
        const updatedUser = {
          ...user,
          ...formData,
          profile_image: result.avatarUrl || preview,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        setMessage("Profile updated successfully!");
      } else {
        setMessage(result.error || "Update failed");
      }
    } catch (err) {
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new !== passwordData.confirm) {
      setMessage("New passwords do not match");
      return;
    }

    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordData),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Password changed successfully!");
        setPasswordData({ current: "", new: "", confirm: "" });
      } else {
        setMessage(data.error || "Password change failed");
      }
    } catch (err) {
      setMessage("Network error");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Admin Profile</h1>
        <p className="text-lg text-gray-600 mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Avatar & Basic Info */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg">
              <Image
                src={preview}
                alt="Profile"
                width={160}
                height={160}
                className="object-cover w-full h-full"
              />
            </div>
            <label className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition">
              <Camera className="w-10 h-10 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-900">
              {formData.name || "Admin"}
            </h2>
            <p className="text-xl text-gray-600">{formData.email}</p>
            <span className="inline-block mt-3 px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-full font-semibold">
              Administrator
            </span>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form
        onSubmit={handleProfileUpdate}
        className="bg-white rounded-xl shadow-lg p-8 space-y-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <User className="w-8 h-8 text-blue-600" />
          Personal Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Phone className="inline w-5 h-5 mr-2" />
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="+855 12 345 678"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              rows={4}
              placeholder="Tell us about yourself..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-4 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.notifications}
              onChange={(e) =>
                setFormData({ ...formData, notifications: e.target.checked })
              }
              className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500"
            />
            <div>
              <p className="font-medium text-gray-900 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Email Notifications
              </p>
              <p className="text-sm text-gray-600">
                Receive alerts about important platform events
              </p>
            </div>
          </label>

          <label className="flex items-center gap-4 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.twoFactor}
              onChange={(e) =>
                setFormData({ ...formData, twoFactor: e.target.checked })
              }
              className="w-6 h-6 text-blue-600 rounded focus:ring-blue-500"
            />
            <div>
              <p className="font-medium text-gray-900 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Two-Factor Authentication
              </p>
              <p className="text-sm text-gray-600">
                Add an extra layer of security to your account
              </p>
            </div>
          </label>
        </div>

        <div className="flex justify-end pt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-10 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition flex items-center gap-3 shadow-lg disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Save className="w-6 h-6" />
            )}
            {loading ? "Saving..." : "Save Profile Changes"}
          </button>
        </div>
      </form>

      {/* Password Change */}
      <form
        onSubmit={handlePasswordChange}
        className="bg-white rounded-xl shadow-lg p-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
          <Lock className="w-8 h-8 text-red-600" />
          Change Password
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.current}
              onChange={(e) =>
                setPasswordData({ ...passwordData, current: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={passwordData.new}
              onChange={(e) =>
                setPasswordData({ ...passwordData, new: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirm}
              onChange={(e) =>
                setPasswordData({ ...passwordData, confirm: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              required
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            className="bg-gradient-to-r from-red-600 to-red-700 text-white px-10 py-4 rounded-lg font-semibold hover:from-red-700 hover:to-red-800 transition shadow-lg"
          >
            Change Password
          </button>
        </div>
      </form>

      {/* Message */}
      {message && (
        <div
          className={`fixed bottom-8 right-8 px-8 py-4 rounded-xl shadow-2xl font-bold text-lg ${
            message.includes("success")
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          } animate-pulse`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
