"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  UserCheck,
  CheckCircle,
  Loader2,
  GraduationCap,
  ClipboardList,
  BookOpen,
  School,
  Users,
  FileText,
} from "lucide-react";
import StatCard from "./StatCard";

interface User {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "Teacher" | "Student";
  status: "Active" | "Pending";
}

const initialUsers: User[] = [
  { id: 1, name: "Sarah Teacher", email: "sarah@edu.com", role: "Teacher", status: "Pending" },
  { id: 2, name: "John Student", email: "john@stu.edu", role: "Student", status: "Active" },
  { id: 3, name: "Mike Admin", email: "admin@quiz.com", role: "Admin", status: "Active" },
  { id: 4, name: "Emily Rose", email: "emily@csu.edu", role: "Student", status: "Active" },
  { id: 5, name: "David Chen", email: "david@stu.edu", role: "Student", status: "Active" },
];

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "Student" as "Admin" | "Teacher" | "Student",
    status: "Pending" as "Active" | "Pending",
  });
  const [isApproving, setIsApproving] = useState<number | null>(null);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalUsers = users.length;
  const activeTeachers = users.filter((u) => u.role === "Teacher" && u.status === "Active").length;
  const pendingReviews = users.filter((u) => u.status === "Pending").length;

  const handleAddUser = () => {
    if (newUser.name && newUser.email) {
      setUsers([...users, { ...newUser, id: users.length + 1 }]);
      setIsAddModalOpen(false);
      setNewUser({ name: "", email: "", role: "Student", status: "Pending" });
    }
  };

  const handleEditUser = () => {
    if (selectedUser) {
      setUsers(users.map((u) => (u.id === selectedUser.id ? selectedUser : u)));
      setIsEditModalOpen(false);
      setSelectedUser(null);
    }
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setIsDeleteConfirmOpen(false);
      setSelectedUser(null);
    }
  };

  const handleApproveUser = (userId: number) => {
    setIsApproving(userId);
    setTimeout(() => {
      setUsers(users.map((u) => (u.id === userId ? { ...u, status: "Active" } : u)));
      setIsApproving(null);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white"> {/* Pure white background - dark mode removed for clean white look */}
      <div className="w-full">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 p-6 lg:p-8">
          <StatCard title="Total Users" value={totalUsers} icon={<UserCheck className="w-8 h-8" />} color="bg-blue-100" textColor="text-blue-600" />
          <StatCard title="Active Teachers" value={activeTeachers} icon={<GraduationCap className="w-8 h-8" />} color="bg-green-100" textColor="text-green-600" />
          <StatCard title="Pending Reviews" value={pendingReviews} icon={<ClipboardList className="w-8 h-8" />} color="bg-amber-100" textColor="text-amber-600" />
          <StatCard title="Total Quizzes" value={56} icon={<BookOpen className="w-8 h-8" />} color="bg-purple-100" textColor="text-purple-600" />
          <StatCard title="Total Classes" value={18} icon={<School className="w-8 h-8" />} color="bg-teal-100" textColor="text-teal-600" />
          <StatCard title="Total Students" value={342} icon={<Users className="w-8 h-8" />} color="bg-indigo-100" textColor="text-indigo-600" />
          <StatCard title="Total Submissions" value={1247} icon={<FileText className="w-8 h-8" />} color="bg-pink-100" textColor="text-pink-600" />
          <StatCard title="Avg. Completion Rate" value="78%" icon={<FileText className="w-8 h-8" />} color="bg-orange-100" textColor="text-orange-600" />
        </div>

        {/* User Table Section */}
        <div className="px-6 lg:px-8 mb-10">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  User Management
                </h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by name, email or role..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 w-full sm:w-80"
                    />
                  </div>
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
                  >
                    <Plus className="w-5 h-5" />
                    Add User
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-semibold">
                            {user.name.split(" ").map((n) => n[0]).join("")}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 text-xs font-medium rounded-full ${
                              user.status === "Active"
                                ? "bg-green-100 text-green-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {user.status}
                          </span>
                          {user.status === "Pending" && user.role === "Teacher" && (
                            <button
                              onClick={() => handleApproveUser(user.id)}
                              disabled={isApproving === user.id}
                              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
                            >
                              {isApproving === user.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                              Approve
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setIsEditModalOpen(true);
                            }}
                            className="text-gray-400 hover:text-blue-600"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setIsDeleteConfirmOpen(true);
                            }}
                            className="text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing {filteredUsers.length} of {totalUsers} users
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals - White background */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Add New User</h3>
            <input type="text" placeholder="Name" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            <input type="email" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })} className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-lg">
              <option value="Admin">Admin</option>
              <option value="Teacher">Teacher</option>
              <option value="Student">Student</option>
            </select>
            <select value={newUser.status} onChange={(e) => setNewUser({ ...newUser, status: e.target.value as any })} className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg">
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
            </select>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={handleAddUser} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add</button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Edit User</h3>
            <input type="text" placeholder="Name" value={selectedUser.name} onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })} className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            <input type="email" placeholder="Email" value={selectedUser.email} onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })} className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            <select value={selectedUser.role} onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value as any })} className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-lg">
              <option value="Admin">Admin</option>
              <option value="Teacher">Teacher</option>
              <option value="Student">Student</option>
            </select>
            <select value={selectedUser.status} onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value as any })} className="w-full mb-4 px-4 py-2 border border-gray-300 rounded-lg">
              <option value="Active">Active</option>
              <option value="Pending">Pending</option>
            </select>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={handleEditUser} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
            </div>
          </div>
        </div>
      )}

      {isDeleteConfirmOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
            <p className="mb-4">Are you sure you want to delete {selectedUser.name}?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setIsDeleteConfirmOpen(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
              <button onClick={handleDeleteUser} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}