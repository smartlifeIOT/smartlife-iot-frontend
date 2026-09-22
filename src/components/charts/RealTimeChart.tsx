import React, { useEffect, useState, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pause, Play } from 'lucide-react';

export interface RealTimeDataPoint {
  time: string;
  value: number;
  [key: string]: string | number;
}

export interface RealTimeChartProps {
  title?: string;
  description?: string;
  dataKey?: string;
  maxDataPoints?: number;
  updateInterval?: number;
  dataGenerator?: () => number;
  height?: number;
  strokeColor?: string;
  showControls?: boolean;
  className?: string;
}

const CustomTooltip: React.FC<any> = ({ active, payload }: {active: any, payload: any}) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium">{payload[0].payload.time}</p>
        <div className="flex items-center gap-2 text-sm mt-1">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: payload[0].color }}
          />
          <span className="text-muted-foreground">Value:</span>
          <span className="font-semibold">{payload[0].value?.toFixed(2)}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const RealTimeChart: React.FC<RealTimeChartProps> = ({
  title = 'Real-Time Data',
  description,
  dataKey = 'value',
  maxDataPoints = 20,
  updateInterval = 1000,
  dataGenerator,
  height = 300,
  strokeColor = 'hsl(var(--primary))',
  showControls = true,
  className,
}) => {
  const [data, setData] = useState<RealTimeDataPoint[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const [currentValue, setCurrentValue] = useState<number>(0);

  // Default data generator
  const defaultDataGenerator = useCallback(() => {
    return Math.random() * 100;
  }, []);

  const generator = dataGenerator || defaultDataGenerator;

  // Add new data point
  const addDataPoint = useCallback(() => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    
    const value = generator();
    setCurrentValue(value);

    setData((prev: any) => {
      const newData = [
        ...prev,
        {
          time: timeString,
          [dataKey]: value,
        },
      ];
      
      // Keep only the last maxDataPoints
      return newData.slice(-maxDataPoints);
    });
  }, [generator, dataKey, maxDataPoints]);

  // Update data at interval
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      addDataPoint();
    }, updateInterval);

    return () => clearInterval(interval);
  }, [isRunning, addDataPoint, updateInterval]);

  // Initialize with some data
  useEffect(() => {
    const initialData: any = [];
    const now = new Date();
    
    for (let i = maxDataPoints - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - i * updateInterval);
      const timeString = time.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      
      initialData.push({
        time: timeString,
        [dataKey]: generator(),
      });
    }
    
    setData(initialData);
  }, []);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Current:</span>
              <Badge variant="outline" className="font-mono">
                {currentValue.toFixed(2)}
              </Badge>
            </div>
            {showControls && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRunning(!isRunning)}
              >
                {isRunning ? (
                  <>
                    <Pause className="h-4 w-4 mr-1" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" />
                    Resume
                  </>
                )}
              </Button>
            )}
            <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-success animate-pulse' : 'bg-muted'}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.3}
            />
            <XAxis
              dataKey="time"
              stroke="hsl(var(--muted-foreground))"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              domain={[0, 100]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={strokeColor}
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};