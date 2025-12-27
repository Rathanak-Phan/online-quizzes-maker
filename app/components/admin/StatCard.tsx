interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  textColor: string; 
}

export default function StatCard({
  title,
  value,
  icon,
  color,
  textColor,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {value}
          </p>
        </div>
        <div className={`p-4 ${color} rounded-xl`}>{icon}</div>
      </div>
    </div>
  );
}
