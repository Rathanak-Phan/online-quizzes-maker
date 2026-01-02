// app/teacher/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  School,
  Save,
  Bell,
  Shield,
  Globe,
  Key,
  LogOut,
  Sun,
  Moon,
  Lock,
  Calendar,
} from "lucide-react";

interface TeacherProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  school?: string;
  department?: string;
  createdAt: string;
  lastLogin?: string;
  role: string;
  isValidated: boolean;
}

interface SettingsForm {
  name: string;
  email: string;
  phone: string;
  school: string;
  department: string;
  notifications: {
    email: boolean;
    push: boolean;
    quizResults: boolean;
    announcements: boolean;
  };
  privacy: {
    profileVisibility: "public" | "private" | "students-only";
    showEmail: boolean;
    showPhone: boolean;
  };
  preferences: {
    theme: "light" | "dark" | "auto";
    language: string;
    timezone: string;
  };
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [formData, setFormData] = useState<SettingsForm>({
    name: "",
    email: "",
    phone: "",
    school: "",
    department: "",
    notifications: {
      email: true,
      push: true,
      quizResults: true,
      announcements: true,
    },
    privacy: {
      profileVisibility: "students-only",
      showEmail: true,
      showPhone: false,
    },
    preferences: {
      theme: "light",
      language: "en",
      timezone: "UTC",
    },
  });
  const [activeTab, setActiveTab] = useState("profile");
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch profile data on mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/teacher/profile");
      
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setProfile(data.profile);
      
      setFormData(prev => ({
        ...prev,
        name: data.profile.name || "",
        email: data.profile.email || "",
        phone: data.profile.phone || "",
        school: data.profile.school || "",
        department: data.profile.department || "",
      }));
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      setError(err.message);
      
