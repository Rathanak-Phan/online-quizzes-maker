import Table from "../components/Table";

const columns = [
  { key: "student", header: "Student" },
  { key: "quiz", header: "Quiz" },
  { key: "score", header: "Score" },
  { key: "date", header: "Date" },
];

const submissions = [
  { student: "John Doe", quiz: "Math Quiz 1", score: "92%", date: "Dec 28, 2025" },
  // more data...
];

export default function SubmissionsPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold">Submissions</h1>
      <div className="bg-white rounded-xl shadow-lg p-8">
        <Table columns={columns} data={submissions} />
      </div>
    </div>
  );
}