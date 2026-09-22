import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface GaugeChartProps {
  value: number;
  min?: number;
  max?: number;
  title?: string;
  description?: string;
  unit?: string;
  size?: number;
  thickness?: number;
  color?: string;
  backgroundColor?: string;
  showValue?: boolean;
  className?: string;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  min = 0,
  max = 100,
  title,
  description,
  unit = '',
  size = 200,
  thickness = 20,
  color = 'hsl(var(--primary))',
  backgroundColor = 'hsl(var(--muted))',
  showValue = true,
  className,
}) => {
  const normalizedValue = Math.min(Math.max(value, min), max);
  const percentage = ((normalizedValue - min) / (max - min)) * 100;
  const angle = (percentage / 100) * 270 - 135; // -135 to 135 degrees
  
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * (circumference * 0.75);

  // Determine color based on value
  const getColor = () => {
    if (percentage >= 80) return 'hsl(var(--destructive))';
    if (percentage >= 60) return 'hsl(var(--warning))';
    if (percentage >= 40) return 'hsl(var(--primary))';
    return 'hsl(var(--success))';
  };

  const gaugeColor = color === 'hsl(var(--primary))' ? getColor() : color;

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="flex justify-center">
        <div className="relative" style={{ width: size, height: size }}>
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="transform -rotate-90"
          >
            {/* Background Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={backgroundColor}
              strokeWidth={thickness}
              strokeDasharray={`${circumference * 0.75} ${circumference}`}
              strokeLinecap="round"
            />
            
            {/* Value Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={gaugeColor}
              strokeWidth={thickness}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          
          {/* Center Content */}
          {showValue && (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold" style={{ color: gaugeColor }}>
                {normalizedValue.toFixed(0)}
              </div>
              {unit && (
                <div className="text-sm text-muted-foreground mt-1">
                  {unit}
                </div>
              )}
              <div className="text-xs text-muted-foreground mt-2">
                {percentage.toFixed(0)}%
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};