import UserManagement from "../components/admin/UserManagement";

export default function AdminDashboard() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Overview</h2>
      <UserManagement />
    </div>
  );
}