      // Use localStorage as fallback
      const storedData = localStorage.getItem("teacherProfile");
      if (storedData) {
        try {
          const savedProfile = JSON.parse(storedData);
          setFormData(prev => ({
            ...prev,
            name: savedProfile.name || "",
            email: savedProfile.email || "",
            phone: savedProfile.phone || "",
            school: savedProfile.school || "",
            department: savedProfile.department || "",
          }));
        } catch (e) {
          console.error("Error parsing stored profile:", e);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes(".")) {
      const [section, field] = name.split(".");
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section as keyof SettingsForm] as any,
          [field]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value
      }));
    }
  };

  // Save profile
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccessMessage("");

      // Save profile data
      const response = await fetch("/api/teacher/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to save profile");
      }

      const data = await response.json();
      setProfile(data.profile);
      
      // Also save to localStorage as backup
      localStorage.setItem("teacherProfile", JSON.stringify({
        ...formData,
        lastUpdated: new Date().toISOString()
      }));
      
      setSuccessMessage("Profile updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      console.error("Error saving profile:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const currentPassword = form.currentPassword.value;
    const newPassword = form.newPassword.value;
    const confirmPassword = form.confirmPassword.value;

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }

    try {
      setSaving(true);
      setError("");
      
      const response = await fetch("/api/teacher/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to change password");
      }

      form.reset();
      setSuccessMessage("Password changed successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Logout - simple localStorage clear
  const handleLogout = () => {
    localStorage.removeItem("teacherProfile");
    localStorage.removeItem("authToken");
    window.location.href = "/login";
  };

  // Generate initials for avatar
  const getInitials = (name: string) => {
    if (!name) return "T";
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Generate color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      'from-blue-500 to-blue-600',
      'from-green-500 to-green-600',
      'from-purple-500 to-purple-600',
      'from-pink-500 to-pink-600',
      'from-orange-500 to-orange-600',
      'from-teal-500 to-teal-600',
    ];
    
    let hash = 0;
    const nameStr = name || "Teacher";
    for (let i = 0; i < nameStr.length; i++) {
      hash = nameStr.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Mock data for demonstration
  const mockStats = {
    totalQuizzes: 24,
    totalStudents: 156,
    activeClasses: 8,
    averageRating: 4.8,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Account Settings</h1>
          <p className="text-gray-600">
            Manage your profile, preferences, and account security
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <div className="text-center mb-6">
                {/* Simplified Avatar */}
                <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${getAvatarColor(formData.name)} flex items-center justify-center text-white text-2xl font-bold mb-4 mx-auto`}>
                  {getInitials(formData.name)}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{formData.name || "Teacher Name"}</h2>
                <p className="text-gray-600 text-sm">{formData.email || "teacher@school.edu"}</p>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    profile?.isValidated 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {profile?.isValidated ? "Verified Teacher" : "Pending Verification"}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => setActiveTab("profile")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                    activeTab === "profile"
                      ? "bg-blue-50 text-blue-600"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-medium">Profile</span>
                </button>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                    activeTab === "notifications"
                      ? "bg-blue-50 text-blue-600"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <Bell className="w-5 h-5" />
                  <span className="font-medium">Notifications</span>
                </button>
                <button
                  onClick={() => setActiveTab("privacy")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                    activeTab === "privacy"
                      ? "bg-blue-50 text-blue-600"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">Privacy & Security</span>
                </button>
                <button
                  onClick={() => setActiveTab("preferences")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                    activeTab === "preferences"
                      ? "bg-blue-50 text-blue-600"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <Globe className="w-5 h-5" />
                  <span className="font-medium">Preferences</span>
                </button>
                <button
                  onClick={() => setActiveTab("password")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                    activeTab === "password"
                      ? "bg-blue-50 text-blue-600"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <Key className="w-5 h-5" />
                  <span className="font-medium">Change Password</span>
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
              <h3 className="font-semibold mb-4">Your Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">Quizzes Created</span>
                  <span className="font-bold">{mockStats.totalQuizzes}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">Total Students</span>
                  <span className="font-bold">{mockStats.totalStudents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">Active Classes</span>
                  <span className="font-bold">{mockStats.activeClasses}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">Rating</span>
                  <span className="font-bold">{mockStats.averageRating}/5.0</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Success/Error Messages */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-700">{successMessage}</p>
              </div>
            )}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Profile Information</h2>
                    <p className="text-gray-600">Update your personal details</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500">
                      Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "2024"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="you@school.edu"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+855 12 345 678"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      School/Institution
                    </label>
                    <div className="relative">
                      <School className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        name="school"
                        value={formData.school}
                        onChange={handleInputChange}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Your school name"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department/Subject
                    </label>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Mathematics Department"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bio (Optional)
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                      placeholder="Tell us about yourself, your teaching experience, or subjects you specialize in..."
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Notification Preferences</h2>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div>
                      <h3 className="font-medium text-gray-900">Email Notifications</h3>
                      <p className="text-sm text-gray-600">Receive updates via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="notifications.email"
                        checked={formData.notifications.email}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div>
                      <h3 className="font-medium text-gray-900">Push Notifications</h3>
                      <p className="text-sm text-gray-600">Browser & mobile notifications</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="notifications.push"
                        checked={formData.notifications.push}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div>
                      <h3 className="font-medium text-gray-900">Quiz Results</h3>
                      <p className="text-sm text-gray-600">When students complete quizzes</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="notifications.quizResults"
                        checked={formData.notifications.quizResults}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                    <div>
                      <h3 className="font-medium text-gray-900">Announcements</h3>
                      <p className="text-sm text-gray-600">Platform updates and news</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        name="notifications.announcements"
                        checked={formData.notifications.announcements}
                        onChange={handleInputChange}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {saving ? "Saving..." : "Save Preferences"}
                  </button>
                </div>
              </div>
            )}

            {/* Privacy & Security Tab */}
            {activeTab === "privacy" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Privacy & Security</h2>
                
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Profile Visibility</h3>
                    <div className="space-y-3">
                      {[
                        { value: "public", label: "Public", description: "Anyone can see your profile" },
                        { value: "students-only", label: "Students Only", description: "Only your students can see your profile" },
                        { value: "private", label: "Private", description: "Only you can see your profile" },
                      ].map((option) => (
                        <label key={option.value} className="flex items-start p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="privacy.profileVisibility"
                            value={option.value}
                            checked={formData.privacy.profileVisibility === option.value}
                            onChange={handleInputChange}
                            className="mt-1 mr-3"
                          />
                          <div>
                            <div className="font-medium text-gray-900">{option.label}</div>
                            <div className="text-sm text-gray-600">{option.description}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
                    <div className="space-y-4">
                      <label className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                        <div>
                          <div className="font-medium text-gray-900">Show Email Address</div>
                          <div className="text-sm text-gray-600">Allow students to see your email</div>
                        </div>
                        <input
                          type="checkbox"
                          name="privacy.showEmail"
                          checked={formData.privacy.showEmail}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                      </label>
                      <label className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                        <div>
                          <div className="font-medium text-gray-900">Show Phone Number</div>
                          <div className="text-sm text-gray-600">Allow students to see your phone number</div>
                        </div>
                        <input
                          type="checkbox"
                          name="privacy.showPhone"
                          checked={formData.privacy.showPhone}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-blue-600 rounded"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <h3 className="text-lg font-medium text-red-800 mb-2">Danger Zone</h3>
                    <p className="text-red-700 mb-4">These actions are irreversible. Please proceed with caution.</p>
                    <div className="space-y-3">
                      <button className="w-full px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium">
                        Delete Account
                      </button>
                      <button className="w-full px-4 py-3 border border-red-600 text-red-600 rounded-xl hover:bg-red-50 font-medium">
                        Request Data Export
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {saving ? "Saving..." : "Save Privacy Settings"}
                  </button>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Preferences</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Theme</h3>
                    <div className="space-y-3">
                      {[
                        { value: "light", icon: Sun, label: "Light", description: "Bright theme" },
                        { value: "dark", icon: Moon, label: "Dark", description: "Dark theme" },
                        { value: "auto", icon: Globe, label: "Auto", description: "Follow system" },
                      ].map((option) => {
                        const Icon = option.icon;
                        return (
                          <label key={option.value} className="flex items-start p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                            <input
                              type="radio"
                              name="preferences.theme"
                              value={option.value}
                              checked={formData.preferences.theme === option.value}
                              onChange={handleInputChange}
                              className="mt-1 mr-3"
                            />
                            <div className="flex items-center gap-3">
                              <Icon className="w-5 h-5 text-gray-400" />
                              <div>
                                <div className="font-medium text-gray-900">{option.label}</div>
                                <div className="text-sm text-gray-600">{option.description}</div>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Language & Region</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Language
                        </label>
                        <select
                          name="preferences.language"
                          value={formData.preferences.language}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="en">English</option>
                          <option value="km">ភាសាខ្មែរ (Khmer)</option>
                          <option value="es">Español</option>
                          <option value="fr">Français</option>
                          <option value="zh">中文</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Timezone
                        </label>
                        <select
                          name="preferences.timezone"
                          value={formData.preferences.timezone}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="UTC">UTC</option>
                          <option value="Asia/Phnom_Penh">Asia/Phnom Penh (UTC+7)</option>
                          <option value="America/New_York">America/New York (UTC-5)</option>
                          <option value="Europe/London">Europe/London (UTC+0)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <Save className="w-5 h-5" />
                    {saving ? "Saving..." : "Save Preferences"}
                  </button>
                </div>
              </div>
            )}

            {/* Change Password Tab */}
            {activeTab === "password" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">Change Password</h2>
                
                <form onSubmit={handleChangePassword} className="max-w-md space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        name="currentPassword"
                        required
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter current password"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        name="newPassword"
                        required
                        minLength={8}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter new password"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Must be at least 8 characters long
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        name="confirmPassword"
                        required
                        minLength={8}
                        className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      <Save className="w-5 h-5" />
                      {saving ? "Changing..." : "Change Password"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}