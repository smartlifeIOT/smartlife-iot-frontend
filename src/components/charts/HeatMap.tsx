import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface HeatMapDataPoint {
  x: string | number;
  y: string | number;
  value: number;
}

export interface HeatMapProps {
  data: HeatMapDataPoint[];
  title?: string;
  description?: string;
  xLabels?: string[];
  yLabels?: string[];
  minValue?: number;
  maxValue?: number;
  colorScheme?: 'blue' | 'green' | 'red' | 'purple' | 'custom';
  customColors?: string[];
  showValues?: boolean;
  cellSize?: number;
  className?: string;
}

export const HeatMap: React.FC<HeatMapProps> = ({
  data,
  title,
  description,
  xLabels = [],
  yLabels = [],
  minValue,
  maxValue,
  colorScheme = 'purple',
  customColors,
  showValues = true,
  cellSize = 50,
  className,
}) => {
  // Calculate min and max if not provided
  const values = data.map(d => d.value);
  const min = minValue ?? Math.min(...values);
  const max = maxValue ?? Math.max(...values);

  // Color schemes
  const colorSchemes = {
    blue: ['#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'],
    green: ['#f0fdf4', '#dcfce7', '#bbf7d0', '#86efac', '#4ade80', '#22c55e', '#16a34a', '#15803d'],
    red: ['#fef2f2', '#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c'],
    purple: ['#faf5ff', '#f3e8ff', '#e9d5ff', '#d8b4fe', '#c084fc', '#a855f7', '#9333ea', '#7e22ce'],
    custom: customColors || [],
  };

  const colors = colorSchemes[colorScheme] || colorSchemes.purple;

  // Get color for value
  const getColor = (value: number): string => {
    if (max === min) return colors[0];
    const normalized = (value - min) / (max - min);
    const index = Math.min(Math.floor(normalized * colors.length), colors.length - 1);
    return colors[index];
  };

  // Get unique x and y values if labels not provided
  const uniqueX = xLabels.length > 0 ? xLabels : [...new Set(data.map(d => String(d.x)))];
  const uniqueY = yLabels.length > 0 ? yLabels : [...new Set(data.map(d => String(d.y)))];

  // Create a map for quick lookup
  const dataMap = new Map<string, number>();
  data.forEach(d => {
    dataMap.set(`${d.x}-${d.y}`, d.value);
  });

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Heat Map Grid */}
            <div className="flex">
              {/* Y-axis labels */}
              <div className="flex flex-col justify-around pr-2">
                {uniqueY.map((label, index) => (
                  <div
                    key={index}
                    className="text-xs text-muted-foreground text-right"
                    style={{ height: cellSize }}
                  >
                    <div className="flex items-center justify-end h-full">
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div>
                {/* X-axis labels */}
                <div className="flex mb-2">
                  {uniqueX.map((label, index) => (
                    <div
                      key={index}
                      className="text-xs text-muted-foreground text-center"
                      style={{ width: cellSize }}
                    >
                      {label}
                    </div>
                  ))}
                </div>

                {/* Cells */}
                {uniqueY.map((y, yIndex) => (
                  <div key={yIndex} className="flex">
                    {uniqueX.map((x, xIndex) => {
                      const value = dataMap.get(`${x}-${y}`) ?? 0;
                      const color = getColor(value);
                      
                      return (
                        <div
                          key={xIndex}
                          className="border border-border transition-all hover:opacity-80 flex items-center justify-center group relative"
                          style={{
                            width: cellSize,
                            height: cellSize,
                            backgroundColor: color,
                          }}
                        >
                          {showValues && (
                            <span className="text-xs font-medium">
                              {value.toFixed(1)}
                            </span>
                          )}
                          
                          {/* Tooltip on hover */}
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                            {x} - {y}: {value.toFixed(2)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{min.toFixed(1)}</span>
              <div className="flex flex-1 h-4 rounded overflow-hidden">
                {colors.map((color, index) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: color,
                      flex: 1,
                    }}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{max.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};