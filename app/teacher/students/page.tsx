// app/teacher/students/page.tsx
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Award,
  MoreVertical,
  Eye,
  MessageSquare,
  Download,
  Plus,
  ChevronDown,
  Loader2,
  AlertCircle,
  UserPlus,
  GraduationCap,
} from "lucide-react";

interface Student {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  enrollmentDate: string;
  classId?: string;
  className?: string;
  totalQuizzes: number;
  averageScore: number;
  lastActive: string;
  status: "active" | "inactive" | "pending";
}

export default function StudentsPage() {
  const router = useRouter();
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [classes, setClasses] = useState<string[]>([]);

  // Fetch students function
  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchTerm) params.set("search", searchTerm);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (classFilter !== "all") params.set("class", classFilter);
      params.set("sort", sortBy);

      console.log("Fetching students...");

      const response = await fetch(`/api/teacher/students?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch students");
      }

      const data = await response.json();
      console.log("Students data received:", data);

      setStudents(data.students || []);
      
      // Extract unique classes
      const uniqueClasses = Array.from(
        new Set(data.students?.map((s: Student) => s.className).filter(Boolean) || [])
      ) as string[];
      setClasses(uniqueClasses);

    } catch (err: any) {
      console.error("Error fetching students:", err);
      setError(err.message || "Failed to load students");
      
      // Fallback to mock data for development
      if (process.env.NODE_ENV === 'development') {
        console.log("Using mock student data");
        setStudents(getMockStudents());
        setClasses(["Class A", "Class B", "Class C"]);
        setError(null);
      }
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, classFilter, sortBy]);

  // Initial fetch
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Mock data for development
  function getMockStudents(): Student[] {
    return [
      {
        _id: "1",
        name: "Alex Johnson",
        email: "alex.johnson@student.edu",
        phone: "+1 (555) 123-4567",
        enrollmentDate: "2024-01-15",
        className: "Mathematics 101",
        totalQuizzes: 12,
        averageScore: 85.5,
        lastActive: "2024-03-15",
        status: "active",
      },
      {
        _id: "2",
        name: "Maria Garcia",
        email: "maria.garcia@student.edu",
        phone: "+1 (555) 234-5678",
        enrollmentDate: "2024-02-01",
        className: "Science 201",
        totalQuizzes: 8,
        averageScore: 92.3,
        lastActive: "2024-03-14",
        status: "active",
      },
      {
        _id: "3",
        name: "David Kim",
        email: "david.kim@student.edu",
        enrollmentDate: "2024-01-20",
        className: "History 301",
        totalQuizzes: 5,
        averageScore: 78.9,
        lastActive: "2024-03-10",
        status: "active",
      },
      {
        _id: "4",
        name: "Sarah Wilson",
        email: "sarah.wilson@student.edu",
        phone: "+1 (555) 345-6789",
        enrollmentDate: "2024-03-01",
        className: "Class A",
        totalQuizzes: 2,
        averageScore: 65.0,
        lastActive: "2024-03-12",
        status: "pending",
      },
      {
        _id: "5",
        name: "James Brown",
        email: "james.brown@student.edu",
        enrollmentDate: "2023-12-01",
        className: "Class B",
        totalQuizzes: 15,
        averageScore: 88.7,
        lastActive: "2024-02-28",
        status: "inactive",
      },
      {
        _id: "6",
        name: "Emma Davis",
        email: "emma.davis@student.edu",
        phone: "+1 (555) 456-7890",
        enrollmentDate: "2024-01-10",
        className: "Class C",
        totalQuizzes: 10,
        averageScore: 91.2,
        lastActive: "2024-03-15",
        status: "active",
      },
    ];
  }

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    return students
      .filter((student) => {
        const matchesSearch =
          searchTerm === "" ||
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.className?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = 
          statusFilter === "all" || student.status === statusFilter;

        const matchesClass = 
          classFilter === "all" || student.className === classFilter;

        return matchesSearch && matchesStatus && matchesClass;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "name":
            return a.name.localeCompare(b.name);
          case "score":
            return b.averageScore - a.averageScore;
          case "quizzes":
            return b.totalQuizzes - a.totalQuizzes;
          case "recent":
            return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
          default:
            return a.name.localeCompare(b.name);
        }
      });
  }, [students, searchTerm, statusFilter, classFilter, sortBy]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = students.length;
    const active = students.filter(s => s.status === "active").length;
    const averageScore = students.length > 0 
      ? students.reduce((sum, s) => sum + s.averageScore, 0) / students.length
      : 0;
    const totalQuizzes = students.reduce((sum, s) => sum + s.totalQuizzes, 0);

    return {
      total,
      active,
      averageScore,
      totalQuizzes,
      pending: students.filter(s => s.status === "pending").length,
      inactive: students.filter(s => s.status === "inactive").length,
    };
  }, [students]);

  // Handle student actions
  const handleViewProfile = (studentId: string) => {
    router.push(`/teacher/students/${studentId}`);
  };

  const handleSendMessage = (studentEmail: string) => {
    window.location.href = `mailto:${studentEmail}`;
  };

  const handleExportStudents = async () => {
    try {
      const response = await fetch("/api/teacher/students/export");
      const data = await response.json();
      
      if (data.url) {
        window.open(data.url, '_blank');
      }
    } catch (err) {
      console.error("Export failed:", err);
      alert("Export feature coming soon!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error && students.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Students</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchStudents}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Students</h1>
              <p className="text-gray-600">
                Manage and track your students' progress and performance.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleExportStudents}
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              <Link
                href="/teacher/students/invite"
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all hover:shadow-blue-500/25"
              >
                <UserPlus className="w-5 h-5" />
                Invite Students
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">+{stats.active} active</span>
              <span className="mx-2">•</span>
              <span className="text-gray-500">{stats.pending} pending</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageScore.toFixed(1)}%</p>
              </div>
              <Award className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Across all quizzes
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Quizzes Taken</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalQuizzes}</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-500" />
            </div>
            <div className="mt-4 text-sm text-gray-500">
              All student attempts
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
              <GraduationCap className="w-8 h-8 text-orange-500" />
            </div>
            <div className="mt-4 text-sm text-gray-500">
              Currently enrolled
            </div>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students by name, email, or class..."
                  className="w-full pl-11 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  className="pl-9 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  className="pl-9 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                >
                  <option value="all">All Classes</option>
                  {classes.map((className) => (
                    <option key={className} value={className}>
                      {className}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>

              <select
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Name A-Z</option>
                <option value="score">Highest Score</option>
                <option value="quizzes">Most Quizzes</option>
                <option value="recent">Recently Active</option>
              </select>
            </div>
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Student Directory ({filteredStudents.length})
            </h2>
            <div className="text-sm text-gray-500">
              Showing {filteredStudents.length} of {students.length} students
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Performance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {student.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {student.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Joined {new Date(student.enrollmentDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center gap-1 mb-1">
                          <Mail className="w-3 h-3" />
                          {student.email}
                        </div>
                        {student.phone && (
                          <div className="flex items-center gap-1 text-gray-500">
                            <Phone className="w-3 h-3" />
                            {student.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {student.className || "No class assigned"}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Average Score</span>
                          <span className={`text-sm font-medium ${
                            student.averageScore >= 80 ? 'text-green-600' :
                            student.averageScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {student.averageScore.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Quizzes Taken</span>
                          <span className="text-sm font-medium text-gray-900">
                            {student.totalQuizzes}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Last active: {new Date(student.lastActive).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.status === 'active' 
                          ? 'bg-green-100 text-green-800'
                          : student.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewProfile(student._id)}
                          className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleSendMessage(student.email)}
                          className="text-green-600 hover:text-green-900 flex items-center gap-1"
                          title="Send Message"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredStudents.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || statusFilter !== "all" || classFilter !== "all"
                  ? "No matching students found"
                  : "No students yet"}
              </h3>
              <p className="text-gray-600 mb-4 max-w-md mx-auto">
                {searchTerm || statusFilter !== "all" || classFilter !== "all"
                  ? "Try adjusting your filters or search terms"
                  : "Start by inviting students to your classes"}
              </p>
              <Link
                href="/teacher/students/invite"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <UserPlus className="w-4 h-4" />
                Invite Students
              </Link>
            </div>
          )}
        </div>

        {/* Student Cards View (Alternative) - Hidden by default, can be toggled */}
        <div className="hidden mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.slice(0, 6).map((student) => (
              <div key={student._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-lg">
                        {student.name.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <h3 className="font-semibold text-gray-900">{student.name}</h3>
                      <p className="text-sm text-gray-500">{student.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    student.status === 'active' 
                      ? 'bg-green-100 text-green-800'
                      : student.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {student.status}
                  </span>
                </div>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Class</span>
                    <span className="text-sm font-medium">{student.className || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Average Score</span>
                    <span className={`text-sm font-medium ${
                      student.averageScore >= 80 ? 'text-green-600' :
                      student.averageScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {student.averageScore.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Quizzes Taken</span>
                    <span className="text-sm font-medium">{student.totalQuizzes}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewProfile(student._id)}
                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => handleSendMessage(student.email)}
                    className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100"
                  >
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}