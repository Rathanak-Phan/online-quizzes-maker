interface TableProps {
  headers: string[];
  rows: any[];
}

export default function Table({ headers, rows }: TableProps) {
  return (
    <table className="w-full bg-white rounded shadow overflow-hidden">
      <thead className="bg-gray-200">
        <tr>
          {headers.map((h) => (
            <th key={h} className="p-3 text-left">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-t hover:bg-gray-50">
            {Object.values(row).map((v, j) => (
              <td key={j} className="p-3">{v}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
