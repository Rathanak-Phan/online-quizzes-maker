// app/admin/components/Table.tsx
interface Column {
  key: string;
  header: string;
}

interface TableProps {
  columns: Column[];
  data: any[];
  emptyMessage?: string;
}

export default function Table({ columns, data, emptyMessage = "No data available" }: TableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.map((row, i) => (
            <tr key={i} className="hover:bg-gray-50 transition">
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 text-gray-800">
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}