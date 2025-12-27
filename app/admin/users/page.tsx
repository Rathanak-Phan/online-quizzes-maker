export default function UsersPage() {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Users</h2>

      <table className="w-full bg-white rounded shadow">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2">Role</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-t">
            <td className="p-2">John Doe</td>
            <td className="p-2 text-center">Teacher</td>
            <td className="p-2 text-center">
              <a href="/admin/users/1" className="text-blue-500">
                View
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
