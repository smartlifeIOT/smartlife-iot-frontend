import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/common/DataTable/DataTable';
import { createActionsColumn } from '@/components/common/DataTable/columns';
import {
  MapPin,
  Wifi,
  WifiOff,
  RefreshCw,
  XCircle,
  Server,
  Activity,
  Edit,
  Trash2,
} from 'lucide-react';
import { EdgeInstance } from '../types';

interface EdgeTableProps {
  edgeInstances: EdgeInstance[];
  searchQuery?: string;
}

export const EdgeTable: React.FC<EdgeTableProps> = ({
  edgeInstances,
  searchQuery = '',
}) => {
  const columns = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }: any) => (
        <div>
          <div className="font-medium">{row.getValue('name')}</div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {row.original.location}
          </div>
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }: any) => {
        const status = row.getValue('status') as string;
        const colors = {
          online: 'bg-green-500',
          offline: 'bg-gray-500',
          syncing: 'bg-yellow-500',
          error: 'bg-red-500',
        };
        const icons = {
          online: <Wifi className="h-3 w-3" />,
          offline: <WifiOff className="h-3 w-3" />,
          syncing: <RefreshCw className="h-3 w-3 animate-spin" />,
          error: <XCircle className="h-3 w-3" />,
        };
        return (
          <Badge
            className={`${colors[status as keyof typeof colors]} text-white flex items-center gap-1 w-fit`}
          >
            {icons[status as keyof typeof icons]}
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'devices',
      header: 'Devices',
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <Server className="h-4 w-4 text-muted-foreground" />
          <span>{row.getValue('devices')}</span>
        </div>
      ),
    },
    {
      accessorKey: 'version',
      header: 'Version',
      cell: ({ row }: any) => (
        <Badge variant="outline">{row.getValue('version')}</Badge>
      ),
    },
    {
      accessorKey: 'cpu',
      header: 'CPU',
      cell: ({ row }: any) => {
        const value = row.getValue('cpu') as number;
        return (
          <div className="flex items-center gap-2">
            <div className="w-16 bg-muted rounded-full h-2">
              <div
                className={`h-2 rounded-full ${value > 80 ? 'bg-red-500' : value > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${value}%` }}
              />
            </div>
            <span className="text-sm">{value}%</span>
          </div>
        );
      },
    },
    {
      accessorKey: 'dataSync',
      header: 'Data Sync',
      cell: ({ row }: any) => {
        const sync = row.getValue('dataSync') as {
          pending: number;
          lastSync: Date;
        };
        return (
          <div className="text-sm">
            {sync.pending > 0 ? (
              <span className="text-yellow-500">{sync.pending} pending</span>
            ) : (
              <span className="text-green-500">Synced</span>
            )}
          </div>
        );
      },
    },
    createActionsColumn((row) => [
      {
        label: 'View Details',
        onClick: () => {},
        icon: <Activity className="h-4 w-4" />,
      },
      { label: 'Edit', onClick: () => {}, icon: <Edit className="h-4 w-4" /> },
      {
        label: 'Restart',
        onClick: () => {},
        icon: <RefreshCw className="h-4 w-4" />,
      },
      {
        label: 'Delete',
        onClick: () => {},
        icon: <Trash2 className="h-4 w-4" />,
        variant: 'destructive' as const,
      },
    ]),
  ];

  const filteredInstances = edgeInstances.filter(
    (instance) =>
      instance.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instance.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardContent>
        <DataTable
          columns={columns}
          data={filteredInstances}
          searchKey="name"
        />
      </CardContent>
    </Card>
  );
};
