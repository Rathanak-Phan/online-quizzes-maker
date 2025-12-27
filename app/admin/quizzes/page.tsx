import Table from "../../components/admin/Table";

export default function QuizzesPage() {
  const quizzes = [
    { Title: "Math Quiz", Questions: 10, Status: "Active" },
    { Title: "IT Basics", Questions: 15, Status: "Draft" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Manage Quizzes</h2>
      <Table headers={["Title", "Questions", "Status"]} rows={quizzes} />
    </div>
  );
}
