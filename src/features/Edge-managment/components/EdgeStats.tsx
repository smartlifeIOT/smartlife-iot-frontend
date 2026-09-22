import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Server, CheckCircle2, Activity, Cpu } from 'lucide-react';
import { EdgeInstance } from '../types';

interface EdgeStatsProps {
  edgeInstances: EdgeInstance[];
}

export const EdgeStats: React.FC<EdgeStatsProps> = ({ edgeInstances }) => {
  const onlineCount = edgeInstances.filter((i) => i.status === 'online').length;
  const totalDevices = edgeInstances.reduce((sum, i) => sum + i.devices, 0);
  const avgCpu =
    edgeInstances.length > 0
      ? Math.round(
          edgeInstances.reduce((sum, i) => sum + i.cpu, 0) /
            edgeInstances.length
        )
      : 0;

  return (
    <div className="grid gap-6 md:grid-cols-4">
      <Card className="bg-primary">
        <CardHeader className="flex  flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">
            Total Edge Instances
          </CardTitle>
          <Server className="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {edgeInstances.length}
          </div>
          <p className="text-xs text-white">Edge computing nodes</p>
        </CardContent>
      </Card>

      <Card className="bg-secondary">
        <CardHeader className="flex  flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">
            Online Edge Instances
          </CardTitle>
          <CheckCircle2 className="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{onlineCount}</div>
          <p className="text-xs text-white">Active instances</p>
        </CardContent>
      </Card>

      <Card className="bg-success">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">
            Total Devices
          </CardTitle>
          <Activity className="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{totalDevices}</div>
          <p className="text-xs text-white">Connected devices</p>
        </CardContent>
      </Card>

      <Card className=" ">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg CPU Usage</CardTitle>
          <Cpu className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{avgCpu}%</div>
          <p className="text-xs text-muted-foreground">Across all instances</p>
        </CardContent>
      </Card>
    </div>
  );
};
