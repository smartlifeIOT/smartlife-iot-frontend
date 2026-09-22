import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MemoryStick, HardDrive } from 'lucide-react';
import { GaugeChart } from '@/components/charts/GaugeChart';
import { EdgeInstance } from '../types';

interface EdgeResourceUsageProps {
  edgeInstances: EdgeInstance[];
}

export const EdgeResourceUsage: React.FC<EdgeResourceUsageProps> = ({ edgeInstances }) => {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {edgeInstances
        .filter((i) => i.status === 'online')
        .slice(0, 3)
        .map((instance) => (
          <Card key={instance.id}>
            <CardHeader>
              <CardTitle className="text-base">{instance.name}</CardTitle>
              <CardDescription>{instance.location}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <GaugeChart value={instance.cpu} title="CPU" unit="%" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MemoryStick className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Memory</span>
                  </div>
                  <div className="text-2xl font-bold">{instance.memory}%</div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Storage</span>
                  </div>
                  <div className="text-2xl font-bold">
                    {instance.storage}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
    </div>
  );
};
