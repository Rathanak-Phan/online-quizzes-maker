// app/components/results/ResultsChart.tsx
"use client";

interface ScoreDistribution {
  range: string;
  count: number;
  min: number;
  max: number;
}

interface ResultsChartProps {
  distribution: ScoreDistribution[];
}

export function ResultsChart({ distribution }: ResultsChartProps) {
  const maxCount = Math.max(...distribution.map(d => d.count));

  return (
    <div className="space-y-4">
      {distribution.map((item) => {
        const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
        
        return (
          <div key={item.range} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium text-gray-700">{item.range}%</span>
              <span className="text-gray-600">{item.count} students</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}