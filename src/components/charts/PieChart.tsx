import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface PieChartDataPoint {
  name: string;
  value?: number;
  color?: string;
  percentage?: any;
  count?: number;
}

export interface PieChartProps {
  data: PieChartDataPoint[];
  nameKey?: any;
  dataKey? : any;
  title?: string;
  description?: string;
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  innerRadius?: number;
  outerRadius?: number;
  showLabels?: boolean;
  className?: string;
}

const CustomTooltip: React.FC<any> = ({ active, payload }: {active: any, payload: any}) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3">
        <div className="flex items-center gap-2 text-sm">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.payload.fill }}
          />
          <span className="text-muted-foreground">{data.name}:</span>
          <span className="font-semibold">{data.value}</span>
        </div>
      </div>
    );
  }
  return null;
};

const renderLabel = (entry: any) => {
  return `${entry.name}: ${entry.value}`;
};

export const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  nameKey,
  description,
  height = 350,
  showLegend = true,
  showTooltip = true,
  innerRadius = 0,
  outerRadius = 80,
  showLabels = false,
  className,
}) => {
  const defaultColors = [
    'hsl(var(--primary))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];

  const chartData = data.map((item, index) => ({
    ...item,
    color: item.color || defaultColors[index % defaultColors.length],
  }));

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <RechartsPieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={showLabels}
              label={showLabels ? renderLabel : false}
              outerRadius={outerRadius}
              innerRadius={innerRadius}
              fill="hsl(var(--primary))"
              dataKey="value"
              animationBegin={0}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            {showLegend && (
              <Legend
                wrapperStyle={{ fontSize: '12px' }}
                iconType="circle"
                verticalAlign="bottom"
                align="center"
              />
            )}
          </RechartsPieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};