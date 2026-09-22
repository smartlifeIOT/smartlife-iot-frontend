import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface UsageDonutChartProps {
  data: { name: string; value: number }[];
  percentage: number;
  colors: string[];
}

export const UsageDonutChart: React.FC<UsageDonutChartProps> = ({
  data,
  percentage,
  colors,
}) => {
  return (
    <div className="flex items-center justify-between space-y-4">
      <div className="relative flex items-center justify-center">
        <ResponsiveContainer width={100} height={120}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={50}
              dataKey="value"
              startAngle={90}
              endAngle={-270}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <span className="absolute text-2xl font-semibold text-gray-900 dark:text-white">
          {percentage}%
        </span>
      </div>
    </div>
  );
};
