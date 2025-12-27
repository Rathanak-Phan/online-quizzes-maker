import Table from "../../components/admin/Table";

export default function SubmissionsPage() {
  const submissions = [
    { Student: "Mey Mey", Quiz: "Math Quiz", Score: "8/10" },
    { Student: "Rathanak", Quiz: "IT Basics", Score: "14/15" },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Submissions</h2>
      <Table headers={["Student", "Quiz", "Score"]} rows={submissions} />
    </div>
  );
}
